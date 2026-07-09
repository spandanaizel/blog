import { apiClient } from '@/lib/axios';
import type { ApiResponse } from '@/types';

export type UploadCategory = 'avatar' | 'cover' | 'editor';

export interface UploadResult {
  url: string;
  publicId: string | null;
}

export const uploadsApi = {
  uploadImage: (file: File, category: UploadCategory, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', category);

    return apiClient
      .post<ApiResponse<UploadResult>>('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      })
      .then((r) => r.data.data);
  },

  deleteImage: (publicId: string) =>
    apiClient.delete<ApiResponse<null>>('/uploads/image', { data: { publicId } }).then((r) => r.data),
};
