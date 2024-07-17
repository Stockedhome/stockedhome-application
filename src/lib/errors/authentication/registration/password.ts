import { StockedhomeError } from "../../_errorClass";
import { StockedhomeErrorType } from "../../_errorTypeEnum";


export class StockedhomeError_Authentication_Registration_Password_TooShort extends StockedhomeError<StockedhomeErrorType.Authentication_Registration_Password_TooShort> {
    constructor() {
        super('Provided password is too short!');
    }

    readonly errorCode = StockedhomeErrorType.Authentication_Registration_Password_TooShort;
}

export class StockedhomeError_Authentication_Registration_Password_TooLong extends StockedhomeError<StockedhomeErrorType.Authentication_Registration_Password_TooLong> {
    constructor() {
        // Only really to save bandwidth. Client should check this itself before sending to server
        super('Provided password is too long!');
    }

    readonly errorCode = StockedhomeErrorType.Authentication_Registration_Password_TooLong;
}

export class StockedhomeError_Authentication_Registration_Password_TooCommon extends StockedhomeError<StockedhomeErrorType.Authentication_Registration_Password_TooCommon> {
    constructor() {
        super('Provided password is within the list of most common passwords!');
    }

    readonly errorCode = StockedhomeErrorType.Authentication_Registration_Password_TooCommon;
}
