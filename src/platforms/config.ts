import yaml from 'js-yaml';
import fs from 'fs/promises';

export enum HostingConfiguration {
    Development = 'development',
    Local = 'local',
    SoftwareAsAService = 'saas',
}

export function getHostingConfiguration(): HostingConfiguration {
    if (!process.env.HOSTING_CONFIGURATION) {
        throw new Error('No hosting configuration (process.env.HOSTING_CONFIGURATION) found. [https://docs.stockedhome.app/hosting/#environment-variables]');
    }

    switch (process.env.HOSTING_CONFIGURATION) {
        case 'development':
            return HostingConfiguration.Development;
        case 'local':
            return HostingConfiguration.Local;
        case 'saas':
            return HostingConfiguration.SoftwareAsAService;
        default:
            throw new Error(`Unknown hosting configuration (process.env.HOSTING_CONFIGURATION) found: ${process.env.HOSTING_CONFIGURATION} [https://docs.stockedhome.app/hosting/#environment-variables]`);
    }
}

export function loadConfig() {

}
