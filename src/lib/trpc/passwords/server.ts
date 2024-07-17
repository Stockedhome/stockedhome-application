import { commonPasswords } from "./common-passwords";
import { StockedhomeErrorType } from "../../errors";
import { getClientSideReasonForInvalidPassword } from "./client";

// MUST BE KEPT IN SYNC WITH RETURN TYPE OF `getServerSideReasonForInvalidPassword`
export function getServerSideReasonForInvalidPassword(password: string): ReturnType<typeof getClientSideReasonForInvalidPassword> | StockedhomeErrorType.Authentication_Registration_Password_TooCommon | null {
    const clientSideReason = getClientSideReasonForInvalidPassword(password);

    if (clientSideReason)
        return clientSideReason;

    if (commonPasswords.has(password))
        return StockedhomeErrorType.Authentication_Registration_Password_TooCommon;

    return null;
}
