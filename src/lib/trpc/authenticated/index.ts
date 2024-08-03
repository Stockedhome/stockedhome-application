import { createRouter, publicProcedure } from "../_trpc";
import { z } from "zod";
import { NextRequest } from "next/server";
import { db } from "../../db";
import { usersRouter } from "./users";


export const authenticatedRouter = createRouter({
    users: usersRouter,
})
