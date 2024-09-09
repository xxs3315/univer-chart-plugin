/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const process = require('node:process');
const { writeFileSync } = require('node:fs');
const { convertLibNameFromPackageName } = require('./utils');

exports.autoExternalizeDependency = function autoExternalizeDependency() {
    const externals = new Set();
    const globals = {};
    let hasCss = false;

    const externalMap = {
        '@univerjs/core': {
            global: '@univerjs/core',
            name: '@univerjs/core',
            version: '>=0.1.15',
        },
        '@univerjs/design': {
            global: '@univerjs/design',
            name: '@univerjs/design',
            version: '>=0.1.15',
        },
        '@univerjs/icons': {
            global: '@univerjs/icons',
            name: '@univerjs/icons',
            version: '>=0.1.15',
        },
        '@univerjs/sheets': {
            global: '@univerjs/sheets',
            name: '@univerjs/sheets',
            version: '>=0.1.15',
        },
        '@univerjs/ui': {
            global: '@univerjs/ui',
            name: '@univerjs/ui',
            version: '>=0.1.15',
        },
        '@univerjs/sheets-formula': {
            global: '@univerjs/sheets-formula',
            name: '@univerjs/sheets-formula',
            version: '>=0.1.15',
        },
        '@univerjs/sheets-ui': {
            global: '@univerjs/sheets-ui',
            name: '@univerjs/sheets-ui',
            version: '>=0.1.15',
        },
        '@univerjs/engine-formula': {
            global: '@univerjs/engine-formula',
            name: '@univerjs/engine-formula',
            version: '>=0.1.15',
        },
        'react-dom': {
            global: 'ReactDOM',
            name: 'react-dom',
            version: '^16.9.0 || ^17.0.0 || ^18.0.0',
        },
        'react-grid-layout': {
            global: 'react-grid-layout',
            name: 'react-grid-layout',
            version: '>=1.4.4',
        },
        'react-resizable': {
            global: 'react-resizable',
            name: 'react-resizable',
            version: '>=3.0.5',
        },
        'rc-dialog': {
            global: 'rc-dialog',
            name: 'rc-dialog',
            version: '>=9.5.2',
        },
        'react-draggable': {
            global: 'react-draggable',
            name: 'react-draggable',
            version: '>=4.4.6',
        },
        clsx: {
            global: 'clsx',
            name: 'clsx',
            version: '>=2.0.0',
        },
        dayjs: {
            global: 'dayjs',
            name: 'dayjs',
            version: '>=1.11.0',
        },
        lodash: {
            global: 'lodash',
            name: 'lodash',
            version: '>=4.0.0',
        },
        'lodash/debounce': {
            global: 'lodash.debounce',
            name: 'lodash',
            version: 'lodash',
        },
        'monaco-editor': {
            global: 'monaco',
            name: 'monaco-editor',
            version: '>=0.44.0',
        },
        react: {
            global: 'React',
            name: 'react',
            version: '^16.9.0 || ^17.0.0 || ^18.0.0',
        },
        rxjs: {
            global: 'rxjs',
            name: 'rxjs',
            version: '>=7.0.0',
        },
        'rxjs/operators': {
            global: 'rxjs.operators',
            name: 'rxjs',
            version: 'rxjs',
        },
        vue: {
            global: 'Vue',
            name: 'vue',
            version: '>=3.0.0',
            optional: true,
        },
        echarts: {
            global: 'echarts',
            name: 'echarts',
            version: '>=5.5.0',
        },
    };

    return {
        name: 'auto-detected-external',
        enforce: 'pre',
        apply: 'build',

        resolveId(source) {
            if (source.endsWith('.less') || source.endsWith('.css')) {
                hasCss = true;
            }

            if (source in externalMap) {
                externals.add(source);
                globals[source] = externalMap[source].global;

                return { id: source, external: true };
            } else if (source.startsWith('@univerjs')) {
                if (source === '@univerjs/icons') {
                    return null;
                }
                if (source === '@univerjs/protocol') {
                    return null;
                }

                externals.add(source);

                globals[source] = convertLibNameFromPackageName(source);

                return { id: source, external: true };
            }

            return null;
        },

        outputOptions(opts) {
            opts.globals = globals;

            if (hasCss) {
                opts.assetFileNames = 'index.css';
            }

            return opts;
        },

        generateBundle() {
            // generate peerDependencies
            const pkg = require(`${process.cwd()}/package.json`);
            const peerDependencies = {};
            let optionalDependencies;

            Array.from(externals)
                .sort()
                .filter((ext) => {
                    return !ext.endsWith('.less');
                })
                .forEach((ext) => {
                    const { version, name, optional } = externalMap[ext] ?? {};

                    if (version) {
                        if (version !== name) {
                            if (optional) {
                                if (!optionalDependencies) {
                                    optionalDependencies = {};
                                }
                                optionalDependencies[ext] = version;
                            } else {
                                peerDependencies[ext] = version;
                            }
                        } else {
                            if (!peerDependencies[version]) {
                                peerDependencies[name] = externalMap[version].version;
                            }
                        }
                    }/* else {
                        peerDependencies[ext] = 'workspace:*';
                    }*/
                });

            if (Object.keys(peerDependencies).length) {
                pkg.peerDependencies = peerDependencies;
            }
            if (optionalDependencies) {
                pkg.optionalDependencies = optionalDependencies;
            }

            writeFileSync(
                `${process.cwd()}/package.json`,
                `${JSON.stringify(pkg, null, 4)}\n`
            );
        },
    };
};
