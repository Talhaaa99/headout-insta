"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import Image from "next/image";

export default function ProfileSection() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="text-center space-y-4">
        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-muted/20 border-4 border-background shadow-lg">
          {user?.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={user.username || "Profile"}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {user?.username?.charAt(0).toUpperCase() ||
                  user?.firstName?.charAt(0).toUpperCase() ||
                  "U"}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-title text-foreground">
            {user?.username || user?.firstName || "Unknown User"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {user?.emailAddresses[0]?.emailAddress}
          </p>
        </div>
      </div>

      {/* Logout Button */}
      <div className="pt-6 border-t border-border/20">
        <SignOutButton>
          <button className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 rounded-xl font-medium text-base h-12 px-6 cursor-pointer transition-all duration-200 hover:bg-red-500/20 active:scale-95 border border-red-500/20">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
