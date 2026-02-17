import { RichText } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import CountIcon from 'components/count-icon';
import ReferenceItem from 'gutenberg/components/reference-item';
import SidebarItemList from 'gutenberg/components/sidebar-item-list';
import EditReferenceDialog from 'gutenberg/dialogs/edit-reference';
import usePrevious from 'hooks/use-previous';

import {
    getPluginSidebar,
    getPluginSidebarMoreMenuItem,
} from './get-sidebar-components';
import SidebarToolbar from './toolbar';

/** Use runtime wp.editor (6.6+) / wp.editPost so we avoid deprecated edit-post import. */
const PluginSidebar = getPluginSidebar();
const PluginSidebarMoreMenuItem = getPluginSidebarMoreMenuItem();

const DEFAULT_ITEMS: CSL.Data[] = [];
const DEFAULT_FOOTNOTES: Array<{ id: string; content: string }> = [];

const noop = () => void 0;
const noopReturn = (_: CSL.Data) => void 0;

type SidebarSelectResult = {
    citedItems: CSL.Data[];
    footnotes: Array<{ id: string; content: string }>;
    isTyping: boolean;
    selectedItems: string[];
    uncitedItems: CSL.Data[];
};

/** Cache so useSelect receives stable reference when content is unchanged. */
let sidebarSelectCache: { sig: string; result: SidebarSelectResult } = {
    sig: '',
    result: null as unknown as SidebarSelectResult,
};

function sidebarSelectResultSignature(r: SidebarSelectResult): string {
    return (
        `${r.citedItems.length}:${r.citedItems.map(x => x.id).sort().join(',')}|` +
        `${r.footnotes.length}:${r.footnotes.map(f => f.id).join(',')}|` +
        `${r.uncitedItems.length}:${r.uncitedItems.map(x => x.id).sort().join(',')}|` +
        `${r.selectedItems.length}:${r.selectedItems.slice().sort().join(',')}|` +
        String(r.isTyping)
    );
}

