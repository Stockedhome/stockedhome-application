import { createRouter } from "../_trpc";
import { PasskeyRouter } from "./passkey";
import { AuthSessionRouter } from "./session";
import { AuthSignUpRouter } from "./signup";

export const authRouter = createRouter({
    passkeys: PasskeyRouter,
    signup: AuthSignUpRouter,
    session: AuthSessionRouter,
})
