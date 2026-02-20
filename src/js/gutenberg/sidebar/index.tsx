import { Component, createElement } from '@wordpress/element';
import type { ReactNode } from 'react';
import { useSelect } from '@wordpress/data';
import type { PluginSettings } from '@wordpress/plugins';

import Sidebar from './sidebar';

export const name = 'abt-sidebar';

/**
 * Only render Sidebar when abt/data and abt/ui stores are registered
 * (avoids "Cannot read properties of null (reading 'parseCitations')" when
 * editor-stores failed to load or load after the editor bundle).
 */
function SidebarGate() {
    const storesReady = (useSelect as unknown as (cb: (select: (key: string) => unknown) => boolean, deps: unknown[]) => boolean)(
        (select: (key: string) => unknown) => {
            try {
                select('abt/data');
                select('abt/ui');
                return true;
            } catch {
                return false;
            }
        },
        [],
    );
    if (!storesReady) {
        return null;
    }
    return createElement(Sidebar, {});
}

/**
 * Minimal error boundary that renders null on error so the plugin
 * does not show the "plugin has encountered an error" banner.
 */
class SidebarErrorBoundary extends Component<
    { children: ReactNode },
    { hasError: boolean }
> {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return null;
        }
        return this.props.children;
    }
}

export const settings: PluginSettings = {
    icon: 'welcome-learn-more',
    render: () =>
        createElement(SidebarErrorBoundary, {
            children: createElement(SidebarGate, {}),
        }),
};

export default [name, settings] as [string, typeof settings];
