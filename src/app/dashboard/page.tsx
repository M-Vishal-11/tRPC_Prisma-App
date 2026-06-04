"use client";

import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { deleteUser, useSession } from "@/lib/auth-client";
import Image from "next/image";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const handleChangePassword = () => {
    router.push(`/auth/forgotPassword?email=${session?.user.email}`);
  };

  const handleResetPassword = () => {
    router.push("/auth/new-password");
  };

  const handleDeleteUser = () => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-sm w-full bg-white border border-neutral-100 p-6 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] pointer-events-auto flex flex-col gap-6 transform transition-all duration-200`}
        >
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-neutral-900 tracking-tight">
              Hold on, are you absolutely sure?
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-normal">
              This action is permanent and cannot be undone. Your profile and
              all connected database objects will be deleted.
            </p>
          </div>

          <div className="flex justify-end gap-2.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-xl border border-neutral-200 transition-all active:scale-[0.98]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={async () => {
                toast.dismiss(t.id);

                const { error } = await deleteUser({
                  callbackURL: "/",
                });

                if (error) {
                  toast.error(error.message || "Failed to delete account");
                }
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all active:scale-[0.98] shadow-sm shadow-red-100"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      ),
      { id: "delete-confirmation", duration: 10000 },
    );
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-neutral-50/50 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white border border-neutral-200/60 rounded-2xl p-8 space-y-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-neutral-200 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-neutral-200 rounded w-1/4" />
              <div className="h-3 bg-neutral-200 rounded w-1/3" />
            </div>
          </div>
          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <div className="h-4 bg-neutral-200 rounded w-full" />
            <div className="h-4 bg-neutral-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-neutral-50/50 flex flex-col items-center justify-center p-4">
        <p className="text-neutral-600 text-sm mb-4 font-medium">
          You must be logged in to view this page.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-neutral-50/50 p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white border border-neutral-200/60 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 sm:p-8 space-y-8">
        {/* Header Profile Summary Header */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-neutral-100">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "User profile"}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-neutral-50 shadow-sm"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-linear-to-tr from-neutral-100 to-neutral-200 flex items-center justify-center text-neutral-500 font-semibold text-xl border border-neutral-200/40">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
          )}

          <div className="text-center sm:text-left space-y-1">
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              {user.name || "Account Profile"}
            </h1>
            <p className="text-sm text-neutral-500">{user.email}</p>
          </div>
        </div>

        {/* Structured Meta Profile Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              User Identification String (ID)
            </span>
            <div className="p-3 bg-neutral-50 border border-neutral-200/50 rounded-xl font-mono text-xs text-neutral-700 select-all overflow-x-auto whitespace-nowrap">
              {user.id}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Account Created At
            </span>
            <div className="p-3 bg-neutral-50 border border-neutral-200/50 rounded-xl font-medium text-neutral-700">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"}
            </div>
          </div>
        </div>

        {/* Refined Modular Action Button Utility Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-indigo-100 transition flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {/* High-visibility Tinted Home Icon */}
            <svg
              className="w-4 h-4 text-indigo-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5} // Slightly thicker lines for extra crispness
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Home Page
          </button>

          <button
            type="button"
            onClick={handleChangePassword}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition active:scale-[0.99]"
          >
            Change Password
          </button>

          <button
            type="button"
            onClick={handleResetPassword}
            className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-sm font-medium rounded-lg shadow-sm transition active:scale-[0.99]"
          >
            Reset Password
          </button>

          <button
            type="button"
            onClick={handleDeleteUser}
            className="px-4 py-2.5 sm:ml-auto bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-sm font-medium rounded-lg transition active:scale-[0.99]"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
}
