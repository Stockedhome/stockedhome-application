import { StockedhomeError } from "./_errorClass";
import { StockedhomeErrorType } from "./_errorTypeEnum";


export function isStockedhomeError(err: unknown): err is AnyStockedhomeError {
    return err instanceof StockedhomeError;
}

import * as authentication from "./authentication";

export function getStockedhomeErrorClassForCode<TErrorCode extends StockedhomeErrorType>(code: TErrorCode): StockedhomeErrorClassForCode<TErrorCode> {
    switch (code) {
        case StockedhomeErrorType.Authentication_Registration_Password_TooShort:
            return authentication.StockedhomeError_Authentication_Registration_Password_TooShort as StockedhomeErrorClassForCode<TErrorCode>;
        case StockedhomeErrorType.Authentication_Registration_Password_TooLong:
            return authentication.StockedhomeError_Authentication_Registration_Password_TooLong as StockedhomeErrorClassForCode<TErrorCode>;
        case StockedhomeErrorType.Authentication_Registration_Password_TooCommon:
            return authentication.StockedhomeError_Authentication_Registration_Password_TooCommon as StockedhomeErrorClassForCode<TErrorCode>;

        case StockedhomeErrorType.Authentication_Registration_NewKeypair_CreationNoPublicKey:

        default:
            throw new Error(`[Stockedhome] Unknown error code: ${code}`);
    }
}

export type AnyStockedhomeErrorClass = typeof authentication[keyof typeof authentication]
export type AnyStockedhomeError = InstanceType<typeof authentication[keyof typeof authentication]>
export type StockedhomeErrorClassForCode<TErrorCode extends StockedhomeErrorType> = AnyStockedhomeErrorClass & {prototype: StockedhomeError<TErrorCode>}

export * from "./authentication";
