"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "./_trpc/client";
import { useRouter } from "next/navigation";
import { deleteUser, signOut, useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";

export default function Home() {
  const trpc = useTRPC();
  const router = useRouter();

  const session = useSession();

  const { data: backendData, isLoading } = useQuery(
    trpc.getData.queryOptions(),
  );

  // const {
  //   mutate: mutate1,
  //   isPending,
  //   data: bottomData,
  // } = useMutation(trpc.setData.mutationOptions());

  const op = useMutation(trpc.setData.mutationOptions());
  // console.log(op);

  const buttonClicked = () => {
    op.mutate({ thing: "Game", broo: true });
  };

  const handleSignout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Logged Out Successfully");
          router.push("/auth");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Failed to log out");
        },
      },
    });
  };

  const handleChangePassword = () => {
    router.push("/auth/forgotPassword");
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
          {/* Spacious Header Text Section */}
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-neutral-900 tracking-tight">
              Hold on, are you absolutely sure?
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-normal">
              This action is permanent and cannot be undone. Your profile and
              all connected database objects will be deleted.
            </p>
          </div>

          {/* Refined Action Buttons Container */}
          <div className="flex justify-end gap-2.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)} // Fixed to t.id to correctly close react-hot-toast
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
      { id: "delete-confirmation", duration: Infinity },
    );
  };
  return (
    <div className="mt-8 max-w-4xl mx-auto px-4">
      <h1 className="font-semibold text-2xl bg-red-300 flex justify-center content-center p-4 rounded-xl shadow-sm text-gray-800">
        Get The Data from backend or the Server
      </h1>

      <div className="mt-8 border-2 border-amber-400 p-8 rounded-2xl bg-white/50 backdrop-blur-sm shadow-sm space-y-6">
        {/* Active Query Output Panel */}
        <div className=" bg-slate-50 p-4 border rounded-xl font-mono text-sm">
          <span className="font-bold text-amber-800 block mb-1">
            Incoming Query Stream:
          </span>
          {isLoading
            ? "Fetching data from server..."
            : JSON.stringify(backendData)}
        </div>

        {/* Mutation Push Interactor */}
        <button
          className="block ml-auto border-2 px-4 py-2 bg-amber-200 hover:bg-amber-300 rounded-lg font-medium transition-all shadow-sm active:scale-95"
          onClick={buttonClicked}
        >
          Huh! Click me... Plss
        </button>

        <div className="text-xl min-h-10">
          {op.isSuccess && op.data && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg font-mono text-sm text-green-700 animate-fade-in">
              <strong>Mutation Saved:</strong> {JSON.stringify(op.data)}
            </div>
          )}
        </div>

        {/* Dynamic Authentication Context Portal Guards */}
        <div className="border-t pt-4">
          {!session.isPending &&
            (!session.data?.user ? (
              <button
                className="block ml-auto border-2 px-4 py-2 bg-green-200 hover:bg-green-300 rounded-lg font-medium transition-all text-sm shadow-sm active:scale-95"
                onClick={() => router.push("/auth")}
              >
                Click To Signin
              </button>
            ) : (
              <>
                <button
                  onClick={handleSignout}
                  className="block ml-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-all shadow-sm active:scale-95"
                >
                  Log out
                </button>

                <div className="border-b pb-4 mt-4">
                  <div className="border bg-green-50 p-3 rounded-lg font-mono text-sm text-green-700 wrap-anywhere animate-fade-in">
                    {JSON.stringify(session.data.user)}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 py-4 bg-transparent">
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
              </>
            ))}
        </div>
      </div>
    </div>
  );
}
