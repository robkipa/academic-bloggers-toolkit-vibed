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

## 6.0.2 (Feb 2026)

### Site Editor

- **Fix:** Avoid PHP fatal and white screen when opening the Site Editor. Editor state was using `$post->ID` while the Site Editor has no post; `init_editor_state()` now receives a valid post ID only when editing a post, and uses a default state otherwise. ABT editor script is not loaded on the Site Editor screen (no `core/editor` there), so the Site Editor loads normally. Data store reducer falls back to default state if the state script is missing.

## 6.0.1 (Feb 2026)

### Block validation (5.2.2 compatibility)

- **Cause:** Posts created with 5.2.2 store block markup with the core wrapper class `wp-block-abt-bibliography` (and same for footnotes, static-bibliography). In 6.0.0 the save functions only output `abt-bibliography` etc., so validation compared different HTML and failed.
- **Change:** Save output for all three blocks now includes the `wp-block-*` class on the wrapper (`wp-block-abt-bibliography abt-bibliography`, etc.) so it matches existing content.
