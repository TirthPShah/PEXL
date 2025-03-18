"use client"; // Make this a Client Component

import { signOut, signIn, useSession } from "next-auth/react";
import NavBar from "@/components/NavBar";
import Image from "next/image";
import "@/app/globals.css";
import { useEffect } from "react";

export default function Home() {

  const { data: session } = useSession();
  useEffect(() => {
    const strikeElement = document.getElementById("stuckText");
    if(strikeElement) {
      setTimeout(() => {
        strikeElement.classList.add("change-color");
      }, 500)
    }
  }, []);

  return (
    <>
      <NavBar></NavBar>
      <div className="flex w-screen">
        <div className="w-[50vw] h-screen flex justify-center items-center">
          <Image
            src="/printer.webp"
            alt="printer"
            width={700}
            height={700}
            className="h-auto w-auto py-[13rem] px-[10rem] opacity-90 animate-slowJump"
          ></Image>
        </div>

        <div className="w-[50vw] h-screen flex flex-col items-center justify-center content-center">
          <div>
            <h1 className="text-5xl font-bold">
              Push.&nbsp;&nbsp;&nbsp;Pay.&nbsp;&nbsp;&nbsp;Pick-Up.
            </h1>
          </div>
          <div className="flex items-center justify-center text-4xl font-[300] gap-5 mt-4">
            <span
              id="stuckText"
              className="animate-strike text-red-400 text-[29px] font-bold"
            >
              Stuck in line?
            </span>{" "}
            <span className="font-[500]">&nbsp;Use </span>{" "}
            <Image
              src="/pexl-logo.svg"
              alt="PEXL"
              width={1}
              height={50}
              style={{ height: "60px", width: "auto" }}
              className="mt-[0.4rem]"
            />
          </div>
          <div></div>
        </div>
      </div>
    </>
  );
}
