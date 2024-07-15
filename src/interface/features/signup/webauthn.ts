export async function signUpWithWebAuthn(trpc: APIRouter) {
    const credentialCreationOptions = await trpc.auth.startWebAuthnRegistration();
    const newCredential = await startRegistration(credentialCreationOptions);
    await trpc.auth.finishWebAuthnRegistration({
        newCredential,
    });

}
