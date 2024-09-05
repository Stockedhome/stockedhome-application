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

const config = getDefaultConfig(expoRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [projectRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
    fs.readdirSync(projectRoot).map(dir => path.resolve(projectRoot, '.pnpm', dir, 'node_modules')),
    path.resolve(expoRoot, 'node_modules'),
    path.resolve(projectRoot, 'node_modules'),
].flat();

config.resolver.assetExts = [
    ...config.resolver.assetExts ?? [],
    ...config.resolver.assetExts?.map(ext => `/index${ext}`) ?? [],
    'index.ts',
    'index.tsx',
];

// 3. Make sure we're doing stuff right for PNPM
config.resolver.disableHierarchicalLookup = false;
config.resolver.unstable_enableSymlinks = true;
//config.resolver.unstable_enablePackageExports = true;

module.exports = config;
