import { publicProcedure, router } from "../trpc";

export const appRouter = router({
  getData: publicProcedure.query(({ ctx }) => {
    return { name: "Vishal", age: 18, ctx: ctx };
  }),
  setData: publicProcedure.mutation(() => {
    return "You done this right";
  }),
});

export type AppRouter = typeof appRouter;
