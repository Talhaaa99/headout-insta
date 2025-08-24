"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Check, RotateCw } from "lucide-react";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ImageCropperProps {
  imageUrl: string;
  onCrop: (croppedImage: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropper({
  imageUrl,
  onCrop,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Instagram standard aspect ratio (4:5)
  const ASPECT_RATIO = 4 / 5;

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;

      // Calculate the best crop size that fits the image
      const imageAspect = width / height;
      const targetAspect = ASPECT_RATIO;

      let cropWidth, cropHeight;

      if (imageAspect > targetAspect) {
        // Image is wider than target aspect ratio
        cropHeight = height;
        cropWidth = height * targetAspect;
      } else {
        // Image is taller than target aspect ratio
        cropWidth = width;
        cropHeight = width / targetAspect;
      }

      // Ensure crop doesn't exceed image bounds
      cropWidth = Math.min(cropWidth, width);
      cropHeight = Math.min(cropHeight, height);

      const crop = centerCrop(
        makeAspectCrop(
          {
            unit: "px",
            width: cropWidth,
            height: cropHeight,
          },
          ASPECT_RATIO,
          width,
          height
        ),
        width,
        height
      );
      setCrop(crop);
    },
    [ASPECT_RATIO]
  );

  const handleCrop = useCallback(() => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.imageSmoothingQuality = "high";
    ctx.imageSmoothingEnabled = true;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCrop(blob);
        }
      },
      "image/jpeg",
      0.95
    );
  }, [completedCrop, onCrop]);

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-card rounded-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/20">
          <button
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="font-title text-lg">Crop Photo</h2>
          <button
            onClick={handleCrop}
            disabled={!completedCrop}
            className="p-2 rounded-full hover:bg-muted transition-colors text-primary disabled:text-muted-foreground disabled:cursor-not-allowed"
          >
            <Check className="h-5 w-5" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="p-4">
          <div
            className="relative mx-auto overflow-hidden bg-muted/20 rounded-lg"
            style={{ maxHeight: "60vh" }}
          >
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={ASPECT_RATIO}
              minWidth={100}
              minHeight={100}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Crop"
                onLoad={onImageLoad}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  width: "100%",
                  height: "auto",
                  display: "block",
                  objectFit: "contain",
                }}
              />
            </ReactCrop>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={rotateImage}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              <RotateCw className="h-4 w-4" />
              <span className="text-sm">Rotate</span>
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Drag to adjust crop • Tap rotate to rotate
            </p>
          </div>
        </div>
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
}
