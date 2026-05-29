import { initTRPC } from "@trpc/server";

type Context = {
  name: string;
};

const t = initTRPC.context<Context>().create();

export const publicProcedure = t.procedure;
export const router = t.router;
