import { Button, KeyboardShortcuts } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import type { ComponentProps } from 'react';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { displayShortcut } from '@wordpress/keycodes';

import Dialog from './dialog';

export default function AddReferenceDialog() {
    const dataDispatch = useDispatch('abt/data');
    const addReference =
        dataDispatch && typeof dataDispatch.addReference === 'function'
            ? dataDispatch.addReference
            : () => void 0;
    const [isOpen, setIsOpen] = useState(false);
    const toggleDialog = () => setIsOpen(!isOpen);
    return (
        <>
            <KeyboardShortcuts
                bindGlobal
                shortcuts={{ 'ctrl+alt+r': toggleDialog }}
            />
            <Button
                {...({
                    icon: 'insert',
                    label: __('Add reference', 'academic-bloggers-toolkit'),
                    shortcut: displayShortcut.primaryAlt('r'),
                    onClick: toggleDialog,
                } as ComponentProps<typeof Button>)}
            />
            <Dialog
                isOpen={isOpen}
                title={__('Add Reference', 'academic-bloggers-toolkit')}
                onClose={toggleDialog}
                onSubmit={data => {
                    addReference(data);
                    setIsOpen(false);
                }}
            />
        </>
    );
}
