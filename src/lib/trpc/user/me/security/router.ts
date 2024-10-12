import { createRouter } from "../../../_trpc";
import { userMeSecurityPasskeysRouter } from "./passkeys/router";

export const userMeSecurityRouter = createRouter({
    passkeys: userMeSecurityPasskeysRouter,
})
