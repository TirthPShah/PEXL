"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";

interface UserHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserHeader({ className, ...props }: UserHeaderProps) {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <div className="flex items-center mt-25 gap-4 mb-8" {...props}>
      <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-2xl">
        {session.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={60}
            height={60}
            className="w-full h-full object-cover"
          />
        ) : (
          session.user?.name?.[0] || "U"
        )}
      </div>
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back, {session.user?.name?.split(" ")[0] || "User"}!
        </h1>
        <p className="text-gray-600">
          {
            props.role === "owner"
              ? "Manage your print shop and orders."
              : "Ready to print and shop your stationery needs."
          }
        </p>
      </div>
    </div>
  );
}
