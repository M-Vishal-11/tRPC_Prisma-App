import { twoFactorClient } from "better-auth/plugins";
import { createAuthClient } from "better-auth/react";

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  changePassword,
  requestPasswordReset,
  resetPassword,
  twoFactor,
  deleteUser,
} = createAuthClient({
  plugins: [twoFactorClient()],
});
