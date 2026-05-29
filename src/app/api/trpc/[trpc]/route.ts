import { appRouter } from "@/server/routers/appRouter";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => {
      return { Name: "Me" };
    },
  });
};

export { handler as GET, handler as POST };
