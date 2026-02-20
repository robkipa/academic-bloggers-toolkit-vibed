> # Call for contributors
> This plugin has received its first updates in seven years thanks to AI-assisted development, but it needs humans to suggest changes and improvements. If you use it and have ideas, bug reports, or patches, please open an issue or pull request. Thank you!

**Credits.** This is a modernized fork of [Academic Blogger's Toolkit](https://github.com/dsifford/academic-bloggers-toolkit) by [Derek P Sifford](https://github.com/dsifford).

![ABT Banner](http://i.imgur.com/UxBG7NB.png)
[![Donate](https://img.shields.io/badge/%E2%9D%A4-donate-brightgreen.svg)](https://paypal.me/robkipa/10)
[![WordPress](https://img.shields.io/wordpress/plugin/dt/academic-bloggers-toolkit.svg?maxAge=2592000)](https://wordpress.org/plugins/academic-bloggers-toolkit/)
[![WordPress rating](https://img.shields.io/wordpress/plugin/r/academic-bloggers-toolkit.svg?maxAge=2592000)](https://wordpress.org/plugins/academic-bloggers-toolkit/)

An **open source** WordPress plugin providing an all-in-one solution for effective academic blogging.

## Contents

-   [Features](#features)
-   [Migrating from the original plugin](#migrating-from-the-original-plugin)
-   [Translations](#translations)
-   [Contributing](#contributing)
-   [Documentation](https://github.com/robkipa/academic-bloggers-toolkit-vibed)

### Manifesto

> To my knowledge, there is not one citation plugin that exists for WordPress that does its job the way it should. Every other citation plugin uses WordPress shortcodes to render citations. Is that a bad thing. **Yes**. Here's why:

> Once you commit to using a plugin that uses shortcodes to render content, you're stuck with it for the life of your website. If you uninstall that plugin, all posts which rely on the shortcodes from that plugin break. Additionally, if the person who wrote the plugin decides he/she no longer wants to support it and the shortcode API changes, all of your posts will break. **This is unacceptable for academic writing**.

> This plugin generates plain, beautiful HTML and renders it at the time of insertion. There are **zero** shortcodes. There is **zero** chance of your posts breaking.

> Need to write one long blog post with lots of references? Download this plugin, write the post, and then delete the plugin if you don't need it any longer. **Freedom.**

## Migrating from the original plugin

If you were using the original Academic Blogger's Toolkit and want to switch to this fork:

1. **Deactivate** the old plugin (Plugins → Installed Plugins).
2. **Delete** the old plugin. Your references and bibliographies are stored in your posts (block content and post meta), so removing the plugin does not remove any of that. The only thing that is cleared when you delete the plugin is the site-wide citation style setting in Settings; you can choose it again after installing this one.
3. **Upload** the zip of Academic Blogger's Toolkit Vibed (Plugins → Add New → Upload Plugin) and **Activate** it.

**Important:** Delete the old plugin *before* activating this one. If you activate this plugin while the old one is still installed, WordPress will later complain about “deregistering” or redeclaring the same function names when you try to remove the old plugin. Deactivate and delete the old plugin first, then install and activate this one—everything will work.

## Features

-   Insert formatted references on the fly using **PMID**, **PMCID**, **DOI** (CrossRef, DataCite, & mEDRA), **URL**, or **ISBN**.
-   Manually insert formatted references from **over 15 types of references**.
-   **Import a full bibliography from your favorite reference manager** using an exported `.ris` or `BibTeX` file.
-   Automatically format references for **every citation style on planet earth** (over 1300).
-   **Fully interactive** reference list which lives beside the post editor.
-   **Search PubMed from the post editor** and insert references instantly.
-   Inline citations display full formatted references on the frontend when hovered with the mouse (or when tapped on mobile). No more scrolling down and losing your focus!

## Translations

<p align="center"><a href="https://translate.wordpress.org/projects/wp-plugins/academic-bloggers-toolkit"><strong>Click Here to Translate this Plugin</strong></a></p>

## Contributing

If you'd like to contribute to this project, please read the [contributor guide](./.github/CONTRIBUTING.md).
