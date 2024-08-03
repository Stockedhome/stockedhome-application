import { withExpo } from "@expo/next-adapter";
import withFonts from "next-fonts";
import fs from 'fs';
import url from 'url';
import path from 'path';

console.log('Entering Next.js config 🎇');

const nextRoot = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.join(nextRoot, '../../../');

if (!fs.existsSync(path.join(nextRoot, './.env'))) {
    if (fs.existsSync(path.join(projectRoot, './.env'))) fs.symlinkSync(path.join(projectRoot, './.env'), path.join(nextRoot, './.env'), 'file');
}

/** @type {import('next').NextConfig} */
const nextConfig = withExpo(withFonts(
    /** @type {import('next').NextConfig} */
    {
        //       // ~~reanimated (and thus, Moti) doesn't work with strict mode currently...~~
        // fixed // ~~https://github.com/nandorojo/moti/issues/224~~
        //       // https://github.com/necolas/react-native-web/pull/2330
        reactStrictMode: true,

        experimental: {
            forceSwcTransforms: true,
            instrumentationHook: true,
//            turbo: {
//                resolveAlias: {
//                    // Alias direct react-native imports to react-native-web
//                    "react-native$": "react-native-web",
//
//                    // Alias internal react-native modules to react-native-web
//                    "react-native/Libraries/EventEmitter/RCTDeviceEventEmitter$": "react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter",
//
//                    "react-native/Libraries/vendor/emitter/EventEmitter$": "react-native-web/dist/vendor/react-native/emitter/EventEmitter",
//                    "react-native/Libraries/EventEmitter/NativeEventEmitter$": "react-native-web/dist/vendor/react-native/NativeEventEmitter",
//
//                    '@react-native/assets-registry/registry': 'react-native-web/dist/exports/AssetsRegistry',
//                },
//                resolveExtensions: [".web.tsx", ".web.ts", ".web.jsx", ".web.js", ".web.mjs", ".web.json", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json", ".web.tsx", ".web.ts", ".web.jsx", ".web.js", ".web.mjs", ".web.json"],
//            },
        },

    /** @param {import('webpack').Configuration} config */
       webpack(config, options) {
            return config;
       },

        transpilePackages: [
            "react-native",
            "react-native-web",
            "solito",
            "dripsy",
            "@dripsy/core",
            "moti",
            "app",
            "react-native-reanimated",
            "@expo/html-elements",
            "react-native-gesture-handler",
            'expo',
            '@react-native/assets-registry',
        ],

        //resolveAlias: {
        //    '@react-native/assets-registry': 'react-native-web/dist/exports/AssetsRegistry',
        //},
    }
));

export default nextConfig;
