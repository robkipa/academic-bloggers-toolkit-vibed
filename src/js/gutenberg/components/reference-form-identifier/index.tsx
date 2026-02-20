import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import { IdentifierKind } from 'utils/constants';
import { ResponseError } from 'utils/error';
import { doi, isbn, pubmed, url } from 'utils/resolvers';

import styles from './style.scss';

const PATTERNS: { readonly [k in IdentifierKind]: string } = {
    doi: '10\\.[^ ]+',
    isbn: '[0-9\\-]+',
    pmcid: 'PMC[0-9]+',
    pmid: '[0-9]+',
    url: 'https?://.+',
};

/** Promise-based to avoid async/await (regeneratorRuntime) in editor bundle. */
function fetchData(
    kind: IdentifierKind,
    value: string,
): Promise<CSL.Data> {
    let p: Promise<CSL.Data | ResponseError>;
    switch (kind) {
        case IdentifierKind.DOI:
            p = doi.get(value);
            break;
        case IdentifierKind.ISBN:
            p = isbn.get(value);
            break;
        case IdentifierKind.PMCID:
            p = pubmed.get(value, 'pmc');
            break;
        case IdentifierKind.PMID:
            p = pubmed.get(value, 'pubmed');
            break;
        case IdentifierKind.URL:
            p = url.get(value);
            break;
        default:
            return Promise.reject(
                new Error(
                    sprintf(
                        __(
                            'Invalid indentifier type: %s',
                            'academic-bloggers-toolkit',
                        ),
                        value,
                    ),
                ),
            );
    }
    return p.then(response => {
        if (response instanceof ResponseError) {
            throw new Error(
                sprintf(
                    __(
                        'Unable to retrieve data for identifier: %s',
                        'academic-bloggers-toolkit',
                    ),
                    response.resource,
                ),
            );
        }
        return response;
    });
}

interface Props {
    id: string;
    onClose(): void;
    onError(message: string): void;
    onSubmit(data: CSL.Data): void;
    setBusy(busy: boolean): void;
}

interface UIDispatch {
    setIdentifierKind?(kind: IdentifierKind): void;
}

export default function IdentifierForm(props: Props) {
    const uiDispatch = useDispatch('abt/ui') as UIDispatch | undefined;
    const setIdentifierKind = uiDispatch?.setIdentifierKind ?? (() => void 0);
    const storeKind = (useSelect as unknown as (cb: (select: (key: string) => unknown) => IdentifierKind, deps: unknown[]) => IdentifierKind)(
        (select: (key: string) => unknown) => {
            try {
                return (select('abt/ui') as unknown as { getIdentifierKind: () => IdentifierKind }).getIdentifierKind();
            } catch {
                return IdentifierKind.DOI;
            }
        },
        [],
    );
    const [kind, setKindState] = useState<IdentifierKind>(storeKind);
    useEffect(() => {
        setKindState(storeKind);
    }, [storeKind]);
    const setKind = (next: IdentifierKind) => {
        setKindState(next);
        setIdentifierKind(next);
    };

    const [value, setValue] = useState('');

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const { id, onClose, setBusy, onSubmit, onError } = props;

    return (
        <form
            className={styles.form}
            id={id}
            onSubmit={e => {
                e.preventDefault();
                setBusy(true);
                fetchData(kind, value)
                    .then(data => {
                        onSubmit(data);
                    })
                    .catch(err => {
                        onError(err && err.message ? err.message : String(err));
                        onClose();
                    });
            }}
        >
            <select
                required
                value={kind}
                onChange={e => {
                    setKind(e.currentTarget.value as IdentifierKind);
                }}
            >
                <option value={IdentifierKind.DOI}>
                    {__('DOI', 'academic-bloggers-toolkit')}
                </option>
                <option value={IdentifierKind.ISBN}>
                    {__('ISBN', 'academic-bloggers-toolkit')}
                </option>
                <option value={IdentifierKind.PMCID}>
                    {__('PMCID', 'academic-bloggers-toolkit')}
                </option>
                <option value={IdentifierKind.PMID}>
                    {__('PMID', 'academic-bloggers-toolkit')}
                </option>
                <option value={IdentifierKind.URL}>
                    {__('URL', 'academic-bloggers-toolkit')}
                </option>
            </select>
            <input
                // TODO: consider using `FormTokenField` here
                ref={inputRef}
                required
                pattern={PATTERNS[kind]}
                type="text"
                value={value}
                onChange={e => setValue(e.currentTarget.value)}
            />
        </form>
    );
}
