import { appRouter } from "@/server/routers/appRouter";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@trpc/tanstack-react-query";

const handler = (req: Request) => {
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => {
      return { Name: "Me" };
    },
  });
};

export { handler as get, handler as POST };
