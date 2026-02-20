/* eslint-disable @typescript-eslint/no-var-requires */
import { promises as fs } from 'fs';
import path from 'path';

import DependencyExtractionPlugin from '@wordpress/dependency-extraction-webpack-plugin';
import BrowserSyncPlugin from 'browser-sync-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { rollup } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { rimraf } from 'rimraf';
import type { Configuration } from 'webpack';
import { ProgressPlugin } from 'webpack';

import { version as VERSION } from './package.json';

// eslint-disable-next-line
export default async (_: any, argv: any): Promise<Configuration> => {
    const IS_PRODUCTION = argv.mode === 'production';
    const CHANGELOG = await getMostRecentChangelogEntry();

    // Clean out dist directory
    await rimraf(path.join(__dirname, 'dist', '*'));

    await Promise.all([
        rollup({
            input: 'citeproc',
            plugins: IS_PRODUCTION
                ? [nodeResolve(), commonjs(), terser()]
                : [nodeResolve(), commonjs()],
        }),
    ]).then(async ([citeproc]) =>
        Promise.all([
            citeproc.write({
                file: 'dist/vendor/citeproc.js',
                format: 'iife',
                name: 'CSL',
            }),
        ]),
    );

    const plugins: Configuration['plugins'] = [
        new DependencyExtractionPlugin({
            injectPolyfill: true,
            requestToExternal(request) {
                if (request === 'citeproc') {
                    return 'CSL';
                }
                return;
            },
        }),
        new MiniCssExtractPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: '**/*.{php,mo,pot}',
                    globOptions: { ignore: ['academic-bloggers-toolkit-vibed.php'] },
                },
                {
                    from: '*.json',
                    transform(content: Buffer) {
                        return JSON.stringify(JSON.parse(content.toString()));
                    },
                },
                {
                    from: path.resolve(__dirname, 'LICENSE'),
                },
                {
                    from: 'academic-bloggers-toolkit-vibed.php',
                    transform(content: Buffer) {
                        return content.toString().replace(/{{VERSION}}/g, VERSION);
                    },
                },
                {
                    from: 'readme.txt',
                    transform(content: Buffer) {
                        return content
                            .toString()
                            .replace(/{{VERSION}}/g, VERSION)
                            .replace(/{{CHANGELOG}}/g, CHANGELOG);
                    },
                },
            ],
        }),
    ];

    if (IS_PRODUCTION) {
        plugins.push(new ProgressPlugin());
    } else {
        plugins.push(
            new BrowserSyncPlugin({
                proxy: 'localhost:8080',
                open: false,
                reloadDebounce: 2000,
                port: 3005,
                notify: false,
            }) as any,
        );
    }

    return {
        devtool: IS_PRODUCTION ? 'source-map' : 'eval-cheap-module-source-map',
        watchOptions: {
            ignored: /(node_modules|__tests__)/,
        },
        context: path.resolve(__dirname, 'src'),
        entry: {
            'bundle/editor': 'js/gutenberg',
            'bundle/editor-blocks': 'js/gutenberg/blocks',
            'bundle/editor-formats': 'js/gutenberg/formats',
            'bundle/editor-stores': 'js/stores',
            'bundle/frontend': 'js/frontend',
            'bundle/options-page': 'js/options-page',
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist'),
        },
        resolve: {
            alias: {
                css: path.resolve(__dirname, 'src/css'),
                utils: path.resolve(__dirname, 'src/js/utils'),
                components: path.resolve(__dirname, 'src/js/components'),
                gutenberg: path.resolve(__dirname, 'src/js/gutenberg'),
                hooks: path.resolve(__dirname, 'src/js/hooks'),
                stores: path.resolve(__dirname, 'src/js/stores'),
            },
            modules: [path.resolve(__dirname, 'src'), 'node_modules'],
            extensions: ['*', '.ts', '.tsx', '.js', '.scss'],
            plugins: [
                new TsconfigPathsPlugin({
                    configFile: path.resolve(__dirname, 'tsconfig.json'),
                }) as any,
            ],
        },
        plugins,
        stats: IS_PRODUCTION ? 'errors-warnings' : 'minimal',
        performance: {
            maxEntrypointSize: 512000,
            maxAssetSize: 1024000,
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    sideEffects: false,
                    use: [
                        { loader: 'babel-loader' },
                        {
                            loader: 'ts-loader',
                            options: {
                                transpileOnly: true,
                                configFile: path.resolve(__dirname, 'tsconfig.json'),
                            },
                        },
                    ],
                },
                {
                    test: /\.scss$/,
                    rules: [
                        {
                            use: [MiniCssExtractPlugin.loader],
                        },
                        {
                            oneOf: [
                                {
                                    resourceQuery: /global/,
                                    use: [
                                        {
                                            loader: 'css-loader',
                                            options: {
                                                importLoaders: 2,
                                                modules: false,
                                            },
                                        },
                                    ],
                                },
                                {
                                    use: [
                                        {
                                            loader: 'css-loader',
                                            options: {
                                                importLoaders: 2,
                                                modules: {
                                                    localIdentName:
                                                        '[name]__[local]___[hash:base64:5]',
                                                    exportLocalsConvention:
                                                        'camelCaseOnly',
                                                    namedExport: false,
                                                },
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            use: [
                                {
                                    loader: 'postcss-loader',
                                    options: {
                                        postcssOptions: {
                                            plugins: [
                                                require('postcss-preset-env')(),
                                                ...(IS_PRODUCTION
                                                    ? [require('cssnano')()]
                                                    : []),
                                            ],
                                        },
                                    },
                                },
                                {
                                    loader: 'sass-loader',
                                    options: {
                                        sassOptions: {
                                            includePaths: ['src/css'],
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    };
};

function getMostRecentChangelogEntry(): Promise<string> {
    return fs
        .readFile(path.join(__dirname, 'CHANGELOG.md'), { encoding: 'utf-8' })
        .then(contents => {
            const entry = /(^## .*?)\n^## /ms.exec(contents);
            if (!entry || !entry[1]) {
                throw new Error('Error parsing last changelog entry');
            }
            return entry[1];
        })
        .then(entry =>
            entry.replace(/^## (\S+)/, '= $1 =').replace(/^-/gm, '*'),
        );
}
