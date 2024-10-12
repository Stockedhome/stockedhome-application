import type { ExpoConfig, ConfigContext } from 'expo/config';
import rootPackageJson from '../../../package.json';

const IS_DEV = process.env.APP_VARIANT === 'development';

const fs = require('fs');
const path = require('path');

console.log('Entering Expo app config. IS_DEV:', IS_DEV);

const expoRoot = __dirname;
const projectRoot = path.resolve(expoRoot, '../../../');

if (!fs.existsSync(path.join(expoRoot, './.env'))) {
    if (fs.existsSync(path.join(projectRoot, './.env'))) {
        fs.symlinkSync(path.join(projectRoot, './.env'), path.join(expoRoot, './.env'), 'file');
        console.log('Symlinked .env from project root to expo root. You will need to restart the Expo server to pick up the changes.');
        process.exit(1);
    }
}


export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    "name": IS_DEV ? "Stockedhome (Dev)" : "Stockedhome",
    "slug": IS_DEV ? "stockedhome-dev" : "stockedhome",
    "version": rootPackageJson.version,
    "scheme": IS_DEV ? "stockedhome-dev" : "stockedhome",
    "platforms": [
        "ios",
        "android"
    ],
    "ios": {
        "supportsTablet": true,
        "bundleIdentifier": IS_DEV ? "app.stockedhome.mobile.dev" : "app.stockedhome.mobile",
        "associatedDomains": ["webcredentials:stockedhome.app"]
    },
    "android": {
        "package": IS_DEV ? "app.stockedhome.mobile.dev" : "app.stockedhome.mobile",
        "adaptiveIcon": {
            "backgroundColor": "#146fc7",
            "foregroundImage": "./assets/shared/logo-transparent-adaptive.png",
            "monochromeImage": "./assets/shared/logo-notification-adaptive.png"
        },
        "intentFilters": [
            {
                "autoVerify": true,
                "data": [
                    {
                        "scheme": "https",
                        "host": "stockedhome.app"
                    }
                ],
                "action": "VIEW",
                "category": [
                    "BROWSABLE",
                    "DEFAULT"
                ]
            },
            {
                "autoVerify": false,
                "data": [
                    {
                        "scheme": "https",
                        "host": "self.bellcube.dev"
                    }
                ],
                "action": "VIEW",
                "category": [
                    "BROWSABLE",
                    "DEFAULT"
                ]
            }
        ]
    },
    "backgroundColor": "#222",
    "userInterfaceStyle": "dark",
    "icon": "./assets/shared/logo-background.128.png",
    "splash": {
        "backgroundColor": "#146fc7",
        "image": "./assets/shared/logo-transparent.1024.png",
        "resizeMode": "contain"
    },
    "plugins": [
        "expo-router",
        [
            "expo-build-properties",
            {
                "ios": {
                    "deploymentTarget": "15.0"
                },
                "android": {
                    "compileSdkVersion": 34
                }
            }
        ]
    ],
    "extra": {
        "router": {
            "origin": false
        },
        "eas": {
            "projectId": "412cfc9a-3f35-413c-9082-3bd3661ff4b2"
        }
    },
    "githubUrl": "https://github.com/Stockedhome/stockedhome",
    "owner": "stockedhome",
    "jsEngine": "hermes",
    "developmentClient": {
        "silentLaunch": true
    }
});
