"use client";

import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "../../server/routers/appRouter";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();
