/**
 * Ensure wp-editor and wp-edit-post are loaded so PluginSidebar is available.
 * WP 6.6+ exposes it on wp.editor; older versions use wp.editPost.
 */
import '@wordpress/editor';
import '@wordpress/edit-post';

import { registerPlugin } from '@wordpress/plugins';

import sidebarPlugin from './sidebar';

registerPlugin(...sidebarPlugin);
