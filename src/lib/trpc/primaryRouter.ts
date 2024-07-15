import { loadConfig } from '../../platforms/next/app/backend/load-config';
import type { ConfigForTRPCContext } from '../config-schema';
import { createRouter, publicProcedure } from './_trpc';
import { authRouter } from './auth';
import { passwordRouter } from './passwords';

export type APIRouter = typeof apiRouter;
export const apiRouter = createRouter({
    auth: authRouter,
    password: passwordRouter,
    config: publicProcedure.query(async () => {
        return await (loadConfig as ()=>Promise<ConfigForTRPCContext>)();
    }),
    ['']: publicProcedure.query(() => {
        return {
            project: 'Stockedhome',
            homepage: 'https://stockedhome.app',
            github: 'https://github.com/Stockedhome/stockedhome',
            docs: 'https://docs.stockedhome.app',
            [""]:"",
            randomNumber: Math.random(),
            timestamp: new Date().toISOString(),
        };
    }),
});
