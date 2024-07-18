// Learn more https://docs.expo.dev/guides/monorepos
// Learn more https://docs.expo.io/guides/customizing-metro

const fs = require('fs');
const path = require('path');

console.log('Entering Metro Bundler config 🎇');

const expoRoot = __dirname;
const projectRoot = path.resolve(expoRoot, '../../../');

if (!fs.existsSync(path.join(expoRoot, './.env'))) {
    if (fs.existsSync(path.join(projectRoot, './.env'))) {
        fs.symlinkSync(path.join(projectRoot, './.env'), path.join(expoRoot, './.env'), 'file');
        console.log('Symlinked .env from project root to expo root. You will need to restart the Expo server to pick up the changes.');
        process.exit(1);
    }
}


/**
 * @type {import('expo/metro-config')}
 */
const { getDefaultConfig } = require('expo/metro-config');

const interface = path.resolve(projectRoot, 'src/interface');
const lib = path.resolve(projectRoot, 'src/lib');
const solito = path.resolve(projectRoot, 'src/forks/solito');

const config = getDefaultConfig(expoRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [projectRoot];
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
    path.resolve(expoRoot, 'node_modules'),
    path.resolve(interface, 'node_modules'),
    path.resolve(projectRoot, 'node_modules'),
];
config.resolver.extraNodeModules = {
    interface,
    lib,
    solito
};

config.resolver.assetExts = [
    ...config.resolver.assetExts ?? [],
    ...config.resolver.assetExts?.map(ext => `/index${ext}`) ?? [],
    'index.ts',
    'index.tsx',
];
// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
