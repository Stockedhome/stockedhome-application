export abstract class StockedhomeError<TErrorCode extends StockedhomeErrorType> extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }

    abstract readonly errorCode: TErrorCode;
}

export function isStockedhomeError(err: unknown): err is AnyStockedhomeError {
    return err instanceof StockedhomeError;
}




import * as passwords from "./passwords";
export * from "./passwords";

export type AnyStockedhomeErrorClass = typeof passwords[keyof typeof passwords]
export type AnyStockedhomeError = InstanceType<typeof passwords[keyof typeof passwords]>
export type StockedhomeErrorClassForCode<TErrorCode extends StockedhomeErrorType> = AnyStockedhomeErrorClass & {prototype: StockedhomeError<TErrorCode>}

export enum StockedhomeErrorType {
    Password_TooShort = 'stockedhome > passwords > too_short',
    Password_TooLong = 'stockedhome > passwords > too_long',
    Password_TooCommon = 'stockedhome > passwords > too_common',
}






export function getStockedhomeErrorClassForCode<TErrorCode extends StockedhomeErrorType>(code: TErrorCode): StockedhomeErrorClassForCode<TErrorCode> {
    switch (code) {
        case StockedhomeErrorType.Password_TooShort:
            return passwords.StockedhomeError_Password_TooShort as StockedhomeErrorClassForCode<TErrorCode>;
        case StockedhomeErrorType.Password_TooLong:
            return passwords.StockedhomeError_Password_TooLong as StockedhomeErrorClassForCode<TErrorCode>;
        case StockedhomeErrorType.Password_TooCommon:
            return passwords.StockedhomeError_Password_TooCommon as StockedhomeErrorClassForCode<TErrorCode>;

        default:
            throw new Error(`Unknown error code: ${code}`);
    }
}
