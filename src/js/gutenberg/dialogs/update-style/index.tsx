import { Dashicon } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { ToolbarMenuItem } from 'gutenberg/sidebar/toolbar-menu';

import Dialog from './dialog';
import styles from './style.scss';

export default function StyleDialog() {
    const dataDispatch = useDispatch('abt/data');
    const setStyle =
        dataDispatch && typeof dataDispatch.setStyle === 'function'
            ? dataDispatch.setStyle
            : () => void 0;
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <ToolbarMenuItem
                icon={<Dashicon icon="admin-appearance" />}
                onClick={() => setIsOpen(true)}
            >
                {__('Change citation style', 'academic-bloggers-toolkit')}
            </ToolbarMenuItem>
            <Dialog
                className={styles.dialog}
                isOpen={isOpen}
                title={__('Change citation style', 'academic-bloggers-toolkit')}
                onClose={() => setIsOpen(false)}
                onSubmit={(style: import('stores/data').Style) => {
                    setStyle(style);
                    setIsOpen(false);
                }}
            />
        </>
    );
}
