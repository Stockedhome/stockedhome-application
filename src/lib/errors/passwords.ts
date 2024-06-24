import { StockedhomeErrorType, StockedhomeError } from ".";

export class StockedhomeError_Password_TooShort extends StockedhomeError<StockedhomeErrorType.Password_TooShort> {
    constructor() {
        super('Provided password is too short!');
    }

    readonly errorCode = StockedhomeErrorType.Password_TooShort;
}

export class StockedhomeError_Password_TooLong extends StockedhomeError<StockedhomeErrorType.Password_TooLong> {
    constructor() {
        // Only really to save bandwidth. Client should check this itself before sending to server
        super('Provided password is too long!');
    }

    readonly errorCode = StockedhomeErrorType.Password_TooLong;
}

export class StockedhomeError_Password_TooCommon extends StockedhomeError<StockedhomeErrorType.Password_TooCommon> {
    constructor() {
        super('Provided password is within the list of most common passwords!');
    }

    readonly errorCode = StockedhomeErrorType.Password_TooCommon;
}
