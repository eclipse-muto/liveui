
const path = require('path');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const terser = require('@rollup/plugin-terser');

const { liveuiConfig, appDirectory } = require('../utils/dev-utils');

const copy = require('rollup-plugin-copy');



const production = !process.env.ROLLUP_WATCH;
const { exposes, shared } = liveuiConfig

const plugins = [
  copy({
    targets: [
      { src:  path.join(__dirname, '..', 'utils/resources/docker/**/*'), dest: path.join(process.cwd(), 'docker/') }
    ]
  }),
  commonjs({
    strictRequires: true,
    sourceMap: true,
    inlineSources: true,
  }),
  nodeResolve({
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  }),
  typescript({
    tsconfig: path.resolve(appDirectory, 'tsconfig.json'),
    sourceMap: true,
    inlineSources: true,
  }),
  production && terser()
]

const bundles = Object.keys(exposes).map(e => {

  let input = {};
  input[e] = path.resolve(appDirectory, exposes[e])
  return {
    input,
    output: {
      banner: '/** eclipse-muto/liveui */',
      entryFileNames: '[name].js',
      dir: 'docker/dist',
      format: "commonjs",
      generatedCode: 'es5',
      name: 'liveui',
      exports: 'auto',
      sourcemap: "inline"
    },
    external: shared || [],
    plugins
  }
})

module.exports = bundles;
