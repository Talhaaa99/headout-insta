"use client";

import Feed from "@/components/feed";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useState } from "react";
import { Home as HomeIcon, Plus, User } from "lucide-react";
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
        <div className="flex">
          {/* Desktop Sidebar - Hidden on mobile */}
          <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:left-0 lg:top-0 lg:h-full lg:border-r lg:border-border/20 lg:bg-background/95 lg:backdrop-blur-sm lg:z-10">
            {/* Desktop Logo */}
            <div className="p-6 border-b border-border/20">
              <h1 className="text-3xl font-cursive font-bold text-foreground">
                Vistagram
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="flex-1 p-6 space-y-3">
              <button
                onClick={() => setActiveTab("home")}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left ${
                  activeTab === "home"
                    ? "bg-primary/10 text-primary shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <HomeIcon
                  className={`h-6 w-6 ${
                    activeTab === "home" ? "fill-current" : ""
                  }`}
                />
                <span className="font-medium text-lg">Home</span>
              </button>

              <button
                onClick={handleAddClick}
                className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-primary hover:bg-primary/10 text-left"
              >
                <Plus className="h-6 w-6" />
                <span className="font-medium text-lg">Create</span>
              </button>

              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left ${
                  activeTab === "profile"
                    ? "bg-primary/10 text-primary shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <User
                  className={`h-6 w-6 ${
                    activeTab === "profile" ? "fill-current" : ""
                  }`}
                />
                <span className="font-medium text-lg">Profile</span>
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 lg:ml-72">
            {/* Mobile Header - Hidden on desktop */}
            <div className="lg:hidden">
              <Header />
            </div>

            {/* Content */}
            <main className="mx-auto max-w-md lg:max-w-2xl xl:max-w-4xl pt-16 lg:pt-8 pb-24 lg:pb-8">
              {activeTab === "home" && (
                <div className="p-4 lg:p-8">
                  <div className="lg:grid lg:grid-cols-3 lg:gap-8 xl:gap-12">
                    {/* Main Feed */}
                    <div className="lg:col-span-2">
                      <Feed />
                    </div>

                    {/* Desktop Suggestions Panel */}
                    <div className="hidden lg:block">
                      <div className="sticky top-8">
                        <div className="glass-effect rounded-2xl p-6">
                          <h3 className="text-lg font-title text-foreground mb-4">
                            Suggested for you
                          </h3>
                          <div className="text-center py-8">
                            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                              <span className="text-white text-xl">👥</span>
                            </div>
                            <p className="text-muted-foreground font-medium">
                              Coming Soon
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Discover and connect with new people
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "profile" && (
                <div className="p-4 lg:p-8">
                  <div className="max-w-3xl mx-auto">
                    <ProfileSection />
                  </div>
                </div>
              )}
            </main>
          </div>

          {/* Mobile Bottom Navigation - Hidden on desktop */}
          <div className="lg:hidden">
            <BottomNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onAddClick={handleAddClick}
            />
          </div>
        </div>

        {/* Post Creator Modal */}
        <PostCreator
          isOpen={isPostCreatorOpen}
          onClose={() => setIsPostCreatorOpen(false)}
        />
      </SignedIn>

      <SignedOut>
        <main className="flex items-center justify-center min-h-screen p-4 sm:p-6">
          <div className="w-full max-w-md space-y-6 sm:space-y-8">
            {/* App Logo/Title */}
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  V
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-title text-foreground">
                Vistagram
              </h1>
              <p className="text-muted-foreground font-text text-base sm:text-lg leading-relaxed px-2">
                Share your photos and see what others are posting
              </p>
            </div>

            {/* Sign In Card */}
            <div className="glass-effect rounded-2xl p-6 sm:p-8 glow-hover">
              <div className="space-y-5 sm:space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-xl sm:text-2xl font-title text-foreground">
                    Welcome Back
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Sign in to continue to Vistagram
                  </p>
                </div>

                <div className="space-y-4">
                  <SignInButton mode="modal">
                    <button className="w-full bg-primary text-primary-foreground rounded-xl font-medium text-sm sm:text-base h-11 sm:h-12 px-6 cursor-pointer transition-all duration-200 hover:bg-primary/90 active:scale-95 shadow-lg">
                      Sign In
                    </button>
                  </SignInButton>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or
                      </span>
                    </div>
                  </div>

                  <SignUpButton mode="modal">
                    <button className="w-full bg-muted text-foreground rounded-xl font-medium text-sm sm:text-base h-11 sm:h-12 px-6 cursor-pointer transition-all duration-200 hover:bg-muted/80 active:scale-95 border border-border/20">
                      Create Account
                    </button>
                  </SignUpButton>
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    By signing in, you agree to our Terms of Service and Privacy
                    Policy
                  </p>
                </div>
              </div>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
              <div className="glass-effect rounded-xl p-3 sm:p-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-2 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-purple-500 text-base sm:text-lg">
                    📸
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Share Photos</p>
              </div>
              <div className="glass-effect rounded-xl p-3 sm:p-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-2 bg-pink-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-pink-500 text-base sm:text-lg">❤️</span>
                </div>
                <p className="text-xs text-muted-foreground">Like & Connect</p>
              </div>
              <div className="glass-effect rounded-xl p-3 sm:p-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-2 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-500 text-base sm:text-lg">👥</span>
                </div>
                <p className="text-xs text-muted-foreground">Discover People</p>
              </div>
            </div>
          </div>
        </main>
      </SignedOut>
    </div>
  );
}
