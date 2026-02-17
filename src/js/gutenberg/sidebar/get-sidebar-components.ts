/**
 * Resolves PluginSidebar and PluginSidebarMoreMenuItem from the correct WordPress global.
 * WP 6.6+ exposes these on wp.editor (unified API); older versions use wp.editPost.
 * Using the runtime global avoids bundling edit-post and ensures compatibility with
 * the store (core/editor vs core/edit-post) that the current WordPress version uses.
 */

type SidebarComponent = (props: Record<string, unknown>) => JSX.Element | null;

declare global {
    interface Window {
        wp?: {
            editor?: {
                PluginSidebar?: SidebarComponent;
                PluginSidebarMoreMenuItem?: SidebarComponent;
            };
            editPost?: {
                PluginSidebar?: SidebarComponent;
                PluginSidebarMoreMenuItem?: SidebarComponent;
            };
        };
    }
}

/**
 * @returns PluginSidebar from wp.editor (6.6+) or wp.editPost (fallback).
 */
export function getPluginSidebar(): SidebarComponent | undefined {
    const wp = typeof window !== 'undefined' ? window.wp : undefined;
    if (wp && wp.editor && wp.editor.PluginSidebar) {
        return wp.editor.PluginSidebar;
    }
    if (wp && wp.editPost && wp.editPost.PluginSidebar) {
        return wp.editPost.PluginSidebar;
    }
    return undefined;
}

/**
 * @returns PluginSidebarMoreMenuItem from wp.editor (6.6+) or wp.editPost (fallback).
 */
export function getPluginSidebarMoreMenuItem(): SidebarComponent | undefined {
    const wp = typeof window !== 'undefined' ? window.wp : undefined;
    if (wp && wp.editor && wp.editor.PluginSidebarMoreMenuItem) {
        return wp.editor.PluginSidebarMoreMenuItem;
    }
    if (wp && wp.editPost && wp.editPost.PluginSidebarMoreMenuItem) {
        return wp.editPost.PluginSidebarMoreMenuItem;
    }
    return undefined;
}
