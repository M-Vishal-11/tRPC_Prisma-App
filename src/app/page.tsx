"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "./_trpc/client";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
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
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Failed to log out");
        },
      },
    });
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

        {/* 👑 FIXED: Shifted from <p> to <div> container to guarantee hydration safety */}
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
              </>
            ))}
        </div>
      </div>
    </div>
  );
}
