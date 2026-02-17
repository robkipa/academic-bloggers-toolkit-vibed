import { State } from './';

export function getIdentifierKind(state: State) {
    return state.addReferenceDialog.identifierKind;
}

/** Return state reference so useSelect gets stable reference (avoids re-render warning). */
export function getSelectedItems(state: State) {
    return state.sidebar.selectedItems;
}

export function getSidebarSortMode(state: State) {
    return state.sidebar.sortMode;
}

export function getSidebarSortOrder(state: State) {
    return state.sidebar.sortOrder;
}
