/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * This configuration allow module linking (with `yarn link`)
 * See https://github.com/react-native-community/cli/issues/1238#issue-673055870 for details
 *
 * @format
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { readdirSync, lstatSync, readlinkSync, statSync, existsSync, readFileSync } = require('fs')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { join, resolve, isAbsolute, relative } = require('path')

// eslint-disable-next-line @typescript-eslint/no-var-requires
const appendExclusions = require('metro-config/src/defaults/exclusionList')

// Escape function taken from the MDN documentation: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

// NOTE: The Metro bundler does not support symlinks (see https://github.com/facebook/metro/issues/1), which NPM uses for local packages.
//       To work around this, we supplement the logic to follow symbolic links.

// Create a mapping of package ids to linked directories.
function processModuleSymLinks() {
  const nodeModulesPath = resolve(__dirname, 'node_modules')
  let moduleMappings = {}
  let moduleExclusions = []

  function findPackageDirs(directory) {
    readdirSync(directory).forEach((item) => {
      const itemPath = resolve(directory, item)
      const itemStat = lstatSync(itemPath)
      if (itemStat.isSymbolicLink()) {
        let linkPath = readlinkSync(itemPath)
        // Sym links are relative in Unix, absolute in Windows.
        if (!isAbsolute(linkPath)) {
          linkPath = resolve(directory, linkPath)
        }
        const linkStat = statSync(linkPath)
        if (linkStat.isDirectory()) {
          const packagePath = resolve(linkPath, 'package.json')
          if (existsSync(packagePath)) {
            const packageId = relative(nodeModulesPath, itemPath)
            moduleMappings[packageId] = linkPath

            const packageInfoData = readFileSync(packagePath)
            const packageInfo = JSON.parse(packageInfoData)

            // Search for any dev dependencies of the package. They should be excluded from metro so the packages don't get
            // imported twice in the bundle.
            for (let devDependency in packageInfo.devDependencies) {
              moduleExclusions.push(
                new RegExp(escapeRegExp(join(linkPath, 'node_modules', devDependency)) + '/.*')
              )
            }
                        // Search for any dev dependencies of the package. They should be excluded from metro so the packages don't get
            // imported twice in the bundle.
            for (let peerDependency in packageInfo.peerDependencies) {
              moduleExclusions.push(
                new RegExp(escapeRegExp(join(linkPath, 'node_modules', peerDependency)) + '/.*')
              )
            }
  
          }
        }
      } else if (itemStat.isDirectory()) {
        findPackageDirs(itemPath)
      }
    })
  }

  findPackageDirs(nodeModulesPath)

  return [moduleMappings, moduleExclusions]
}

const [moduleMappings, moduleExclusions] = processModuleSymLinks()
console.log('Mapping the following sym linked packages:') // eslint-disable-line no-console
console.log(moduleMappings) // eslint-disable-line no-console

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },

  resolver: {
    blacklistRE: appendExclusions(moduleExclusions),
  }
}