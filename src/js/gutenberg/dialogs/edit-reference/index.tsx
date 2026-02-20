import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

import asDialog, { DialogProps } from 'components/as-dialog';
import DialogToolbar from 'components/dialog-toolbar';
import ManualReferenceForm from 'gutenberg/components/reference-form-manual';

import styles from './style.scss';

const FORM_ID = 'edit-reference-form';

interface Props extends DialogProps {
    itemId?: string;
    onSubmit(data: CSL.Data): void;
}

function EditDialog({ onSubmit, itemId }: Props) {
    const data = (useSelect as unknown as (cb: (select: (key: string) => unknown) => CSL.Data | undefined, deps: unknown[]) => CSL.Data | undefined)(
        (select: (key: string) => unknown) =>
            (select('abt/data') as unknown as { getItemById: (id: string) => CSL.Data | undefined }).getItemById(itemId || ''),
        [itemId],
    );

    return (
        <>
            <ManualReferenceForm data={data as CSL.Data} id={FORM_ID} onSubmit={onSubmit} />
            <DialogToolbar>
                <div className={styles.toolbar}>
                    <Button isPrimary form={FORM_ID} type="submit">
                        {__('Update Reference', 'academic-bloggers-toolkit')}
                    </Button>
                </div>
            </DialogToolbar>
        </>
    );
}

export default asDialog(EditDialog);
