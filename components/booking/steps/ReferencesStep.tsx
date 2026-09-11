"use client";

import { useRef, useState } from "react";
import { useTranslation } from "@/components/i18n/LanguageProvider";

interface ReferencesStepProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ReferencesStep({
  value,
  onChange,
}: ReferencesStepProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImages = async (files: FileList | File[]) => {
    setError(null);
    setUploading(true);

    const uploadedUrls: string[] = [];
    const localPreviews: string[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || t("upload.failed"));
        }

        uploadedUrls.push(data.url);
        localPreviews.push(URL.createObjectURL(file));
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : t("upload.failed"));
      }
    }

    setPreviews((prev) => [...prev, ...localPreviews]);

    onChange(
      [...value.split("\n").filter(Boolean), ...uploadedUrls].join("\n")
    );
    setUploading(false);
  };

  const removeImage = (index: number) => {
    const urls = value.split("\n").filter(Boolean);

    urls.splice(index, 1);

    const nextPreviews = [...previews];
    nextPreviews.splice(index, 1);

    setPreviews(nextPreviews);

    onChange(urls.join("\n"));
  };

  return (
    <div className="mt-4 sm:mt-12">
      <h2 className="text-3xl font-bold sm:text-4xl">
        {t("step.references.title")}
      </h2>

      <p className="mt-2 text-[#AAA79F] sm:mt-4">
        {t("step.references.description")}
      </p>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);

          if (e.dataTransfer.files.length) {
            uploadImages(e.dataTransfer.files);
          }
        }}
        className={`
          mt-4
          flex
          h-28
          cursor-pointer
          flex-col
          items-center
          justify-center
          rounded-2xl
          border-2
          border-dashed
          transition
          ${
            dragging
              ? "border-black bg-neutral-100"
              : "border-neutral-300 hover:border-black hover:bg-neutral-50"
          }
        `}
      >
       

        <h3 className="text-base font-semibold sm:text-xl">
          {t("step.references.drop")}
        </h3>

        <p className="mt-1 text-center text-sm text-[#AAA79F]">
          {t("step.references.browse")}
        </p>

        <input
          ref={inputRef}
          hidden
          multiple
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (!e.target.files?.length) return;
            uploadImages(e.target.files);
          }}
        />
      </div>

      {uploading && (
        <p className="mt-6 text-center text-sm text-[#AAA79F]">
          {t("step.references.uploading")}
        </p>
      )}
      {error && (
        <p className="mt-6 text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
            {previews.length > 0 && (
        <div
          className="
            mt-4
            grid
            grid-cols-3
            gap-2
          "
        >
          {previews.slice(0, 3).map((image, index) => (
            <div
              key={index}
              className="
                relative
                overflow-hidden
                  rounded-xl
                border
                border-neutral-200
              "
            >
              <img
                src={image}
                alt={`${t("step.references.imageAlt")} ${index + 1}`}
                draggable={false}
                className="
                  h-20
                  w-full
                  pointer-events-none
                  select-none
                  object-cover
                "
                style={{ WebkitTouchCallout: "none" }}
              />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="
                  absolute
                  right-2
                  top-2
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  bg-black/80
                  text-sm
                  text-white
                  transition
                  hover:bg-black
                "
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
