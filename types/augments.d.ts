declare module '@wordpress/plugins' {
    export interface PluginSettings {
        icon?: string;
        render: () => import('react').ReactElement | null;
        [key: string]: unknown;
    }
    export function registerPlugin(name: string, settings: PluginSettings): void;
}

// prettier-ignore
declare module '@wordpress/data' {
    export function dispatch(key: 'abt/data'): typeof import('stores/data/actions');
    export function dispatch(key: 'abt/ui'): typeof import('stores/ui/actions');
    export function dispatch(key: string): Record<string, (...args: unknown[]) => unknown>;

    export function useDispatch(key: 'abt/data'): typeof import('stores/data/actions');
    export function useDispatch(key: 'abt/ui'): typeof import('stores/ui/actions');
    export function useDispatch(key: string): Record<string, (...args: unknown[]) => unknown>;

    export function select(key: 'abt/data'): typeof import('stores/data/selectors');
    export function select(key: 'abt/ui'): typeof import('stores/ui/selectors');
    export function select(key: string): Record<string, (...args: unknown[]) => unknown>;
}
