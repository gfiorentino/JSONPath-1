import babel from '@rollup/plugin-babel';
import {terser} from 'rollup-plugin-terser';
import pkg from './package.json';

/**
 * @external RollupConfig
 * @type {PlainObject}
 * @see {@link https://rollupjs.org/guide/en#big-list-of-options}
 */

/**
 * @param {PlainObject} config
 * @param {string} config.input
 * @param {boolean} config.minifying
 * @param {string} [config.environment='']
 * @param {string} [config.format='umd'} = {}]
 * @returns {external:RollupConfig}
 */
function getRollupObject ({
    input, minifying, environment, format = 'umd'
} = {}) {
    const nonMinified = {
        input,
        output: {
            format,
            sourcemap: minifying,
            file: `dist/index${environment ? `-${environment}` : ''}-${
                format
            }${minifying ? '.min' : ''}.${
                environment === 'node' && format === 'esm' ? 'm' : ''
            }js`,
            name: 'JSONPath'
        },
        plugins: [
            babel({
                babelrc: false,
                presets: [
                    environment === 'node'
                        ? ['@babel/preset-env', {
                            targets: [
                                `node ${pkg.engines.node}`
                            ]
                        }]
                        // Can come up with some browser targets
                        : ['@babel/preset-env']
                ],
                babelHelpers: 'bundled'
            })
        ]
    };
    if (minifying) {
        nonMinified.plugins.push(terser());
    }
    return nonMinified;
}

/**
 * @param {PlainObject} config
 * @param {boolean} config.minifying
 * @param {"node"|"environment"} [config.environment]
 * @returns {external:RollupConfig[]}
 */
function getRollupObjectByEnv ({minifying, environment}) {
    const input = `src/jsonpath-${environment}.js`;
    if (environment === 'node') {
        return [
            getRollupObject({input, minifying, environment, format: 'cjs'}),
            getRollupObject({input, minifying, environment, format: 'esm'})
        ];
    }
    return [
        getRollupObject({input, minifying, environment, format: 'umd'}),
        getRollupObject({input, minifying, environment, format: 'esm'})
    ];
}

// eslint-disable-next-line import/no-anonymous-default-export
export default [
    ...getRollupObjectByEnv({minifying: false, environment: 'node'}),
    // ...getRollupObjectByEnv({minifying: true, environment: 'node'}),
    ...getRollupObjectByEnv({minifying: false, environment: 'browser'}),
    ...getRollupObjectByEnv({minifying: true, environment: 'browser'})
];
