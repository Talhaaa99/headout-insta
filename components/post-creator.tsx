"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Check, Loader2 } from "lucide-react";
import Image from "next/image";

interface FormValues {
  caption: string;
}

interface PostCreatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostCreator({ isOpen, onClose }: PostCreatorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset } = useForm<FormValues>();

  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute("capture");
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmitPost = async (values: FormValues) => {
    if (!selectedFile) return;

    const fd = new FormData();
    fd.append("file", selectedFile);
    fd.append("caption", values.caption || "");

    setSubmitting(true);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setSubmitting(false);

    if (!res.ok) {
      toast.error("Upload failed");
      return;
    }

    toast.success("Posted successfully!");
    reset();
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-card rounded-2xl w-full max-w-md mx-4 overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/20">
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="font-title text-lg">Create Post</h2>
              <div className="w-9" /> {/* Spacer */}
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {!selectedFile ? (
                /* Camera/File Selector */
                <div className="text-center py-12 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={openCamera}
                      className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors"
                    >
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Camera className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-title text-sm">Camera</p>
                        <p className="text-muted-foreground text-xs">
                          Take photo
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={openFileSelector}
                      className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors"
                    >
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg
                          className="h-6 w-6 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-title text-sm">Gallery</p>
                        <p className="text-muted-foreground text-xs">
                          Choose photo
                        </p>
                      </div>
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                /* Preview and Caption */
                <div className="space-y-4">
                  <div className="relative aspect-square rounded-xl overflow-hidden">
                    <Image
                      src={previewUrl!}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <textarea
                    placeholder="Add a caption..."
                    className="w-full resize-none bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground font-text text-sm leading-relaxed"
                    rows={3}
                    {...register("caption")}
                  />
                  <Button
                    onClick={handleSubmit(handleSubmitPost)}
                    disabled={submitting}
                    className="w-full font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Post
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
