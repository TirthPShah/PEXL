"use client"; // Make this a Client Component

import { signOut, signIn, useSession } from "next-auth/react";
import NavBar from "@/components/NavBar";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();

  return (
    <>
      <NavBar></NavBar>
      <div className="flex w-screen">
        <div>
          <Image
            src="/printer.webp"
            alt="printer"
            width={700}
            height={700}
            className="h-auto w-auto py-[13rem] px-[10rem] opacity-90"
          ></Image>
        </div>
      </div>
    </>
  );
}
