"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "./_trpc/client";
import { useState } from "react";

export default function Home() {
  const trpc = useTRPC();

  const { data: backendData, isLoading } = useQuery(
    trpc.getData.queryOptions(),
  );
  console.log(backendData);

  const {
    mutate: mutate1,
    isPending,
    data: bottomData,
  } = useMutation(trpc.setData.mutationOptions());

  const buttonClicked = () => {
    mutate1();
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
          {!isPending && bottomData && <p>Data: {bottomData}</p>}
        </p>
      </div>
    </div>
  );
}
