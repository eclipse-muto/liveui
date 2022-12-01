/**
 * Copyright Composiv Inc and its affiliates
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/
const spawn = require('cross-spawn');

const { liveuiConfig } = require('../utils/dev-utils');

const port = liveuiConfig.microPort || 5001;
console.log('Rolloup listening at localhost:', port);
const rollup =  require.resolve('rollup/dist/bin/rollup')
const rollupConfig =  require.resolve('../config/rollup.config.build.cjs')

const nodeArgs = [ rollup, "--config", rollupConfig];
console.log(rollup, nodeArgs)
const result = spawn.sync(
  "node",
   nodeArgs,
  { stdio: 'inherit' }
);
if (result.signal) {
  if (result.signal === 'SIGKILL') {
      console.log(
          'The build failed because the process exited too early. ' +
          'This probably means the system ran out of memory or someone called ' +
          '`kill -9` on the process.'
      );
  } else if (result.signal === 'SIGTERM') {
      console.log(
          'The build failed because the process exited too early. ' +
          'Someone might have called `kill` or `killall`, or the system could ' +
          'be shutting down.'
      );
  }
  process.exit(1);
}
process.exit(result.status);