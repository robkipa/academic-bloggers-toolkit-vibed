import { Action, combineReducers } from '@wordpress/data';
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
            return action.styles;
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
            return state.filter(({ id }) => !action.itemIds.includes(id));
        }
        case Actions.UPDATE_REFERENCE: {
            const index = state.findIndex(({ id }) => id === action.data.id);
            return index === -1
                ? [...state, action.data]
                : [
                      ...state.slice(0, index),
                      action.data,
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
            return action.style;
        default:
            return state;
    }
}

export default combineReducers({
    citationStyles,
    references,
    style,
});
