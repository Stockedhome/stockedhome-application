import { StockedhomeError } from "../../_errorClass";
import { StockedhomeErrorType } from "../../_errorTypeEnum";


export class StockedhomeError_Authentication_Registration_Username_TooShort extends StockedhomeError<StockedhomeErrorType.Authentication_Registration_Username_TooShort> {
    constructor() {
        super('Provided username is too short!');
    }

    readonly errorCode = StockedhomeErrorType.Authentication_Registration_Username_TooShort;
}

export class StockedhomeError_Authentication_Registration_Username_TooLong extends StockedhomeError<StockedhomeErrorType.Authentication_Registration_Username_TooLong> {
    constructor() {
        super('Provided username is too long!');
    }

    readonly errorCode = StockedhomeErrorType.Authentication_Registration_Username_TooLong;
}

export class StockedhomeError_Authentication_Registration_Username_InvalidCharacters extends StockedhomeError<StockedhomeErrorType.Authentication_Registration_Username_InvalidCharacters> {
    constructor() {
        super('Provided username contains invalid characters!');
    }

    readonly errorCode = StockedhomeErrorType.Authentication_Registration_Username_InvalidCharacters;
}

export class StockedhomeError_Authentication_Registration_Username_AlreadyAssigned extends StockedhomeError<StockedhomeErrorType.Authentication_Registration_Username_AlreadyAssigned> {
    constructor() {
        super('Provided username is already assigned to an existing account!');
    }

    readonly errorCode = StockedhomeErrorType.Authentication_Registration_Username_AlreadyAssigned;
}