export default function Sidebar() {
    const dataDispatch = useDispatch('abt/data');
    const uiDispatch = useDispatch('abt/ui');

    const parseCitations =
        dataDispatch && typeof dataDispatch.parseCitations === 'function'
            ? dataDispatch.parseCitations
            : noop;
    const parseFootnotes =
        dataDispatch && typeof dataDispatch.parseFootnotes === 'function'
            ? dataDispatch.parseFootnotes
            : noop;
    const updateReference =
        dataDispatch && typeof dataDispatch.updateReference === 'function'
            ? dataDispatch.updateReference
            : noopReturn;
    const toggleItemSelected =
        uiDispatch && typeof uiDispatch.toggleItemSelected === 'function'
            ? uiDispatch.toggleItemSelected
            : noop;

    const {
        citedItems,
        footnotes,
        isTyping,
        selectedItems,
        uncitedItems,
    } = useSelect(select => {
        let result: SidebarSelectResult;
        try {
            const { getCitedItems, getFootnotes, getSortedItems } = select(
                'abt/data',
            );
            const {
                getSelectedItems,
                getSidebarSortMode,
                getSidebarSortOrder,
            } = select('abt/ui');
            const blockEditor = select('core/block-editor');
            const isTypingVal =
                blockEditor && typeof blockEditor.isTyping === 'function'
                    ? blockEditor.isTyping()
                    : false;
            const cited = getCitedItems();
            const uncited = getSortedItems(
                getSidebarSortMode(),
                getSidebarSortOrder(),
                'uncited',
            );
            result = {
                citedItems: cited != null ? cited : DEFAULT_ITEMS,
                footnotes: getFootnotes() || DEFAULT_FOOTNOTES,
                isTyping: isTypingVal,
                selectedItems: getSelectedItems() || [],
                uncitedItems: uncited != null ? uncited : DEFAULT_ITEMS,
            };
        } catch {
            result = {
                citedItems: DEFAULT_ITEMS,
                footnotes: DEFAULT_FOOTNOTES,
                isTyping: false,
                selectedItems: [],
                uncitedItems: DEFAULT_ITEMS,
            };
        }
        const sig = sidebarSelectResultSignature(result);
        if (sig === sidebarSelectCache.sig) {
            return sidebarSelectCache.result;
        }
        sidebarSelectCache = { sig, result };
        return result;
    });

    const [editReferenceId, setEditReferenceId] = useState('');
    const [needsUpdate, setNeedsUpdate] = useState(false);

    const prevCitedItemsLength = usePrevious(citedItems.length);
    const prevFootnotesLength = usePrevious(footnotes.length);

    useEffect(() => {
        const lengthMismatch =
            prevCitedItemsLength !== citedItems.length ||
            prevFootnotesLength !== footnotes.length;
        if (isTyping && lengthMismatch) {
            setNeedsUpdate(true);
        } else if (needsUpdate || lengthMismatch) {
            parseEditorItems();
            setNeedsUpdate(false);
        }
    });

    const parseEditorItems = () => {
        parseCitations();
        parseFootnotes();
    };

    if (!PluginSidebar || !PluginSidebarMoreMenuItem) {
        return null;
    }

    return (
        <>
            <EditReferenceDialog
                isOpen={!!editReferenceId}
                itemId={editReferenceId}
                title={__('Edit reference', 'academic-bloggers-toolkit')}
                onClose={() => setEditReferenceId('')}
                onSubmit={(data: CSL.Data) => {
                    updateReference(data);
                    setEditReferenceId('');
                }}
            />
            <PluginSidebarMoreMenuItem
                icon="welcome-learn-more"
                target="abt-reference-list"
            >
                {__("Academic Blogger's Toolkit", 'academic-bloggers-toolkit')}
            </PluginSidebarMoreMenuItem>
            <PluginSidebar
                name="abt-reference-list"
                title={__('Reference List', 'academic-bloggers-toolkit')}
            >
                <SidebarToolbar selectedItems={selectedItems} />
                <PanelBody
                    icon={<CountIcon count={citedItems.length} />}
                    initialOpen={citedItems.length > 0}
                    opened={citedItems.length === 0 ? false : undefined}
                    title={__('Cited Items', 'academic-bloggers-toolkit')}
                >
                    <SidebarItemList
                        items={citedItems}
                        renderItem={(item: CSL.Data) => (
                            <ReferenceItem item={item} />
                        )}
                        selectedItems={selectedItems}
                        onItemClick={toggleItemSelected}
                        onItemDoubleClick={setEditReferenceId}
                    />
                </PanelBody>
                <PanelBody
                    icon={<CountIcon count={uncitedItems.length} />}
                    initialOpen={
                        uncitedItems.length > 0 && citedItems.length === 0
                    }
                    opened={uncitedItems.length === 0 ? false : undefined}
                    title={__('Uncited Items', 'academic-bloggers-toolkit')}
                >
                    <SidebarItemList
                        items={uncitedItems}
                        renderItem={(item: CSL.Data) => (
                            <ReferenceItem item={item} />
                        )}
                        selectedItems={selectedItems}
                        onItemClick={toggleItemSelected}
                        onItemDoubleClick={setEditReferenceId}
                    />
                </PanelBody>
                <PanelBody
                    icon={<CountIcon count={footnotes.length} />}
                    initialOpen={false}
                    opened={footnotes.length === 0 ? false : undefined}
                    title={__('Footnotes', 'academic-bloggers-toolkit')}
                >
                    <SidebarItemList
                        items={footnotes}
                        renderItem={(item: {
                            id: string;
                            content: string;
                        }) => (
                            <RichText.Content
                                style={{ fontWeight: 'bold' }}
                                tagName="div"
                                value={item.content || ''}
                            />
                        )}
                        selectedItems={selectedItems}
                        onItemClick={toggleItemSelected}
                    />
                </PanelBody>
            </PluginSidebar>
        </>
    );
}
