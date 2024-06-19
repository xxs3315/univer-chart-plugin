import { resolve } from 'node:path';
import process from 'node:process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { univerPlugin } from '@univerjs/vite-plugin';

import dts from 'vite-plugin-dts';

const dirname = process.cwd();

export default defineConfig({
    build: {
        target: 'chrome70',
        outDir: 'lib',
        lib: {
            entry: resolve(dirname, 'src/index.ts'),
            name: 'univer-chart-plugin',
            fileName: (format) => `${format}/index.js`,
            formats: ['es', 'umd', 'cjs'],
        },
        rollupOptions: {
        // 确保外部化处理那些你不想打包进库的依赖
            external: ['vue', '@univerjs/core', '@univerjs/design', '@univerjs/docs', '@univerjs/docs-ui', '@univerjs/engine-formula',
                '@univerjs/engine-numfmt', '@univerjs/engine-render', '@univerjs/facade', '@univerjs/icons', '@univerjs/sheets',
                '@univerjs/sheets-formula', '@univerjs/sheets-ui', '@univerjs/ui', '@univerjs/vite-plugin', '@wendellhu/redi',
                'clsx', 'echarts', 'react', 'react-dom', 'react-grid-layout', 'react-resizable', 'rc-dialog', 'react-draggable', 'rxjs'],
            output: {
          // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                globals: {
                    vue: 'Vue',
                    react: 'React',
                    clsx: 'clsx',
                    echarts: 'echarts',
                    rxjs: 'rxjs',
                    '@univerjs/core': '@univerjs/core',
                    '@univerjs/design': '@univerjs/design',
                    '@univerjs/engine-formula': '@univerjs/engine-formula',
                    '@univerjs/icons': '@univerjs/icons',
                    '@univerjs/sheets': '@univerjs/sheets',
                    '@univerjs/sheets-formula': '@univerjs/sheets-formula',
                    '@univerjs/sheets-ui': '@univerjs/sheets-ui',
                    '@univerjs/ui': '@univerjs/ui',
                    'react-dom': 'ReactDOM',
                    'react-grid-layout': 'react-grid-layout',
                    'react-resizable': 'react-resizable',
                    'rc-dialog': 'rc-dialog',
                    'react-draggable': 'react-draggable',
                    '@wendellhu/redi': '@wendellhu/redi',
                    '@wendellhu/redi/react-bindings': '@wendellhu/redi/react-bindings',
                },
            },
        },
    },
    plugins: [
        dts({
            entryRoot: 'src',
            outDir: 'lib/types',
        }),
        // buildPkg(),
        react(),
        univerPlugin(),
    ],
    css: {
        modules: {
            localsConvention: 'camelCaseOnly',
            generateScopedName: 'univer-[local]',
        },
        preprocessorOptions: {
            less: {
                math: 'always',
                relativeUrls: true,
                javascriptEnabled: true,
            },
        },
    },
});
