import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { pubmed, type SummaryHit } from 'utils/resolvers';
import { ResponseError } from 'utils/error';

import styles from './style.scss';

interface Props {
    onError(message: string): void;
    onSubmit(data: CSL.Data): void;
    setBusy(busy: boolean): void;
}

const RETMAX = 20;

export default function ReferenceFormSearch({
    onError,
    onSubmit,
    setBusy,
}: Props) {
    const [db, setDb] = useState<'pubmed' | 'pmc'>('pubmed');
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState<SummaryHit[]>([]);
    const [addingId, setAddingId] = useState<string | null>(null);

    const runSearch = () => {
        const term = query.trim();
        if (!term) return;
        setSearching(true);
        setBusy(true);
        pubmed
            .search(term, db, RETMAX)
            .then(({ idlist }) => {
                if (idlist.length === 0) {
                    setResults([]);
                    onError(
                        __(
                            'No results found. Try different keywords.',
                            'academic-bloggers-toolkit',
                        ),
                    );
                    return;
                }
                return pubmed.getSummaries(idlist, db).then(setResults);
            })
            .catch(err => {
                onError(
                    err && err.message ? err.message : String(err),
                );
                setResults([]);
            })
            .finally(() => {
                setSearching(false);
                setBusy(false);
            });
    };

    const onAdd = (hit: SummaryHit) => {
        setAddingId(hit.id);
        setBusy(true);
        pubmed
            .get(hit.id, db)
            .then(data => {
                if (data instanceof ResponseError) {
                    onError(
                        __(
                            'Unable to retrieve reference for this result.',
                            'academic-bloggers-toolkit',
                        ),
                    );
                    return;
                }
                onSubmit(data);
            })
            .catch(err => {
                onError(
                    err && err.message ? err.message : String(err),
                );
            })
            .finally(() => {
                setAddingId(null);
                setBusy(false);
            });
    };

    const idLabel = db === 'pmc' ? __('PMCID', 'academic-bloggers-toolkit') : __('PMID', 'academic-bloggers-toolkit');

    return (
        <div className={styles.container}>
            <div className={styles.searchBar}>
                <select
                    aria-label={__('Database', 'academic-bloggers-toolkit')}
                    value={db}
                    onChange={e =>
                        setDb(e.currentTarget.value as 'pubmed' | 'pmc')
                    }
                >
                    <option value="pubmed">
                        {__('PubMed', 'academic-bloggers-toolkit')}
                    </option>
                    <option value="pmc">
                        {__('PMC', 'academic-bloggers-toolkit')}
                    </option>
                </select>
                <input
                    type="text"
                    className={styles.input}
                    placeholder={__(
                        'Search by keyword…',
                        'academic-bloggers-toolkit',
                    )}
                    value={query}
                    onChange={e => setQuery(e.currentTarget.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            runSearch();
                        }
                    }}
                    disabled={searching}
                />
                <Button
                    isPrimary={query.trim().length > 0}
                    onClick={runSearch}
                    isBusy={searching}
                    disabled={searching || !query.trim()}
                >
                    {__('Search', 'academic-bloggers-toolkit')}
                </Button>
            </div>
            {results.length > 0 && (
                <ul className={styles.resultList} aria-label={__('Search results', 'academic-bloggers-toolkit')}>
                    {results.map(hit => (
                        <li key={hit.id} className={styles.resultItem}>
                            <div className={styles.resultContent}>
                                <span className={styles.resultId}>
                                    {idLabel} {hit.id}
                                </span>
                                <span className={styles.resultTitle}>
                                    {hit.title}
                                </span>
                                {(hit.authors || hit.year) && (
                                    <span className={styles.resultMeta}>
                                        {[hit.authors, hit.year]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </span>
                                )}
                            </div>
                            <Button
                                isPrimary
                                isSmall
                                onClick={() => onAdd(hit)}
                                disabled={addingId !== null}
                                isBusy={addingId === hit.id}
                            >
                                {__('Add', 'academic-bloggers-toolkit')}
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
