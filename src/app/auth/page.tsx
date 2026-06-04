"use client";

import { signIn, signUp, twoFactor } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, SubmitEvent } from "react";
import toast from "react-hot-toast";
import { useTRPC } from "../_trpc/client";
import { useQuery } from "@tanstack/react-query";

export default function AuthenticationPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [signedIn, setsignedIn] = useState<boolean>(false);
  const [otpState, setOTPState] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const router = useRouter();
  const trpc = useTRPC();
  const { refetch } = useQuery({
    ...trpc.authRouter.getOTP.queryOptions({ email }),
    enabled: false,
  });

  const toggleTab = (signInMode: boolean) => {
    setError(null);
    setIsSignIn(signInMode);
  };

  async function displayOTP() {
    try {
      const res = await refetch();
      toast.success(res.data?.otp || "Click on Resend OTP", {
        duration: 4000,
      });
    } catch (e) {
      console.log(e);
    }
  }

  async function handleSignin(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const emailInput = formData.get("email") as string;

    if (!emailInput) {
      setError("All form fields are required.");
      return;
    } else if (!formData.get("password")) {
      setError("All form fields are required.");
      return;
    }

    setEmail(emailInput);

    // Handle Loggin
    const res = await signIn.email(
      {
        email: emailInput,
        password: formData.get("password") as string,
        rememberMe: rememberMe,
      },
      {
        onError: (ctx) => {
          console.log("Signin Failed: ", ctx.error.message);
          setError(ctx.error.message || "Something went wrong.");
        },
        onSuccess: async () => {
          setSuccess("Logged in successfully!");

          await twoFactor.sendOtp();

          toast.success("OTP Sent, waiting time: 1 second");
          setTimeout(() => displayOTP(), 1000);
          setsignedIn(true);
          setSuccess("");
        },
      },
    );
    if (!res.error) {
      console.log("Logged in successfully!", res);
    }
  }

  async function handleSignup(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    const nameInput = formData.get("name");
    const emailInput = formData.get("email");
    const passwordInput = formData.get("password");

    if (!nameInput || !emailInput || !passwordInput) {
      setError("All form fields are required.");
      return;
    }

    // Handle Signup
    const res = await signUp.email(
      {
        name: nameInput as string,
        email: emailInput as string,
        password: passwordInput as string,
        callbackURL: "/auth",
      },
      {
        rememberMe: false,
        onError: (ctx) => {
          console.log("Signin Failed: ", ctx.error.message);
          setError(ctx.error.message || "Something went wrong.");
        },
        onSuccess: async () => {
          setSuccess("Account created successfully!");
          router.push("/auth");
        },
      },
    );
    if (!res.error) {
      console.log("Logged in successfully!", res);
    }
  }

  const handleResendOTP = async () => {
    await twoFactor.sendOtp();
    toast.success("OTP Sent, waiting time: 1 second");
    setTimeout(() => displayOTP(), 1000);
  };

  const handleOTPVerification = async () => {
    console.log(otpState);
    await twoFactor.verifyOtp(
      {
        code: otpState,
      },
      {
        onError: (ctx) => {
          console.log("Signin Failed: ", ctx.error.message);
          setError(ctx.error.message || "Something went wrong.");
          console.log(ctx.error.message);
        },
        onSuccess: async () => {
          setSuccess("Email Verified Successfully");
          router.push("/");
        },
      },
    );
  };

  const handleGoogleSignIn = async () => {
    const data = await signIn.social(
      {
        provider: "google",
        callbackURL: "/",
      },
      {
        onError: (ctx) => {
          console.log(ctx.error.message || "Something went wrong");
          setError(ctx.error.message || "Something went wrong");
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Navigation Tabs */}
        <div className="flex mb-6 bg-gray-200 rounded-lg p-1">
          <button
            type="button"
            onClick={() => toggleTab(true)}
            className={`flex-1 py-2 rounded-md transition ${
              isSignIn ? "bg-white shadow font-semibold" : "text-gray-600"
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => toggleTab(false)}
            className={`flex-1 py-2 rounded-md transition ${
              !isSignIn ? "bg-white shadow font-semibold" : "text-gray-600"
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg font-medium animate-fade-in">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg font-medium animate-fade-in">
            {success}
          </div>
        )}

        {isSignIn ? (
          /* Sign In Form Configuration */
          <form className="space-y-4" onSubmit={handleSignin}>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              {signedIn && (
                <button
                  onClick={handleResendOTP}
                  className="text-xs text-blue-600 hover:text-blue-700 hover:underline transition font-medium ml-76"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {signedIn && (
              <div className="flex flex-col items-center justify-center space-y-2">
                <label className="text-sm font-medium text-gray-700 w-full text-left">
                  Enter Security Code
                </label>

                <input
                  type="text"
                  name="otp"
                  maxLength={6}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  placeholder="000000"
                  className="w-full border-2 border-gray-200 rounded-xl p-3 text-center text-2xl font-mono tracking-[0.6em] indent-[0.3em] font-bold text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all focus:outline-none"
                  required
                  value={otpState}
                  onChange={(e) => {
                    const sanitizedValue = e.target.value.replace(
                      /[^0-9]/g,
                      "",
                    );
                    setOTPState(sanitizedValue);
                  }}
                />

                <p className="text-xs text-gray-400 w-full text-left">
                  Please input the 6-digit verification sequence.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Link
                href="/auth/forgotPassword"
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline transition font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <div>
              <label className="text-sm">Remeber Me: </label>
              <input
                type="checkbox"
                onChange={(e) => setRememberMe(!rememberMe)}
                checked={rememberMe}
                className="relative top-0.5 left-1 active:bg-blue-400"
              />
            </div>

            {!signedIn ? (
              <div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="mt-4 w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 active:scale-[0.99] transition font-medium shadow-sm"
                >
                  {/* Official Google Brand Logo */}
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign in with Google
                </button>
              </div>
            ) : (
              <button
                onClick={handleOTPVerification}
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98]"
              >
                Verify Email
              </button>
            )}
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleSignup}>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:pointer-events-none"
              // disabled={!verified}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className=" w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 active:scale-[0.99] transition font-medium shadow-sm"
            >
              {/* Official Google Brand Logo */}
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
