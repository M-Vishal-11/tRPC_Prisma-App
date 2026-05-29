import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const appRouter = router({
  getData: publicProcedure.query(({ ctx }) => {
    return { name: "Vishal", age: 18, ctx: ctx };
  }),
  setData: publicProcedure
    .input(z.object({ thing: z.string(), broo: z.boolean() }))
    .mutation(({ ctx, input }) => {
      return {
        data: "You done this right",
        ctxName: ctx.name,
        thing: input.thing,
        broo: input.broo,
      };
    }),
});

export type AppRouter = typeof appRouter;
