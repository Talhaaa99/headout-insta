"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Camera, Edit3, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Image from "next/image";

export default function ProfileSection() {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(
    user?.username || user?.firstName || ""
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    setIsUpdating(true);
    try {
      await user.update({
        username: displayName,
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(user?.username || user?.firstName || "");
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted/20 border-4 border-background shadow-lg">
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
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary/90 transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {isEditing ? (
            <div className="flex items-center justify-center gap-2">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="max-w-xs text-center"
                placeholder="Enter display name"
              />
              <Button
                onClick={handleSave}
                disabled={isUpdating}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                {isUpdating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-title text-foreground">
                {user?.username || user?.firstName || "Unknown User"}
              </h2>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <Edit3 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            {user?.emailAddresses[0]?.emailAddress}
          </p>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="text-center py-6 border-y border-border/20">
        <div className="text-2xl font-bold text-foreground">0</div>
        <div className="text-sm text-muted-foreground">Posts</div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h3 className="text-lg font-title text-foreground">Recent Activity</h3>
        <div className="text-center py-8">
          <div className="glass-effect rounded-2xl p-8">
            <p className="text-muted-foreground">No recent activity</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your posts and interactions will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
