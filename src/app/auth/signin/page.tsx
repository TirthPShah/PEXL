"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Sign In</h1>
      <button
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md"
        onClick={() => signIn("google")}
      >
        Sign in with Google
      </button>
    </div>
  );
}
