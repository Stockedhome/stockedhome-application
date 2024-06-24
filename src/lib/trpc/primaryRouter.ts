import { createRouter, publicProcedure } from './_trpc';
import { authRouter } from './auth';
import { passwordRouter } from './passwords';

export type APIRouter = typeof apiRouter;
export const apiRouter = createRouter({
    auth: authRouter,
    password: passwordRouter,
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
