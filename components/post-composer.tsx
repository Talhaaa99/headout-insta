// components/post-composer.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FormValues {
  file?: FileList;
  caption?: string;
}

export default function PostComposer() {
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values: FormValues) => {
    const file = values.file?.[0];
    if (!file) return toast("Choose a photo");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("caption", values.caption || "");
    // Optional location payload
    // fd.append("location", JSON.stringify({ name: "Some POI", lat: 12.97, lng: 77.59 }))

    setSubmitting(true);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setSubmitting(false);
    if (!res.ok) return toast("Upload failed");
    reset();
    toast("Posted!");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 p-4 border rounded-lg"
    >
      <Input
        type="file"
        accept="image/*"
        capture="environment"
        {...register("file")}
      />
      <Textarea placeholder="Add a caption…" {...register("caption")} />
      <Button disabled={submitting} type="submit">
        Post
      </Button>
    </form>
  );
}
