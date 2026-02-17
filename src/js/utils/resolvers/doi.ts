import { pickBy } from 'lodash';

import { isCslKey, isCslNumberKey, isCslStringKey } from 'utils/constants';
import { ResponseError } from 'utils/error';

/** Promise-based to avoid async/await (regeneratorRuntime) in editor bundle. */
export function get(doi: string): Promise<CSL.Data | ResponseError> {
    return fetch(`https://doi.org/${encodeURIComponent(doi)}`, {
        headers: {
            accept: 'application/vnd.citationstyles.csl+json',
        },
    }).then(response => {
        if (!response.ok) {
            return new ResponseError(doi, response);
        }
        return response.json().then(
            json =>
                pickBy(json, (value, key) => {
                    if (!isCslKey(key) || key === 'abstract') {
                        return false;
                    }
                    if (isCslStringKey(key) && typeof value !== 'string') {
                        return false;
                    }
                    if (isCslNumberKey(key) && typeof value !== 'number') {
                        return false;
                    }
                    return true;
                }) as CSL.Data,
        );
    });
}
