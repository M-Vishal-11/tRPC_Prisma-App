import prisma from "@/lib/prisma";
import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

  getOTP: publicProcedure
    .input(z.object({ email: z.string() }))
    .query(async ({ input }) => {
      try {
        // 1. Fetch User by Email
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
            message: "User not found",
          });
        }

        // Cleanup general expired verification records to save space
        await prisma.verification.deleteMany({
          where: {
            expiresAt: {
              lt: new Date(),
            },
          },
        });

        // 2. Find the 2FA mapping identifier for the user
        const mapping = await prisma.verification.findFirst({
          where: {
            value: user.id,
            identifier: {
              startsWith: "2fa-",
            },
            NOT: {
              identifier: {
                startsWith: "2fa-otp-",
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            identifier: true,
          },
        });

        if (!mapping) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "2FA setup not found for this user.",
          });
        }

        // Cleanup: Delete older mapping records for this user to save space
        await prisma.verification.deleteMany({
          where: {
            value: user.id,
            identifier: {
              startsWith: "2fa-",
              not: mapping.identifier,
            },
            NOT: {
              identifier: {
                startsWith: "2fa-otp-",
              },
            },
          },
        });

        // 3. Database Lookup
        const data = await prisma.verification.findFirst({
          where: {
            identifier: `2fa-otp-${mapping.identifier}`,
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            value: true,
          },
        });

        if (!data?.value) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "The OTP is expired and OTP not found. Click on Resend OTP",
          });
        }

        // Cleanup: Delete older OTP records for this mapping to save space
        await prisma.verification.deleteMany({
          where: {
            identifier: `2fa-otp-${mapping.identifier}`,
            NOT: {
              id: data.id,
            },
          },
        });

        const otp = data.value.split(":")[0];
        return { success: true, otp: otp };
      } catch (error) {
        console.error("🔥 CRITICAL BACKEND CRASH IN GETOTP:", error);
        throw error;
      }
    }),
});
