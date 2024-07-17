import type { RegistrationResponseJSON } from "@simplewebauthn/server/script/deps";
import { StockedhomeError } from "../../_errorClass";
import { StockedhomeErrorType } from "../../_errorTypeEnum";

export class StockedhomeError_Authentication_Passkeys_New_NoPublicKey extends StockedhomeError<StockedhomeErrorType.Authentication_Passkeys_New_NoPublicKey> {
    constructor(newCredential?: RegistrationResponseJSON) {
        super(`Though we got a response from the user's device, that response didn't contain a public key. As far as I'm aware, this shouldn't be possible!\n\nCredential object was: ${JSON.stringify(newCredential)}`);
    }

    readonly errorCode = StockedhomeErrorType.Authentication_Passkeys_New_NoPublicKey;
}
