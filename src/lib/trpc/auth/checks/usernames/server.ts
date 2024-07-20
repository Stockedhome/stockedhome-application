import { db } from '../../../../db';
import { getClientSideReasonForInvalidUsername, UsernameInvalidityReason } from './client';

export async function getServerSideReasonForInvalidUsername(username: string): Promise<UsernameInvalidityReason | null> {
    const clientSideReason = getClientSideReasonForInvalidUsername(username);

    if (clientSideReason)
        return clientSideReason;

    const userRecord = await db.user.findUnique({
        where: { username: username },
        select: { id: true, pruneAt: true },
    });

    if (userRecord) {
        if (userRecord.pruneAt === null)
            return UsernameInvalidityReason.AlreadyInUse;

        if (userRecord.pruneAt.getTime() > Date.now()) {
            return UsernameInvalidityReason.AlreadyInUse;
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
