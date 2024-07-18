import { db } from '../../../../db';
import { getClientSideReasonForInvalidUsername, UsernameInvalidityReason } from './client';

export async function getServerSideReasonForInvalidUsername(username: string): Promise<UsernameInvalidityReason | null> {
    const clientSideReason = getClientSideReasonForInvalidUsername(username);

    if (clientSideReason)
        return clientSideReason;

    const isUnique = !(await db.user.findUnique({
        where: { username: username },
        select: { id: true },
    }));

    if (!isUnique)
        return UsernameInvalidityReason.AlreadyInUse;

    return null;
}
