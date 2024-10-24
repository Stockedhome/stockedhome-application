// So, I did check. Next.js could NOT tree shake common passwords so I had to move the client-side checking stuff to a separate file.

export const MAX_PASSWORD_LENGTH = 1024;
export const MIN_PASSWORD_LENGTH = 6;

/** Checks suitable to be run client-side on the user's password */
export function getClientSideReasonForInvalidPassword(password: string): PasswordInvalidityReason | null {
    if (password.length < MIN_PASSWORD_LENGTH)
        return PasswordInvalidityReason.TooShort;

    if (password.length > MAX_PASSWORD_LENGTH)
        return PasswordInvalidityReason.TooLong;

    return null;
}

export enum PasswordInvalidityReason {
    TooShort = 'TooShort',
    TooLong = 'TooLong',
    TooCommon = 'TooCommon',
    UnknownError = 'UnknownError',
}
