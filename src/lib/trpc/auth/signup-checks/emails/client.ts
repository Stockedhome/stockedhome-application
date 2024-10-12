import EMAIL_GRAMMAR from 'smtp-address-parser/dist/lib/grammar';
import nearley from 'nearley';

const grammar = nearley.Grammar.fromCompiled(EMAIL_GRAMMAR);




// Most of these are taken directly from
// https://github.com/gene-hightower/smtp-address-parser/blob/c920326ee91e7d34145e79af50188de1d355af1b/lib/index.ts

export const MAX_EMAIL_LENGTH = 1000 - "MAIL FROM:<>\r\n".length;
export const MIN_EMAIL_LENGTH = 'a@a.ab'.length;

interface NearleyError extends Error {
    offset: number,
    token: {
        value: string,
    }
}

function isNearlyError(e: any): e is NearleyError {
    return e instanceof Error && 'offset' in e && 'token' in e;
}

/** Checks suitable to be run client-side on the user's email */
export function getClientSideReasonForInvalidEmail(email: string): EmailInvalidityReason | null {
    if (email.length < MIN_EMAIL_LENGTH)
        return EmailInvalidityReason.TooShort;

    if (email.length > MAX_EMAIL_LENGTH)
        return EmailInvalidityReason.TooLong;

    const at_idx = email.lastIndexOf('@'); // must be found, since parse was successful
    const domain = email.substring(at_idx + 1);
    if (domain[0] !== '[') {       // Not an address literal
        if (domain.length > 253) {
            return EmailInvalidityReason.DomainTooLong;
        }
        const labels = domain.split(".");
        if (labels.length < 2) {
            return EmailInvalidityReason.InvalidDomain;
        }
        if (labels[labels.length - 1]!.length < 2) {
            return EmailInvalidityReason.TLDTooShort;
        }

        labels.sort(function(a: string, b: string) {
            return b.length - a.length;
        });
        if (labels[0]!.length > 63) {
            return EmailInvalidityReason.DomainLabelTooLong;
        }
    }

    const parser = new nearley.Parser(grammar);
    try {
        parser.feed(`<${email}>`);
    } catch (e) {
        if (!isNearlyError(e)) {
            console.error('Unknown error parsing email:', e);
            return EmailInvalidityReason.UnknownError;
        }

        return EmailInvalidityReason.NotSpecCompliant;
    }

    return null;
}

export enum EmailInvalidityReason {
    TooShort = 'TooShort',
    TooLong = 'TooLong',
    NotSpecCompliant = 'NotSpecCompliant',
    UnknownError = 'UnknownError',
    DomainTooLong = 'DomainTooLong',
    InvalidDomain = 'InvalidDomain',
    TLDTooShort = 'TLDTooShort',
    DomainLabelTooLong = 'DomainLabelTooLong',
    AlreadyInUse = 'AlreadyInUse',
    DoesNotExist = 'DoesNotExist',
}
