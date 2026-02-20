import { parse, serialize } from '@wordpress/blocks';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { create, insert } from '@wordpress/rich-text';
import { get } from 'lodash';

import { ToolbarButton } from 'gutenberg/sidebar/toolbar';
import { ZERO_WIDTH_SPACE } from 'utils/constants';
import { createSelector } from 'utils/dom';
import { CitationElement } from 'utils/element';
import { getNeighbors, iterate, mergeItems } from 'utils/formats';
import type { FormatProps } from '../rich-text-format';

import { name as NAME } from './';

import './citation.scss?global';

type Props = FormatProps;

const legacyCitationSelector = createSelector(
    ...CitationElement.legacyClassNames.map(cls => ({
        classNames: [cls],
        attributes: { 'data-reflist': true },
    })),
);

function Citation({ value, onChange }: Props) {
    const blockEditorDispatch = useDispatch('core/block-editor') as { updateBlock: (clientId: string, updates: Record<string, unknown>) => void };
    const dataDispatch = useDispatch('abt/data') as { parseCitations?: () => unknown };
    const uiDispatch = useDispatch('abt/ui') as { clearSelectedItems?: () => void };
    const blockSelect = (useSelect as unknown as (sel: (s: (k: string) => unknown) => { getSelectedBlock: () => { clientId: string } | null }) => { getSelectedBlock: () => { clientId: string } | null })((select: (key: string) => unknown) =>
        select('core/block-editor') as { getSelectedBlock: () => { clientId: string } | null },
    );
    const selectedItems = (useSelect as unknown as (sel: (s: (k: string) => unknown) => string[]) => string[])((select: (key: string) => unknown) => {
        const data = select('abt/data') as { getItems: () => { id: string }[] };
        const ui = select('abt/ui') as { getSelectedItems: () => string[] };
        const referenceIds = data.getItems().map(({ id }) => id);
        return ui.getSelectedItems().filter(id => referenceIds.includes(id));
    });

    const mergeLegacyCitations = () => {
        const selectedBlock = blockSelect.getSelectedBlock();
        if (!selectedBlock) {
            return;
        }
        const block = document.createElement('div');
        block.innerHTML = serialize([selectedBlock as Parameters<typeof serialize>[0][0]]);
        const legacyNodes = block.querySelectorAll<HTMLElement>(
            legacyCitationSelector,
        );
        if (legacyNodes.length === 0) {
            return;
        }
        for (const node of legacyNodes) {
            node.className = CitationElement.className;
            node.contentEditable = 'false';
            node.dataset.items = node.dataset.reflist ?? '';
            delete node.dataset.reflist;
            if (node.firstElementChild) {
                node.dataset.hasChildren = 'true';
                node.firstElementChild.innerHTML =
                    ZERO_WIDTH_SPACE +
                    node.firstElementChild.innerHTML +
                    ZERO_WIDTH_SPACE;
            } else {
                node.innerHTML =
                    ZERO_WIDTH_SPACE + node.innerHTML + ZERO_WIDTH_SPACE;
            }
        }
        const parsed = parse(block.innerHTML)[0] as unknown as { clientId: string; [k: string]: unknown };
        const { clientId: _clientId, ...updates } = parsed;
        blockEditorDispatch.updateBlock(selectedBlock.clientId, updates);
    };

    const parseCitations = () => {
        if (typeof uiDispatch.clearSelectedItems === 'function') {
            uiDispatch.clearSelectedItems();
        }
        if (typeof dataDispatch.parseCitations === 'function') {
            (dataDispatch.parseCitations as () => unknown)();
        }
    };

    useEffect(() => {
        mergeLegacyCitations();
    }, []);

    const handleInsertCitation = () => {
        insertCitation({
            onChange,
            parseCitations,
            selectedItems,
            value,
        });
    };

    return (
        <>
            <ToolbarButton
                disabled={selectedItems.length === 0}
                icon="exit"
                label={__('Insert citation', 'academic-bloggers-toolkit')}
                onClick={handleInsertCitation}
            />
        </>
    );
}

function insertCitation({
    onChange,
    parseCitations,
    selectedItems,
    value,
}: Props & { selectedItems: string[]; parseCitations: () => void }) {
    const { activeFormats = [] } = value;
    const activeCitation = activeFormats.find(f => f.type === NAME);

    if (activeCitation) {
        const selectedId = get(activeCitation, ['attributes', 'id']) as string | undefined;
        for (const { attributes = {} } of iterate(value, NAME)) {
            if ((attributes as { id?: string }).id === selectedId) {
                (attributes as { items?: string }).items = mergeItems(selectedItems, (attributes as { items?: string }).items);
            }
        }
        onChange(value);
    } else {
        const formats = getNeighbors(NAME, value);
        if (formats.length > 0) {
            for (const format of formats) {
                const attrs = (format.attributes || {}) as { items?: string };
                format.attributes = {
                    ...attrs,
                    items: mergeItems(selectedItems, attrs.items),
                };
            }
            onChange(value);
        } else {
            const newValue = create({
                html: CitationElement.create(selectedItems),
            });
            onChange(insert(value, newValue));
        }
    }
    parseCitations();
}

export default Citation;
