import { addQueryArgs } from '@wordpress/url';
import { toCSL } from 'astrocite-eutils';

import { ResponseError } from 'utils/error';

/** Promise-based to avoid async/await (regeneratorRuntime) in editor bundle. */
export function get(
    id: string,
    db: 'pubmed' | 'pmc',
): Promise<CSL.Data | ResponseError> {
    return fetch(
        addQueryArgs(
            'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi',
            {
                id,
                db,
                tool: 'academic-bloggers-toolkit',
                email: 'dereksifford@gmail.com',
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
