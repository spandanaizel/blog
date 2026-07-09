import { useRef } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';

interface CoverImagePickerProps {
  value: string;
  onChange: (url: string, publicId: string | null) => void;
}

export function CoverImagePicker({ value, onChange }: CoverImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, progress, isUploading } = useImageUpload();

  async function handleFile(file: File) {
    const result = await upload(file, 'cover');
    if (result) onChange(result.url, result.publicId);
  }

  if (value) {
    return (
      <div className="group relative overflow-hidden rounded-lg">
        <img src={value} alt="Cover" loading="lazy" className="aspect-[16/7] w-full object-cover" />
        <button
          onClick={() => onChange('', null)}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="Remove cover image"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => !isUploading && inputRef.current?.click()}
      disabled={isUploading}
      className="relative flex aspect-[16/7] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-wait"
    >
      {isUploading ? (
        <>
          <Loader2 className="h-7 w-7 animate-spin" />
          <span className="text-sm font-medium">Uploading… {progress}%</span>
          <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all" style={{ width: `${progress}%` }} />
        </>
      ) : (
        <>
          <ImagePlus className="h-7 w-7" />
          <span className="text-sm font-medium">Add a cover image</span>
          <span className="text-xs text-muted-foreground">JPEG, PNG, WEBP, or GIF — up to 5MB</span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </button>
  );
}
