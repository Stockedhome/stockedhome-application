import { db } from '../../../../db';
import { getClientSideReasonForInvalidEmail, EmailInvalidityReason } from './client';
import validateEmail from 'deep-email-validator'

export async function getServerSideReasonForInvalidEmail(email: string): Promise<EmailInvalidityReason | null> {
    const clientSideReason = getClientSideReasonForInvalidEmail(email);

    if (clientSideReason)
        return clientSideReason;

    const validationResult = await validateEmail({
        email: email,

        validateRegex: false, // we already validated the email against
        validateDisposable: false, // we don't care if someone uses a disposable email
        validateTypo: false, // gets confused; thought @bellcube.dev should be @bellcube.de (too many TLDs to keep track of)

        validateMx: true, // make sure the email server exists
        validateSMTP: true, // make sure the user has a mailbox
    })

    console.log('Email validation result:', validationResult)

    if (!validationResult.validators.mx?.valid) {
        return EmailInvalidityReason.DoesNotExist
    } else if (!validationResult.validators.smtp?.valid) {
        if (validationResult.validators.smtp?.reason !== 'Timeout') // happened in testing; don't want to shove users out because Google is slow
            return EmailInvalidityReason.DoesNotExist
    } else if (/** for some other reason */ !validationResult.valid)
        return EmailInvalidityReason.DoesNotExist // best error we can give in this catch-all

    const userRecord = await db.user.findUnique({
        where: { email: email },
        select: { id: true, pruneAt: true }
    });

    if (userRecord) {
        if (userRecord.pruneAt === null)
            return EmailInvalidityReason.AlreadyInUse;

        if (userRecord.pruneAt.getTime() > Date.now()) {
            return EmailInvalidityReason.AlreadyInUse;
        } else {
            await db.user.delete({
                where: { id: userRecord.id },
                include: {
                    publicKeys: true,
                    newKeypairRequests: true,
                },
            })
        }
    }


    return null;
}
