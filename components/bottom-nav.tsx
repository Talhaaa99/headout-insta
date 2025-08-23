"use client";

import { UserButton } from "@clerk/nextjs";
import { Home, Plus, User } from "lucide-react";
import { motion } from "framer-motion";

interface BottomNavProps {
  activeTab: "home" | "add" | "profile";
  onTabChange: (tab: "home" | "add" | "profile") => void;
  onAddClick: () => void;
}

export default function BottomNav({ activeTab, onTabChange, onAddClick }: BottomNavProps) {
  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 glass-effect border-t border-border/20 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-around h-16 px-4">
        {/* Home Button */}
        <button
          onClick={() => onTabChange("home")}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 ${
            activeTab === "home" 
              ? "text-primary" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs font-medium">Home</span>
        </button>

        {/* Add Button */}
        <button
          onClick={onAddClick}
          className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 text-primary hover:text-primary/80"
        >
          <div className="h-6 w-6 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
            <Plus className="h-4 w-4 text-white" />
          </div>
          <span className="text-xs font-medium">Add</span>
        </button>

        {/* Profile Button */}
        <button
          onClick={() => onTabChange("profile")}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 ${
            activeTab === "profile" 
              ? "text-primary" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserButton />
          <span className="text-xs font-medium">Profile</span>
        </button>
      </div>
    </motion.nav>
  );
}
