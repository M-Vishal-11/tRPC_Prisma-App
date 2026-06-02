"use client";

import { changePassword, requestPasswordReset } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, SubmitEvent } from "react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState<boolean>(false);

  // 👑 Action A: User knows their old password and wants to update it
  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!currentPassword || !newPassword) {
      setError("Please fill out both password fields.");
      setIsPending(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Your new password must be at least 8 characters long.");
      setIsPending(false);
      return;
    }

    await changePassword(
      {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
      {
        onSuccess: () => {
          toast.success("Password updated successfully!");
          setSuccess("Password changed successfully! Redirecting...");
          e.currentTarget.reset();
          setTimeout(() => router.push("/"), 2000);
        },
        onError: (ctx: { error: { message: string } }) => {
          setError(ctx.error.message || "Failed to alter password.");
        },
        onResponse: () => setIsPending(false),
      },
    );
  };

  const handleForgotPasswordEmail = async () => {
    setError(null);
    setSuccess(null);

    const emailInput = prompt(
      "Enter your account email address to receive a recovery link:",
    );
    if (!emailInput) return; // Exit cleanly if user clicks cancel

    await requestPasswordReset(
      {
        email: emailInput,
      },
      {
        onRequest: () => {
          toast.loading("Verifying security context...");
        },
        onSuccess: () => {
          toast.dismiss();
          toast.success("Recovery link dispatched!");
          setSuccess(
            "A unique password reset link has been sent to your email inbox.",
          );
          router.push(`/auth/new-password?email=${emailInput}`);
        },
        onError: ({ error }: { error: { message: string } }) => {
          toast.dismiss();
          setError(
            error.message || "Could not process account recovery request.",
          );
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-gray-900">Account Security</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update your password parameters below
          </p>
        </div>

        {/* Dynamic State Alerts */}
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

        {/* Password Modification Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              placeholder="••••••••"
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              placeholder="••••••••"
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm disabled:opacity-50"
          >
            {isPending ? "Updating..." : "Change Password"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400">Locked Out?</span>
          </div>
        </div>

        {/* 👑 FIXED: Connected button to the live email processing function */}
        <button
          type="button"
          onClick={handleForgotPasswordEmail}
          className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors py-2"
        >
          Have no idea about the password?
        </button>
      </div>
    </div>
  );
}
