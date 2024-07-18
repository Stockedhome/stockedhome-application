export enum ConfigInvalidityReason {
    InvalidURL = 'InvalidURL',
    InvalidConfig = 'InvalidConfig',
    NoConfigReturned = 'NoConfigReturned',
    CouldNotConnect = 'CouldNotConnect',
}

export function stringifyConfigInvalidityReason(reason: ConfigInvalidityReason) {
    switch (reason) {
        case ConfigInvalidityReason.InvalidURL:
            return 'The URL you entered is invalid. Double-check you typed the right thing!'
        case ConfigInvalidityReason.InvalidConfig:
            return 'We got something from the server, but we didn\'t get a valid config. Make sure the server is set up correctly.'
        case ConfigInvalidityReason.NoConfigReturned:
            return 'We connected to a server but couldn\'t get a config from it. Make sure you typed the correct URL in and that the server is set up correctly.'
        case ConfigInvalidityReason.CouldNotConnect:
            return 'We couldn\'t connect to the server. Make sure you typed the correct URL in and that the server is up and running.'
    }
}
