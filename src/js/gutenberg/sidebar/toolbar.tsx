import {
    Button,
    createSlotFill,
    FormFileUpload,
    PanelBody,
    PanelRow,
} from '@wordpress/components';
import { useCallback } from '@wordpress/element';
import type { ComponentProps } from 'react';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

import RemoveIcon from 'components/icons/remove';
import AddReferenceDialog from 'gutenberg/dialogs/add-reference';
import StyleDialog from 'gutenberg/dialogs/update-style';
import { readReferencesFile } from 'utils/file';

import ToolbarMenu from './toolbar-menu';
import styles from './toolbar.scss';

interface Props {
    selectedItems: readonly string[];
}

const { Slot: ToolbarButtonSlot, Fill: ToolbarButtonFill } = createSlotFill(
    'abt-toolbar-buttons',
);

const noop = () => void 0;
const noopRefs = (_: CSL.Data[]) => void 0;
const noopIds = (_: string[]) => void 0;

export const ToolbarButton = (props: ComponentProps<typeof Button>) => (
    <ToolbarButtonFill>
        <Button {...props} />
    </ToolbarButtonFill>
);

export default function Toolbar({ selectedItems }: Props) {
    const dataDispatch = useDispatch('abt/data');
    const uiDispatch = useDispatch('abt/ui');
    const noticesDispatch = useDispatch('core/notices');

    const addReferences =
        dataDispatch && typeof dataDispatch.addReferences === 'function'
            ? dataDispatch.addReferences
            : noopRefs;
    const removeFootnotes =
        dataDispatch && typeof dataDispatch.removeFootnotes === 'function'
            ? dataDispatch.removeFootnotes
            : noopIds;
    const removeReferences =
        dataDispatch && typeof dataDispatch.removeReferences === 'function'
            ? dataDispatch.removeReferences
            : noopIds;
    const clearSelectedItems =
        uiDispatch && typeof uiDispatch.clearSelectedItems === 'function'
            ? uiDispatch.clearSelectedItems
            : noop;
    const createErrorNotice =
        noticesDispatch && typeof noticesDispatch.createErrorNotice === 'function'
            ? noticesDispatch.createErrorNotice
            : noop;

    const removeSelectedItems = useCallback(() => {
        removeReferences([...selectedItems]);
        removeFootnotes([...selectedItems]);
        clearSelectedItems();
    }, [selectedItems, removeReferences, removeFootnotes, clearSelectedItems]);
    const formFileUploadProps = {
        __next40pxDefaultSize: true,
        accept: [
            '.ris',
            '.bib',
            '.bibtex',
            'application/xresearch-info-systems',
            'application/x-bibtex',
        ].join(),
        icon: 'welcome-add-page',
        label: __('Import references', 'academic-bloggers-toolkit'),
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputEl = e.currentTarget;
            const { files } = inputEl;
            if (!files || files.length === 0) return;
            if (files[0]) {
                readReferencesFile(files[0])
                    .then(refs => addReferences(refs))
                    .catch(() => {
                        createErrorNotice(
                            __(
                                'Invalid import file type. File must be a valid BibTeX or RIS file.',
                                'academic-bloggers-toolkit',
                            ),
                            { type: 'snackbar' },
                        );
                    })
                    .finally(() => {
                        inputEl.value = '';
                    });
            }
        },
    };
    return (
        <>
            <StyleDialog />
            <PanelBody className={styles.container} opened={true}>
                <PanelRow>
                    <ToolbarButtonSlot />
                    <AddReferenceDialog />
                    <Button
                        {...({
                            disabled: selectedItems.length === 0,
                            icon: <RemoveIcon />,
                            label: __(
                                'Remove selected items',
                                'academic-bloggers-toolkit',
                            ),
                            onClick: () => removeSelectedItems(),
                        } as ComponentProps<typeof Button>)}
                    />
                    <FormFileUpload
                        {...(formFileUploadProps as ComponentProps<
                            typeof FormFileUpload
                        >)}
                    />
                    <ToolbarMenu />
                </PanelRow>
            </PanelBody>
        </>
    );
}
