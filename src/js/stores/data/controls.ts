import { select } from '@wordpress/data';

import { fetchAjax } from 'utils/ajax';

type Action = { type: string; style?: string; id?: string; state?: unknown };
function assertDefined<T>(v: T | undefined, name: string): T {
    if (v === undefined) throw new Error(`Missing ${name}`);
    return v;
}
import { localeCache, styleCache } from 'utils/cache';

import { StyleJSON } from './';
import { StyleKind } from './constants';

const enum CtrlActions {
    FETCH_CITATION_STYLES = 'FETCH_CITATION_STYLES',
    FETCH_LOCALE = 'FETCH_LOCALE',
    FETCH_STYLE = 'FETCH_STYLE',
    SAVE_STATE = 'SAVE_STATE',
}

export function fetchCitationStyles() {
    return {
        type: CtrlActions.FETCH_CITATION_STYLES,
    };
}

export function fetchLocale(style: string) {
    return {
        type: CtrlActions.FETCH_LOCALE,
        style,
    };
}

export function fetchStyle() {
    const { value, kind } = (select('abt/data') as unknown as { getStyle: () => { value: string; kind: string } }).getStyle();
    if (kind === StyleKind.CUSTOM) {
        return value;
    }
    return {
        type: CtrlActions.FETCH_STYLE,
        id: value,
    };
}

export function saveState() {
    const id = (select('core/editor') as unknown as { getCurrentPostId: () => string }).getCurrentPostId();
    const post = (select('abt/data') as unknown as { getSerializedState: () => { meta: { _abt_state: unknown } } }).getSerializedState();
    return {
        type: CtrlActions.SAVE_STATE,
        id,
        state: post.meta._abt_state,
    };
}

/** Promise-based (no async/await) to avoid regeneratorRuntime in editor iframe. */
const controls = {
    FETCH_CITATION_STYLES(): Promise<StyleJSON> {
        return fetchAjax('get_style_json').then(response => response.json());
    },
    FETCH_LOCALE({ style }: Action): Promise<string> {
        return localeCache.fetchItem(assertDefined(style, 'style'));
    },
    FETCH_STYLE({ id }: Action): Promise<string> {
        return styleCache.fetchItem(assertDefined(id, 'id'));
    },
    SAVE_STATE({ id, state }: Action): Promise<unknown> {
        return fetchAjax('update_abt_state', {
            post_id: assertDefined(id, 'id'),
            state: assertDefined(state, 'state') as string | number | boolean,
        }).then((response: { json: () => unknown }) => response.json());
    },
};

export default controls;
