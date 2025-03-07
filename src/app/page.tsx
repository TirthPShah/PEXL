"use client"; // Make this a Client Component

import { signOut, signIn, useSession } from "next-auth/react";
import StatusCard from "@/components/StatusCard";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      {session ? (
        <div>
          <h1>Welcome, {session.user?.name}</h1>
          <button
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-md"
            onClick={() => signOut()}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md"
          onClick={() => signIn("google")}
        >
          Sign In with Google
        </button>
      )}
      <StatusCard name="Mumbai Stationary" status="Online" pages={3} />
    </main>
  );
}
