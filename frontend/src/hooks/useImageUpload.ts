import { useState } from 'react';
import { uploadsApi, type UploadCategory, type UploadResult } from '@/api/uploadsApi';
import { toast } from '@/hooks/useToast';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function useImageUpload() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  async function upload(file: File, category: UploadCategory): Promise<UploadResult | null> {
    if (file.size > MAX_SIZE_BYTES) {
      toast({ title: 'Image too large', description: 'Please choose an image under 5MB.', variant: 'destructive' });
      return null;
    }
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Unsupported file', description: 'Please choose an image file.', variant: 'destructive' });
      return null;
    }

    setIsUploading(true);
    setProgress(0);
    try {
      const result = await uploadsApi.uploadImage(file, category, setProgress);
      return result;
    } catch (err: any) {
      toast({
        title: 'Upload failed',
        description: err?.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  return { upload, progress, isUploading };
}
