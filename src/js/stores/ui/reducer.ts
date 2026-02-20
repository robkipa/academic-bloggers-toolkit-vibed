const { combineReducers } = require('@wordpress/data') as {
    combineReducers: <S>(reducers: Record<string, (state: unknown, action: unknown) => unknown>) => (state: S | undefined, action: unknown) => S;
};

type Action = { type: string; [key: string]: unknown };

import { IdentifierKind } from 'utils/constants';

import { State } from './';
import { Actions } from './constants';

const ARD_INITIAL_STATE: State['addReferenceDialog'] = {
    identifierKind: IdentifierKind.DOI,
};

export function addReferenceDialog(
    state = ARD_INITIAL_STATE,
    action: Action,
): State['addReferenceDialog'] {
    switch (action.type) {
        case Actions.SET_IDENTIFIER_KIND: {
            return {
                ...state,
                identifierKind: (action as unknown as { kind: IdentifierKind }).kind,
            };
        }
        default:
            return state;
    }
}

const EMPTY_SELECTED_ITEMS: string[] = [];
const SIDEBAR_INITIAL_STATE: State['sidebar'] = {
    selectedItems: EMPTY_SELECTED_ITEMS,
    sortMode: 'title',
    sortOrder: 'asc',
};

export function sidebar(
    state = SIDEBAR_INITIAL_STATE,
    action: Action,
): State['sidebar'] {
    switch (action.type) {
        case Actions.CLEAR_SELECTED_ITEMS: {
            return {
                ...state,
                selectedItems: EMPTY_SELECTED_ITEMS,
            };
        }
        case Actions.SET_SIDEBAR_SORT_MODE: {
            return {
                ...state,
                sortMode: (action as unknown as { mode: State['sidebar']['sortMode'] }).mode,
            };
        }
        case Actions.SET_SIDEBAR_SORT_ORDER: {
            return {
                ...state,
                sortOrder: (action as unknown as { order: State['sidebar']['sortOrder'] }).order,
            };
        }
        case Actions.TOGGLE_ITEM_SELECTED: {
            const id = (action as unknown as { id: string }).id;
            return {
                ...state,
                selectedItems: state.selectedItems.includes(id)
                    ? state.selectedItems.filter(x => x !== id)
                    : [...state.selectedItems, id],
            };
        }
        default:
            return state;
    }
}

export default combineReducers({
    addReferenceDialog,
    sidebar,
} as Record<string, (state: unknown, action: unknown) => unknown>);
