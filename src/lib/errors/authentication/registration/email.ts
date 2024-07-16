import { StockedhomeErrorType, StockedhomeError } from "../..";

export class StockedhomeError_Authentication_Registration_Email_Invalid extends StockedhomeError<StockedhomeErrorType.Authentication_Registration_Email_Invalid> {
    constructor() {
        super('Provided email is invalid!');
    }

    readonly errorCode = StockedhomeErrorType.Authentication_Registration_Email_Invalid;
}

export class StockedhomeError_Authentication_Registration_Email_AlreadyInUse extends StockedhomeError<StockedhomeErrorType.Authentication_Registration_Email_AlreadyInUse> {
    constructor() {
        super('Provided email is already being used for an existing account!');
    }

    readonly errorCode = StockedhomeErrorType.Authentication_Registration_Email_AlreadyInUse;
}
