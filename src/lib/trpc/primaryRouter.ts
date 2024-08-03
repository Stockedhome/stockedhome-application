import { loadConfigServer } from '../config/loader-server';
import type { ConfigSchemaBaseWithComputations } from '../config/schema-base';
import { createRouter, publicProcedure } from './_trpc';
import { authRouter } from './auth';
import { authenticatedRouter } from './authenticated';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

export type APIRouter = typeof apiRouter;
export const apiRouter = createRouter({
    auth: authRouter,
    authenticated: authenticatedRouter,
    config: publicProcedure.query(async () => {
        return await (loadConfigServer as ()=>Promise<ConfigSchemaBaseWithComputations>)();
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
