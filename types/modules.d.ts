declare module '*.scss' {
    const content: Record<string, string>;
    export = content;
}

declare module 'copy-webpack-plugin' {
    import type { Compiler } from 'webpack';
    interface Pattern {
        from: string;
        to?: string;
        context?: string;
        globOptions?: Record<string, unknown>;
        filter?: (path: string) => boolean;
        transform?: (content: Buffer, path: string) => string | Buffer;
    }
    interface Options {
        patterns: Pattern[];
    }
    class CopyWebpackPlugin {
        constructor(options: Options);
        apply(compiler: Compiler): void;
    }
    export = CopyWebpackPlugin;
}
