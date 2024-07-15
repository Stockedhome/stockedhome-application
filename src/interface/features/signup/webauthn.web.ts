import { startRegistration } from '@simplewebauthn/browser';
import type { APIRouter } from 'lib/trpc/primaryRouter';
import type { TRPCClient } from '../../provider/tRPC-provider';

}
export async function signUpWithWebAuthn(trpc: TRPCClient) {
    const utils = trpc.useUtils()
    const credentialCreationOptions = await trpc.auth.getKeyRegistrationParameters.query();
    const newCredential = await startRegistration(credentialCreationOptions);
    await trpc.auth.finishWebAuthnRegistration({
        newCredential,
    });

}
