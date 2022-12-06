
const path = require('path');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const terser = require('@rollup/plugin-terser');
const { liveuiConfig, appDirectory } = require('../utils/dev-utils');

const dev = require('rollup-plugin-dev')



const production = !process.env.ROLLUP_WATCH;
const { shared, microPort, exposes } = liveuiConfig
const port = microPort || 10001;
const allProxy = Object.keys(exposes).map(exposed => { return { from: '/' + exposed, to: 'http://localhost:' + port + '/' + exposed + '.js' } })

const devServer = dev({ 
  dirs:[path.resolve(appDirectory, 'dist'), path.resolve(appDirectory, 'public'), path.resolve(appDirectory, 'docker/dist')], 
  port, 
  force: true,
  proxy: allProxy, 
  // execute function after server has begun listening
  onListen: function (server) {
    //console.log(server)
    console.log(`Server listening at http://localhost:${port}/`)
  } })

const plugins = [
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

let addDevServer = true;
const bundles = Object.keys(exposes).map(e => {
  let p = plugins;
  if (addDevServer) {
    p = [...plugins, devServer]
    addDevServer = false
  }
  let input = {};
  input[e] = path.resolve(appDirectory, exposes[e])
  return {
    input,
    output: {
      banner: '/** eclipse-muto/liveui */',
      entryFileNames: '[name].js',
      dir: 'docker/dist',
      format: "cjs",
      generatedCode: 'es5',
      name: 'liveui',
      exports: 'named',
      sourcemap: "inline",
    },
    external: shared || [],
    plugins: p
  }
})

module.exports = bundles;
