import { fileURLToPath, URL } from 'node:url';
import createViteConfig from '@univerjs/shared/vite';
import { univerPlugin } from '@univerjs/vite-plugin';
import vue from '@vitejs/plugin-vue';
import pkg from './package.json';

export default ({ mode }) => createViteConfig({
    plugins: [
        univerPlugin(),
        vue(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
}, {
    mode,
    pkg,
    features: {
        react: false,
        css: true,
        dom: true,
    },
});
