# Maintenance notes (vibed fork)

Summary of changes from the original Academic Blogger's Toolkit (2019–2021) in this fork for modern WordPress and PHP.

## 6.0.0 (Feb 2026)

### Block editor sidebar (abt-sidebar)

- **Cause:** In WordPress 6.5–6.6 the editor was unified; `PluginSidebar` and `PluginSidebarMoreMenuItem` moved from `wp.editPost` to `wp.editor`. The plugin was importing from `@wordpress/edit-post` and bundling components that rely on the `core/edit-post` store, which led to runtime errors in WP 6.6+.
- **Change:** Sidebar no longer imports these from the package. A small helper (`get-sidebar-components.ts`) resolves them at runtime from `window.wp.editor` (preferred) or `window.wp.editPost`, so the correct implementation for the current WordPress version is used.
- **Safety:** The sidebar is wrapped in an error boundary so any thrown error (e.g. from core) is caught and the plugin renders nothing instead of showing the editor error banner.

### PHP

- **Editor state:** `init_editor_state()` no longer assumes `get_option( ABT_OPTIONS_KEY )` is set; it uses a default citation style when options are missing and safely handles legacy `_abt-reflist-state` and invalid JSON.

### Compatibility

- Plugin headers and readme now require WordPress 6.5+, tested up to 6.9, and PHP 8.0+.

### Tooling / build

- **ESLint 9:** Flat config (`eslint.config.mjs`), `typescript-eslint`, `eslint-plugin-jsx-a11y`; removed `@dsifford/eslint-config`. All no-explicit-any warnings fixed (typed props, `Dashicon`, `onHover`).
- **Build:** copy-webpack-plugin upgraded to v9 (from v5); avoids ajv conflict with ESLint so `npm run build` and `npm run lint` both work in one install. Local types for copy-webpack-plugin in `types/modules.d.ts`. Sass: `@import` → `@use` in `frontend.scss`; webpack performance limits raised.
- **TypeScript:** Toolbar menu types and `abt/ui` selectors fixed; stub `@types` removed (packages supply types); `skipLibCheck: true` in tsconfig.
