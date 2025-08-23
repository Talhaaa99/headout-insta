"use client";

import Feed from "@/components/feed";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useState } from "react";
import BottomNav from "@/components/bottom-nav";
import PostCreator from "@/components/post-creator";
import Header from "@/components/header";
import ProfileSection from "@/components/profile-section";

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
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="mx-auto max-w-md pt-16 pb-24">
          {activeTab === "home" && (
            <div className="p-4">
              <Feed />
            </div>
          )}
          {activeTab === "profile" && (
            <div className="p-4">
              <ProfileSection />
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
