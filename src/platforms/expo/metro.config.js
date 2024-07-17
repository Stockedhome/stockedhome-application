// Learn more https://docs.expo.dev/guides/monorepos
// Learn more https://docs.expo.io/guides/customizing-metro
/**
 * @type {import('expo/metro-config')}
 */
const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const interfaceRoot = path.resolve(__dirname, '../../interface')
const libRoot = path.resolve(__dirname, '../../lib')
const workspaceRoot = path.resolve(projectRoot, '../../../')

const config = getDefaultConfig(projectRoot)

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot]
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]
config.resolver.extraNodeModules = {
  'interface': interfaceRoot,
  'lib': libRoot,
  'solito': path.resolve(workspaceRoot, 'src/forks/solito'),
}

config.resolver.assetExts = [
  ...config.resolver.assetExts ?? [],
  ...config.resolver.assetExts?.map(ext => `/index${ext}`) ?? [],
  'index.ts',
  'index.tsx',
]
// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true

module.exports = config
