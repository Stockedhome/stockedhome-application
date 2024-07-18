export const MAX_EMAIL_LENGTH = 1000 - "MAIL FROM:<>\r\n".length; // from https://github.com/gene-hightower/smtp-address-parser/blob/c920326ee91e7d34145e79af50188de1d355af1b/lib/index.ts#L15
export const MIN_EMAIL_LENGTH = 'a@a.ab'.length;

/** Checks suitable to be run client-side on the user's email */
export function getClientSideReasonForInvalidEmail(password: string): EmailInvalidityReason | null {
    if (password.length < MIN_EMAIL_LENGTH)
        return EmailInvalidityReason.TooShort;

    if (password.length > MAX_EMAIL_LENGTH)
        return EmailInvalidityReason.TooLong;

    return null;
}

export enum EmailInvalidityReason {
    TooShort = 'TooShort',
    TooLong = 'TooLong',
    NotSpecCompliant = 'NotSpecCompliant',
    UnknownError = 'UnknownError',
}
