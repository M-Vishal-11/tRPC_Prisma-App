import { publicProcedure, router } from "../trpc";

export const appRouter = router({
  getData: publicProcedure.query(() => {
    return { name: "Vishal", age: 18 };
  }),
});

export type AppRouter = typeof appRouter;
