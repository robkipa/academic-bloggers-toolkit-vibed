/**
 * Provide regeneratorRuntime in editor iframe (formats bundle may include generator code).
 */
import 'regenerator-runtime/runtime';

import { registerFormatType } from '@wordpress/rich-text';

import citationFormat from './citation';
import footnoteFormat from './footnote';

registerFormatType(...citationFormat);
registerFormatType(...footnoteFormat);
