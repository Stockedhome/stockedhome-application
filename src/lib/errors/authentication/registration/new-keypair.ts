import type { RegistrationResponseJSON } from "@simplewebauthn/server/script/deps";
import { StockedhomeErrorType, StockedhomeError } from "../..";

export class StockedhomeError_Authentication_Registration_NewKeypair_CreationNoPublicKey extends StockedhomeError<StockedhomeErrorType.Authentication_Registration_NewKeypair_CreationNoPublicKey> {
    constructor(response?: RegistrationResponseJSON) {
        super(`Though we got a response from the user's device, that response didn't contain a public key. As far as I'm aware, this shouldn't be possible!\n\nResponse object was: ${JSON.stringify(response)}`);
    }

    readonly errorCode = StockedhomeErrorType.Authentication_Registration_NewKeypair_CreationNoPublicKey;
}
