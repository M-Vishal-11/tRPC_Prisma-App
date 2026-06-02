"use client";

import { useTRPC } from "@/app/_trpc/client";
import { resetPassword } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, SubmitEvent, Suspense, useEffect } from "react";
import toast from "react-hot-toast";

function ResetPasswordPageContent() {
  const router = useRouter();
  const trpc = useTRPC();

  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  useEffect(() => {
    if (!email || email == "") {
      router.push("/auth/forgotPassword");
    }
  }, [email, router]);

  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState<boolean>(false);

  const {
    data: queryResult,
    isLoading,
    error: queryError,
  } = useQuery(
    trpc.authRouter.getVerificationTokenByEmail.queryOptions({
      email: email,
    }),
  );

  const token = queryResult?.token;
  const displayError = formError || queryError?.message;

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);
    setIsPending(true);

    const targetForm = e.currentTarget;
    const formData = new FormData(targetForm);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validation Defenses
    if (!token) {
      setFormError(
        "Your recovery token is missing or has expired. Please request a new link.",
      );
      setIsPending(false);
      return;
    }

    if (!password || !confirmPassword) {
      setFormError("All form fields are required.");
      setIsPending(false);
      return;
    }

    if (password !== confirmPassword) {
      setFormError("The entries do not match. Please verify your typing.");
      setIsPending(false);
      return;
    }

    if (password.length < 8) {
      setFormError(
        "Your new security credential must be at least 8 characters long.",
      );
      setIsPending(false);
      return;
    }

    // Dispatch updated token state to Better Auth
    await resetPassword(
      {
        newPassword: password,
        token: token,
      },
      {
        onRequest: () => {
          toast.loading("Rewriting account credentials...");
        },
        onSuccess: () => {
          toast.dismiss();
          toast.success("Security credentials updated!");
          setSuccess(
            "Password updated successfully! Transporting to sign in portal...",
          );

          if (targetForm) {
            targetForm.reset();
          }

          const toastRedirect = toast.loading("Redirecting to login Page");
          setTimeout(() => {
            toast.dismiss(toastRedirect);
            router.push("/auth");
          }, 1000);
        },
        onError: ({ error }) => {
          toast.dismiss();
          setFormError(error.message || "Failed to commit credential updates.");
        },
        onResponse: () => setIsPending(false),
      },
    );
  };

  // Render loading state while your tRPC hook searches your Neon database records
  if (isLoading) {
    return (
      <div className="text-sm font-medium text-gray-500 animate-pulse text-center">
        Resolving application query context...
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-gray-900">Reset Password</h1>
        <p className="text-sm text-gray-500 mt-1">
          Provide a strong new password for{" "}
          <span className="font-semibold text-gray-700">
            {decodeURIComponent(email)}
          </span>
        </p>
      </div>

      {/* Dynamic State Feedback Containers */}
      {displayError && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg font-medium animate-fade-in">
          {displayError}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg font-medium animate-fade-in">
          {success}
        </div>
      )}

      {/* Main Execution Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900"
            required
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <input
            type="text"
            name="confirmPassword"
            placeholder="••••••••"
            className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900"
            required
            disabled={isPending}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm disabled:opacity-50 active:scale-95"
        >
          {isPending ? "Saving changes..." : "Commit Changes"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense
        fallback={
          <div className="text-sm font-medium text-gray-500 animate-pulse">
            Resolving runtime parameters...
          </div>
        }
      >
        <ResetPasswordPageContent />
      </Suspense>
    </div>
  );
}
