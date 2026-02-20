// @wordpress/data combineReducers - use require when type resolution fails
const { combineReducers } = require('@wordpress/data') as {
    combineReducers: <S>(reducers: Record<string, (state: unknown, action: unknown) => unknown>) => (state: S | undefined, action: unknown) => S;
};

type Action = { type: string; [key: string]: unknown };
import hash from 'string-hash';

import { getJSONScriptData } from 'utils/dom';

import { SavedState, State } from './';
import { Actions, StyleKind } from './constants';

const DEFAULT_SAVED_STATE: SavedState = {
    references: [],
    style: {
        kind: StyleKind.PREDEFINED,
        value: 'american-medical-association',
        label: 'American Medical Association',
    },
};

function getInitialSavedState(): SavedState {
    try {
        return getJSONScriptData<SavedState>('abt-editor-state');
    } catch {
        return DEFAULT_SAVED_STATE;
    }
}

const INITIAL_STATE: State = {
    citationStyles: {
        renamed: {},
        styles: [],
    },
    ...getInitialSavedState(),
};

export function citationStyles(
    state = INITIAL_STATE.citationStyles,
    action: Action,
): State['citationStyles'] {
    switch (action.type) {
        case Actions.SET_CITATION_STYLES: {
            return (action as unknown as { styles: State['citationStyles'] }).styles;
        }
        default:
            return state;
    }
}

export function references(
    state = INITIAL_STATE.references,
    action: Action,
): State['references'] {
    switch (action.type) {
        case Actions.ADD_REFERENCES: {
            const newItems = (action.data as CSL.Data[])
                .map(({ id: _id, ...data }) => ({
                    ...data,
                    id: `${hash(JSON.stringify(data))}`,
                }))
                .filter(
                    ({ id }) => state.findIndex(item => item.id === id) === -1,
                );
            return newItems.length > 0 ? [...state, ...newItems] : state;
        }
        case Actions.REMOVE_REFERENCES: {
            const { itemIds } = action as unknown as { itemIds: string[] };
            return state.filter(({ id }) => !itemIds.includes(id));
        }
        case Actions.UPDATE_REFERENCE: {
            const { data } = action as unknown as { data: CSL.Data };
            const index = state.findIndex(({ id }) => id === data.id);
            return index === -1
                ? [...state, data]
                : [
                      ...state.slice(0, index),
                      data,
                      ...state.slice(index + 1),
                  ];
        }
        default:
            return state;
    }
}

export function style(
    state = INITIAL_STATE.style,
    action: Action,
): State['style'] {
    switch (action.type) {
        case Actions.SET_STYLE:
            return (action as unknown as { style: State['style'] }).style;
        default:
            return state;
    }
}

export default combineReducers({
    citationStyles,
    references,
    style,
} as Record<string, (state: unknown, action: unknown) => unknown>);
