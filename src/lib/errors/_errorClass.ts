import type { StockedhomeErrorType } from "./_errorTypeEnum";


export abstract class StockedhomeError<TErrorCode extends StockedhomeErrorType> extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }

    abstract readonly errorCode: TErrorCode;
}
