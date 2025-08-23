// components/post-composer.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Camera, Loader2 } from "lucide-react";

interface FormValues {
  file?: FileList;
  caption?: string;
}

export default function PostComposer() {
  const { register, handleSubmit, reset, watch } = useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const file = watch("file");

  const onSubmit = async (values: FormValues) => {
    const file = values.file?.[0];
    if (!file) return toast.error("Choose a photo");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("caption", values.caption || "");

    setSubmitting(true);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setSubmitting(false);

    if (!res.ok) {
      toast.error("Upload failed");
      return;
    }

    reset();
    toast.success("Posted successfully!");
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 p-8 glass-effect rounded-2xl glow-hover transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Photo</label>
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            capture="environment"
            className="cursor-pointer"
            {...register("file")}
          />
          <Camera className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Caption</label>
        <Textarea
          placeholder="What's happening?"
          className="resize-none"
          rows={3}
          {...register("caption")}
        />
      </div>

            <Button 
        disabled={submitting || !file?.length} 
        type="submit"
        className="w-full font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 glow-hover"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Posting...
          </>
        ) : (
          "Post"
        )}
      </Button>
    </motion.form>
  );
}
