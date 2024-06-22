import { withExpo } from "@expo/next-adapter";
import withFonts from "next-fonts";
import fs from 'fs';

if (fs.existsSync('../../../.env')) {
    if (!fs.existsSync('./.env')) fs.symlinkSync('../../../.env', './.env', 'file');
}

/** @type {import('next').NextConfig} */
const nextConfig = withExpo(withFonts(
    {
        //        // reanimated (and thus, Moti) doesn't work with strict mode currently...
        //        // https://github.com/nandorojo/moti/issues/224
        // fixed? // https://github.com/necolas/react-native-web/pull/2330
        //        // https://github.com/nandorojo/moti/issues/224
        //        // once that gets fixed, set this back to true
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

//        webpack(config, options) {
//            config.resolve.alias = {
//                ...(config.resolve.alias || {}),
//                '@react-native/assets-registry': '../../forks/assets-registry-web'
//            }
//
//            config.plugins.push(
//                new webpack.NormalModuleReplacementPlugin(/@react-native\/assets-registry/, '../../forks/assets-registry-web')
//            )
//
//            return config;
//        },

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
        ],

        //resolveAlias: {
        //    '@react-native/assets-registry': 'react-native-web/dist/exports/AssetsRegistry',
        //},

        basePath: "/web",
    }
));

export default nextConfig;
