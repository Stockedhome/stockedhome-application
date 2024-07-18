import { commonPasswords } from "./common-passwords";
import { PasswordInvalidityReason, getClientSideReasonForInvalidPassword } from "./client";

export function getServerSideReasonForInvalidPassword(password: string): PasswordInvalidityReason | null {
    const clientSideReason = getClientSideReasonForInvalidPassword(password);

    if (clientSideReason)
        return clientSideReason;

    if (commonPasswords.has(password))
        return PasswordInvalidityReason.TooCommon;

    return null;
}
