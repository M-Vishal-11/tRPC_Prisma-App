"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "./_trpc/client";
import { useRouter } from "next/navigation";

export default function Home() {
  const trpc = useTRPC();
  const router = useRouter();

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

  return (
    <div className="mt-8">
      <h1 className="font-semibold text-2xl bg-red-300 flex justify-center content-center p-4">
        Get The Data from backend or the Server
      </h1>
      <div className="mt-15 border-2 border-amber-400 m-50 p-10">
        <p className="text-xl">
          Data: {!isLoading && JSON.stringify(backendData)}
        </p>
        <button
          className="block ml-auto border-2 mt-4 relative p-2 bg-amber-200 hover:bg-amber-300"
          onClick={buttonClicked}
        >
          Huh! Click me... Plss
        </button>
        <p className="text-xl">
          {op.isSuccess && op.data && (
            <span>Data: {JSON.stringify(op.data)}</span>
          )}
        </p>
        <div>
          <button
            className="block ml-auto border-2 mt-4 relative p-2 bg-green-200 hover:bg-green-300"
            onClick={() => router.push("/authentication")}
          >
            Click To Signin
          </button>
        </div>
      </div>
    </div>
  );
}
