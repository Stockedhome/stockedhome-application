// So, I did check. Next.js could NOT tree shake common passwords so I had to move the client-side checking stuff to a separate file.

export const MAX_USERNAME_LENGTH = 1024;
export const MIN_USERNAME_LENGTH = 5;
export const MIN_USERNAME_UNIQUE_CHARACTERS = Math.round(MIN_USERNAME_LENGTH * 3 / 4)

/** Checks suitable to be run client-side on the user's password */
export function getClientSideReasonForInvalidUsername(username: string): UsernameInvalidityReason | null {
    if (username.length < MIN_USERNAME_LENGTH)
        return UsernameInvalidityReason.TooShort;

    if (username.length > MAX_USERNAME_LENGTH)
        return UsernameInvalidityReason.TooLong;

    if (new Set(username).size < MIN_USERNAME_UNIQUE_CHARACTERS)
        return UsernameInvalidityReason.NotEnoughUniqueCharacters

    if (username.match(/[^a-zA-Z0-9_]/)) // NOTE: If this is updated, you must also update the client-side error message
        return UsernameInvalidityReason.InvalidCharacters;

    return null;
}

export enum UsernameInvalidityReason {
    TooShort = 'TooShort',
    TooLong = 'TooLong',
    AlreadyInUse = 'AlreadyInUse',
    UnknownError = 'UnknownError',
    InvalidCharacters = 'InvalidCharacters',
    NotEnoughUniqueCharacters = 'NotEnoughUniqueCharacters',
}
