import SMTPAddressParser_ from 'smtp-address-parser';
import { getClientSideReasonForInvalidEmail, EmailInvalidityReason } from './client';

const SMTPAddressParser = SMTPAddressParser_ as typeof SMTPAddressParser_ & {
    parse(email: string): any
}

// MUST BE KEPT IN SYNC WITH RETURN TYPE OF `getServerSideReasonForInvalidPassword`
export function getServerSideReasonForInvalidPassword(email: string): EmailInvalidityReason | null {
    const clientSideReason = getClientSideReasonForInvalidEmail(email);

    if (clientSideReason)
        return clientSideReason;

//    try {
//        if (SMTPAddressParser.parse(email))
//    } catch (e) {
//        if (!(e instanceof Error))
//            throw e;
//
//        switch(e.message) {
//            case "address too long":
//                return EmailInvalidityReason.TooLong;
//            case "address parsing failed: ambiguous grammar":
//                throw new Error("Unexpected error parsing email: " + e.message);
//        }
//    }

    return null;
}
