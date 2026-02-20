import { Button, RadioControl } from '@wordpress/components';
import type { ComponentProps } from 'react';
import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import asDialog, { DialogProps } from 'components/as-dialog';
import DialogToolbar from 'components/dialog-toolbar';
import IdentifierReferenceForm from 'gutenberg/components/reference-form-identifier';
import ManualReferenceForm from 'gutenberg/components/reference-form-manual';
import ReferenceFormSearch from 'gutenberg/components/reference-form-search';

import styles from './style.scss';

interface Props extends DialogProps {
    onSubmit(data: CSL.Data): void;
}

type AddReferenceMode = 'identifier' | 'search' | 'manual';

function Dialog({ onClose, onSubmit }: Props) {
    const { createErrorNotice } = useDispatch('core/notices');
    const [mode, setMode] = useState<AddReferenceMode>('identifier');
    const [isBusy, setIsBusy] = useState(false);

    const FORM_ID = 'add-reference-form';
    const setBusy = (busy: boolean) => setIsBusy(busy);
    const onError = (message: string) =>
        createErrorNotice(message, { type: 'snackbar' });

    return (
        <>
            <RadioControl
                {...({ __nextHasNoMarginBottom: true } as ComponentProps<
                    typeof RadioControl
                > & { __nextHasNoMarginBottom?: boolean })}
                className={styles.modeSelect}
                options={[
                    {
                        label: __('By identifier (DOI, PMID, etc.)', 'academic-bloggers-toolkit'),
                        value: 'identifier',
                    },
                    {
                        label: __('Search PubMed / PMC', 'academic-bloggers-toolkit'),
                        value: 'search',
                    },
                    {
                        label: __('Add manually', 'academic-bloggers-toolkit'),
                        value: 'manual',
                    },
                ]}
                selected={mode}
                onChange={value =>
                    !isBusy && setMode(value as AddReferenceMode)
                }
            />
            {mode === 'identifier' && (
                <IdentifierReferenceForm
                    id={FORM_ID}
                    setBusy={setBusy}
                    onClose={onClose}
                    onError={onError}
                    onSubmit={onSubmit}
                />
            )}
            {mode === 'search' && (
                <ReferenceFormSearch
                    setBusy={setBusy}
                    onError={onError}
                    onSubmit={onSubmit}
                />
            )}
            {mode === 'manual' && (
                <ManualReferenceForm
                    withAutocite
                    id={FORM_ID}
                    onSubmit={onSubmit}
                />
            )}
            <DialogToolbar>
                <div className={styles.toolbar}>
                    {mode !== 'search' && (
                        <Button
                            isPrimary
                            disabled={isBusy}
                            form={FORM_ID}
                            isBusy={isBusy}
                            type="submit"
                        >
                            {__('Add Reference', 'academic-bloggers-toolkit')}
                        </Button>
                    )}
                </div>
            </DialogToolbar>
        </>
    );
}

export default asDialog(Dialog);
