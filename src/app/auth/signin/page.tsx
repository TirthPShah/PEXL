"use client";


import { signIn } from "next-auth/react";
import OtpLogin from "@/components/OtpLogin";
export default function SignIn() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <OtpLogin/>
    </div>
  );
}
