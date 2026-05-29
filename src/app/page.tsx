"use client";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "./_trpc/client";
import { stringify } from "querystring";

export default function Home() {
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(trpc.getData.queryOptions());
  console.log(data);
  return (
    <div className="mt-8">
      <h1 className="font-semibold text-2xl bg-red-300 hover:bg-red-400 flex justify-center content-center p-4">
        Get The Data from backend or the Server
      </h1>
      <div className="mt-15 border-2 border-amber-400 m-50 p-10">
        <p className="text-xl">Data: {!isLoading && stringify(data)}</p>
      </div>
    </div>
  );
}
