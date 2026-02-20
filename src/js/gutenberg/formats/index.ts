/**
 * Provide regeneratorRuntime in editor iframe (formats bundle may include generator code).
 */
import 'regenerator-runtime/runtime';

import { registerFormatType } from '@wordpress/rich-text';

import citationFormat from './citation';
import footnoteFormat from './footnote';

function registerFormat(
    [name, config]: [
        string,
        {
            tagName: string;
            className?: string | null;
            title: string;
            attributes?: Record<string, string>;
            edit: unknown;
        },
    ],
) {
    registerFormatType(name, {
        ...config,
        name,
        interactive: false,
        object: false,
    } as Parameters<typeof registerFormatType>[1]);
}
registerFormat(citationFormat);
registerFormat(footnoteFormat);
