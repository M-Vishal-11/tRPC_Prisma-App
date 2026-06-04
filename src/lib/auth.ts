import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { createAuthMiddleware } from "better-auth/api";
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,

    sendResetPassword: async ({ user, url, token }, request) => {
      console.log(`\n🔑 ======== PASSWORD RESET REQUEST ========`);
      console.log(`User: ${user.email}`);
      console.log(`Reset Token: ${token}`);
      console.log(`👉 Live Reset Link: ${url}`);
      console.log(`===========================================\n`);

      await prisma.verification.deleteMany({
        where: {
          value: user.id,
          identifier: {
            not: `reset-password:${token}`,
          },
        },
      });
    },
  },

  appName: "myapp",
  plugins: [
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }, ctx) {
          console.log(user);
          console.log(otp);

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
            select: {
              identifier: true,
            },
          });

          if (mapping) {
            await prisma.verification.deleteMany({
              where: {
                identifier: {
                  startsWith: `2fa-otp-${mapping.identifier}`,
                },
                value: {
                  not: `${otp}:0`,
                },
              },
            });
          }
        },
      },
    }),
  ],

  // trustedOrigins: ["http://localhost:3001"],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const newSession = ctx.context.newSession;

      if (newSession?.session) {
        const userId = newSession.session.userId;
        const currentSessionId = newSession.session.id;

        await prisma.session.deleteMany({
          where: {
            userId: userId,
            id: {
              not: currentSessionId,
            },
          },
        });

        console.log(
          `🧹 Single Session Enforced: Old sessions cleared for user ${userId}`,
        );
      }
    }),
  },
});
