import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { univerPlugin } from '@univerjs/vite-plugin';

export default defineConfig({
    plugins: [react(), univerPlugin()],
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
