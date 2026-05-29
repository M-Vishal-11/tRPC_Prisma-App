"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import React, { useState } from "react";

import { TRPCProvider } from "./client";
import type { AppRouter } from "../../server/routers/appRouter";

export default function Provider({ children }: { children: React.ReactNode }) {
  // 1. Create a Tanstack Query client instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Tell the browser data is fresh for 10 seconds so it doesn't spam refetches
            staleTime: 10 * 1000,
            // Stop refetching every single time you click back into the browser window
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  // 2. Create a type-safe tRPC client instance using the explicit creator
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: "/api/trpc",
        }),
      ],
    }),
  );

  // 3. In tRPC v11, QueryClientProvider wraps around the TRPCProvider
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
