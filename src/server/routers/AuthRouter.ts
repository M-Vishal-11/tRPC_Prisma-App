import prisma from "@/lib/prisma";
import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const authRouter = router({
  getUserId: publicProcedure
    .input(z.object({ email: z.string() }))
    .query(async ({ input }) => {
      await prisma.user.findFirst({
        where: {
          email: input.email,
        },
        select: {
          id: true,
        },
      });
    }),

  getVerificationTokenByEmail: publicProcedure
    .input(z.object({ email: z.string() }))
    .query(async ({ input }) => {
      const user = await prisma.user.findFirst({
        where: {
          email: input.email,
        },
        select: {
          id: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No user account associated with this email address.",
        });
      }

      const verificationRecord = await prisma.verification.findFirst({
        where: {
          value: user.id,
        },
        select: {
          identifier: true,
        },
      });

      if (!verificationRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active password reset token found for this account.",
        });
      }

      const token = verificationRecord?.identifier.split(":")[1];

      return {
        success: true,
        token: token,
      };
    }),
});
