import { addQueryArgs } from '@wordpress/url';
import { toCSL } from 'astrocite-eutils';

import { ResponseError } from 'utils/error';

const EUTILS_PARAMS = {
    tool: 'academic-bloggers-toolkit',
    email: 'dereksifford@gmail.com',
} as const;

export interface SearchResult {
    idlist: string[];
    count: string;
}

export interface SummaryHit {
    id: string;
    title: string;
    authors: string;
    year: string;
}

interface EsummaryArticle {
    uid: string;
    title?: string;
    authors?: Array<{ name?: string }>;
    pubdate?: string;
}

/** Promise-based to avoid async/await (regeneratorRuntime) in editor bundle. */
export function search(
    term: string,
    db: 'pubmed' | 'pmc',
    retmax: number = 20,
): Promise<SearchResult> {
    return fetch(
        addQueryArgs(
            'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi',
            {
                ...EUTILS_PARAMS,
                db,
                term: term.trim(),
                retmax: String(Math.min(200, Math.max(1, retmax))),
                retmode: 'json',
            },
        ),
    ).then(response => {
        if (!response.ok) {
            throw new Error(
                `PubMed search failed: ${response.status} ${response.statusText}`,
            );
        }
        return response.json().then((json: { esearchresult?: SearchResult }) => {
            const result = json?.esearchresult;
            if (!result || !Array.isArray(result.idlist)) {
                return { idlist: [], count: '0' };
            }
            return {
                idlist: result.idlist,
                count: result.count != null ? String(result.count) : '0',
            };
        });
    });
}

/** Fetch minimal article info for search result list (batch esummary). */
export function getSummaries(
    idlist: string[],
    db: 'pubmed' | 'pmc',
): Promise<SummaryHit[]> {
    if (idlist.length === 0) return Promise.resolve([]);
    const ids = idlist.slice(0, 200).join(',');
    return fetch(
        addQueryArgs(
            'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi',
            {
                ...EUTILS_PARAMS,
                id: ids,
                db,
                version: '2.0',
                retmode: 'json',
            },
        ),
    )
        .then(response => {
            if (!response.ok) throw new Error('Summary fetch failed');
            return response.json();
        })
        .then((json: { result?: { uids?: string[]; [key: string]: unknown } }) => {
            const result = json?.result;
            const uids = result?.uids ?? [];
            return uids
                .map((uid: string) => {
                    const art = (result?.[uid] ?? {}) as EsummaryArticle;
                    const authors = (art.authors ?? [])
                        .map(a => a.name ?? '')
                        .filter(Boolean)
                        .join(', ');
                    const pubdate = art.pubdate ?? '';
                    const year = pubdate.slice(0, 4);
                    return {
                        id: art.uid ?? uid,
                        title: (art.title ?? '').trim() || `(${uid})`,
                        authors,
                        year: /^\d{4}$/.test(year) ? year : '',
                    };
                })
                .filter((hit: SummaryHit) => hit.id);
        });
}

/** Promise-based to avoid async/await (regeneratorRuntime) in editor bundle. */
export function get(
    id: string,
    db: 'pubmed' | 'pmc',
): Promise<CSL.Data | ResponseError> {
    return fetch(
        addQueryArgs(
            'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi',
            {
                ...EUTILS_PARAMS,
                id,
                db,
                version: '2.0',
                retmode: 'json',
            },
        ),
    ).then(response => {
        if (!response.ok) {
            return new ResponseError(id, response);
        }
        return response.json().then(json => {
            const data = toCSL(json)[0];
            return data instanceof Error ? new ResponseError(id, response) : data;
        });
    });
}
