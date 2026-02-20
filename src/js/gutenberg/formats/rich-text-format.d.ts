import type { ComponentType } from 'react';
import type { RichTextValue } from '@wordpress/rich-text';

/** Format object shape used in activeFormats. */
export interface RichTextFormatShape {
    type?: string;
    attributes?: Record<string, unknown>;
}

/**
 * Props passed to a format's edit component by the rich text component.
 * Not exported from @wordpress/rich-text; defined locally.
 * Value may include activeFormats when passed to edit components.
 */
export interface FormatProps {
    value: RichTextValue & { activeFormats?: RichTextFormatShape[] };
    onChange: (value: RichTextValue) => void;
    isActive?: boolean;
}

/**
 * Configuration object for registerFormatType (second argument).
 * Not exported from @wordpress/rich-text; defined locally.
 */
export interface FormatConfiguration {
    tagName: string;
    className?: string | null;
    title: string;
    attributes?: Record<string, string>;
    edit: ComponentType<FormatProps>;
}
