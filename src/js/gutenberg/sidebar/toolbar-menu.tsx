import {
    Button,
    createSlotFill,
    Dashicon,
    Dropdown,
    ExternalLink,
    MenuGroup,
    MenuItem,
    MenuItemsChoice,
    NavigableMenu,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import type { ComponentProps } from 'react';
import { __ } from '@wordpress/i18n';

import styles from './toolbar-menu.scss';

const Separator = () => <hr className={styles.separator} />;

const { Slot: ToolbarMenuItemSlot, Fill: ToolbarMenuItemFill } = createSlotFill(
    'abt-toolbar-menu-item',
);

export const ToolbarMenuItem = (props: ComponentProps<typeof MenuItem>) => (
    <ToolbarMenuItemFill>
        <MenuItem {...props} />
    </ToolbarMenuItemFill>
);

const noop = () => void 0;

export default function ToolbarMenu() {
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
    const removeAllCitations =
        dataDispatch && typeof dataDispatch.removeAllCitations === 'function'
            ? dataDispatch.removeAllCitations
            : noop;
    const setSidebarSortMode =
        uiDispatch && typeof uiDispatch.setSidebarSortMode === 'function'
            ? uiDispatch.setSidebarSortMode
            : noop;
    const setSidebarSortOrder =
        uiDispatch && typeof uiDispatch.setSidebarSortOrder === 'function'
            ? uiDispatch.setSidebarSortOrder
            : noop;

    const abtUiStore = useSelect(
        select => select('abt/ui') as { getSidebarSortMode(): string; getSidebarSortOrder(): string } | undefined,
        [],
    );
    const sortMode = (abtUiStore?.getSidebarSortMode?.() ?? 'date') as
        | 'date'
        | 'publication'
        | 'title';
    const sortOrder = (abtUiStore?.getSidebarSortOrder?.() ?? 'asc') as
        | 'asc'
        | 'desc';

    const refreshItems = () => {
        parseCitations();
        parseFootnotes();
    };

    const setSortMode = (mode: 'date' | 'publication' | 'title') => {
        if (mode !== sortMode) {
            setSidebarSortMode(mode);
        }
    };

    const setSortOrder = (order: 'asc' | 'desc') => {
        if (order !== sortOrder) {
            setSidebarSortOrder(order);
        }
    };

    return (
        <Dropdown
            contentClassName={styles.dropdown}
            renderContent={({ onClose }) => (
                <NavigableMenu className={styles.menu}>
                    <section role="list" onClickCapture={onClose}>
                        <MenuItem icon={<Dashicon icon="trash" />} onClick={removeAllCitations}>
                            {__(
                                'Remove all citations',
                                'academic-bloggers-toolkit',
                            )}
                        </MenuItem>
                        <MenuItem icon={<Dashicon icon="update" />} onClick={refreshItems}>
                            {__(
                                'Refresh all items',
                                'academic-bloggers-toolkit',
                            )}
                        </MenuItem>
                        <ToolbarMenuItemSlot />
                    </section>
                    <Separator />
                    <MenuGroup
                        className={styles.sortChoices}
                        label={
                            // translators: Form label.
                            __('Sort uncited by', 'academic-bloggers-toolkit')
                        }
                    >
                        <MenuItemsChoice
                            choices={[
                                {
                                    label:
                                        // translators: Button label for sorting by date.
                                        __('Date', 'academic-bloggers-toolkit'),
                                    value: 'date',
                                },
                                {
                                    label:
                                        // translators: Button label for sorting by publication.
                                        __(
                                            'Publication',
                                            'academic-bloggers-toolkit',
                                        ),
                                    value: 'publication',
                                },
                                {
                                    label:
                                        // translators: Button label for sorting by title.
                                        __(
                                            'Title',
                                            'academic-bloggers-toolkit',
                                        ),
                                    value: 'title',
                                },
                            ]}
                            value={sortMode}
                            onSelect={value =>
                                setSortMode(value as
                                    | 'date'
                                    | 'publication'
                                    | 'title')
                            }
                            onHover={() => {}}
                        />
                    </MenuGroup>
                    <MenuGroup
                        className={styles.sortChoices}
                        label={
                            // translators: Form label.
                            __('Sort order', 'academic-bloggers-toolkit')
                        }
                    >
                        <MenuItemsChoice
                            choices={[
                                {
                                    label: 'Ascending',
                                    value: 'asc',
                                },
                                {
                                    label: 'Descending',
                                    value: 'desc',
                                },
                            ]}
                            value={sortOrder}
                            onSelect={order =>
                                setSortOrder(order as 'asc' | 'desc')
                            }
                            onHover={() => {}}
                        />
                    </MenuGroup>
                    <Separator />
                    <MenuItem icon={<Dashicon icon="editor-help" />}>
                        <ExternalLink href="https://github.com/dsifford/academic-bloggers-toolkit/wiki">
                            {// translators: Link that goes to usage instructions.
                            __(
                                'Usage instructions',
                                'academic-bloggers-toolkit',
                            )}
                        </ExternalLink>
                    </MenuItem>
                </NavigableMenu>
            )}
            renderToggle={({ onToggle }) => (
                <Button
                    {...({
                        className: styles.moreIcon,
                        icon: 'ellipsis',
                        label: __(
                            'More options',
                            'academic-bloggers-toolkit',
                        ),
                        onClick: onToggle,
                    } as ComponentProps<typeof Button>)}
                />
            )}
        />
    );
}
