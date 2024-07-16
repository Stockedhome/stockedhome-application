import { StockedhomeError } from "./_errorClass";
import { StockedhomeErrorType } from "./_errorTypeEnum";


export function isStockedhomeError(err: unknown): err is AnyStockedhomeError {
    return err instanceof StockedhomeError;
}

import * as authentication from "./authentication";

// Calls getStockedhomeErrorClassForCode_ so we still get compiler-enforced correctness there
// while getting improved type safety that comes with generics and throwing a runtime error if something goes wrong
export function getStockedhomeErrorClassForCode<TErrorCode extends StockedhomeErrorType>(code: TErrorCode): StockedhomeErrorClassForCode<TErrorCode> {
    const returnVal = getStockedhomeErrorClassForCode_(code);
    if (!returnVal) {
        throw new Error(`[Stockedhome] No error class found for code: ${code}`);
    }
    return returnVal as StockedhomeErrorClassForCode<TErrorCode>;
}


function getStockedhomeErrorClassForCode_(code: StockedhomeErrorType) {
    switch (code) {
        case StockedhomeErrorType.Authentication_Registration_Username_TooShort:
            return authentication.StockedhomeError_Authentication_Registration_Username_TooShort;
        case StockedhomeErrorType.Authentication_Registration_Username_TooLong:
            return authentication.StockedhomeError_Authentication_Registration_Username_TooLong;
        case StockedhomeErrorType.Authentication_Registration_Username_InvalidCharacters:
            return authentication.StockedhomeError_Authentication_Registration_Username_InvalidCharacters;
        case StockedhomeErrorType.Authentication_Registration_Username_AlreadyAssigned:
            return authentication.StockedhomeError_Authentication_Registration_Username_AlreadyAssigned;

        case StockedhomeErrorType.Authentication_Registration_Email_Invalid:
            return authentication.StockedhomeError_Authentication_Registration_Email_Invalid;
        case StockedhomeErrorType.Authentication_Registration_Email_AlreadyInUse:
            return authentication.StockedhomeError_Authentication_Registration_Email_AlreadyInUse;

        case StockedhomeErrorType.Authentication_Registration_Password_TooShort:
            return authentication.StockedhomeError_Authentication_Registration_Password_TooShort;
        case StockedhomeErrorType.Authentication_Registration_Password_TooLong:
            return authentication.StockedhomeError_Authentication_Registration_Password_TooLong;
        case StockedhomeErrorType.Authentication_Registration_Password_TooCommon:
            return authentication.StockedhomeError_Authentication_Registration_Password_TooCommon;

        case StockedhomeErrorType.Authentication_Passkeys_New_NoPublicKey:
            return authentication.StockedhomeError_Authentication_Passkeys_New_NoPublicKey;
    }
    console.warn('[Stockedhome] No error class found for code (this SHOULD be unreachable!):', code);
    return undefined;
}


export type AnyStockedhomeErrorClass = typeof authentication[keyof typeof authentication];
export type AnyStockedhomeError = InstanceType<AnyStockedhomeErrorClass>;
export type StockedhomeErrorClassForCode<TErrorCode extends StockedhomeErrorType> = AnyStockedhomeErrorClass & {prototype: StockedhomeError<TErrorCode>}

export * from "./authentication";
