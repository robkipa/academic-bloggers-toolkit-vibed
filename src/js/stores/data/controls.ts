import { Action, select } from '@wordpress/data';

import { fetchAjax } from 'utils/ajax';
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
    const { value, kind } = select('abt/data').getStyle();
    if (kind === StyleKind.CUSTOM) {
        return value;
    }
    return {
        type: CtrlActions.FETCH_STYLE,
        id: value,
    };
}

export function saveState() {
    const id = select('core/editor').getCurrentPostId();
    const post = select('abt/data').getSerializedState();
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
        return localeCache.fetchItem(style);
    },
    FETCH_STYLE({ id }: Action): Promise<string> {
        return styleCache.fetchItem(id);
    },
    SAVE_STATE({ id, state }: Action): Promise<unknown> {
        return fetchAjax('update_abt_state', {
            post_id: id,
            state,
        }).then(response => response.json());
    },
};

export default controls;
