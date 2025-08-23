"use client";

import Feed from "@/components/feed";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useState } from "react";
import BottomNav from "@/components/bottom-nav";
import PostCreator from "@/components/post-creator";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"home" | "add" | "profile">(
    "home"
  );
  const [isPostCreatorOpen, setIsPostCreatorOpen] = useState(false);

  const handleAddClick = () => {
    setIsPostCreatorOpen(true);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <SignedIn>
        {/* Main Content */}
        <main className="mx-auto max-w-md pb-20">
          {activeTab === "home" && (
            <div className="p-4">
              <Feed />
            </div>
          )}
          {activeTab === "profile" && (
            <div className="p-4 text-center">
              <div className="glass-effect rounded-2xl p-8">
                <h2 className="text-2xl font-title text-foreground mb-4">
                  Profile
                </h2>
                <p className="text-muted-foreground">
                  Your profile content will appear here
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddClick={handleAddClick}
        />

        {/* Post Creator Modal */}
        <PostCreator
          isOpen={isPostCreatorOpen}
          onClose={() => setIsPostCreatorOpen(false)}
        />
      </SignedIn>

      <SignedOut>
        <main className="mx-auto max-w-md p-6">
          <div className="text-center space-y-8 py-16">
            <div className="glass-effect rounded-2xl p-8 glow">
              <h1 className="text-4xl font-title text-foreground mb-4">
                Welcome to Vistagram
              </h1>
              <p className="text-muted-foreground font-text text-lg leading-relaxed">
                Sign in to start sharing your photos and see what others are
                posting.
              </p>
            </div>
          </div>
        </main>
      </SignedOut>
    </div>
  );
}
