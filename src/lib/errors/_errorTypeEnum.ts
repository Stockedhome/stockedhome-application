export enum StockedhomeErrorType {
    Authentication_Registration_Username_TooShort = 'stockedhome > authentication > registration > usernames > too_short',
    Authentication_Registration_Username_TooLong = 'stockedhome > authentication > registration > usernames > too_long',
    Authentication_Registration_Username_InvalidCharacters = 'stockedhome > authentication > registration > usernames > invalid_characters',
    Authentication_Registration_Username_AlreadyAssigned = 'stockedhome > authentication > registration > usernames > already_assigned',

    Authentication_Registration_Email_Invalid = 'stockedhome > authentication > registration > emails > invalid',
    Authentication_Registration_Email_AlreadyInUse = 'stockedhome > authentication > registration > emails > already_in_use',

    Authentication_Registration_Password_TooShort = 'stockedhome > authentication > registration > passwords > too_short',
    Authentication_Registration_Password_TooLong = 'stockedhome > authentication > registration > passwords > too_long',
    Authentication_Registration_Password_TooCommon = 'stockedhome > authentication > registration > passwords > too_common',

    Authentication_Passkeys_New_NoPublicKey = 'stockedhome > authentication > passkeys > new > no_public_key',
}
