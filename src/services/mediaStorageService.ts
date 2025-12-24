// Comprehensive Media Storage Service for Creaverse DAO
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type MediaType = "image" | "video" | "audio" | "document";

export interface MediaFile {
  id: string;
  file: File;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  metadata: {
    size: number;
    duration?: number; // for video/audio
    dimensions?: { width: number; height: number }; // for images/videos
    pages?: number; // for documents
  };
  uploadedAt: Date;
}

export interface MediaUploadOptions {
  maxSize?: number; // in bytes, default 50MB
  allowedTypes?: string[];
  generateThumbnail?: boolean;
  quality?: number; // for image compression (0-1)
}

class MediaStorageService {
  private readonly DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly STORAGE_BUCKET = 'media-uploads';

  /**
   * Ensure the storage bucket exists, create if it doesn't
   */
  private async ensureBucketExists(): Promise<void> {
    try {
      // Check if bucket exists by trying to list files
      const { error } = await supabase.storage.from(this.STORAGE_BUCKET).list('', { limit: 1 });
      
      if (error && error.message.includes('not found')) {
        // Bucket doesn't exist, try to create it
        const { error: createError } = await supabase.storage.createBucket(this.STORAGE_BUCKET, {
          public: true,
          allowedMimeTypes: [
            'image/*',
            'video/*',
            'audio/*',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ],
          fileSizeLimit: this.DEFAULT_MAX_SIZE
        });
        
        if (createError) {
          console.warn('Could not create bucket, using fallback:', createError);
          // Fallback to using local object URLs
          throw new Error('Storage bucket not available, using local storage');
        }
      }
    } catch (error) {
      console.warn('Bucket check failed, using local storage fallback:', error);
      throw error;
    }
  }

  // Supported file types
  private readonly SUPPORTED_TYPES = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    video: ['video/mp4', 'video/webm', 'video/mov', 'video/avi', 'video/quicktime'],
    audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/mpeg'],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ]
  };

  /**
   * Validate file before upload
   */
  validateFile(file: File, mediaType: MediaType, options: MediaUploadOptions = {}): { valid: boolean; error?: string } {
    const maxSize = options.maxSize || this.DEFAULT_MAX_SIZE;
    
    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size too large. Maximum size is ${this.formatFileSize(maxSize)}`
      };
    }

    // Check file type
    const allowedTypes = options.allowedTypes || this.SUPPORTED_TYPES[mediaType];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Unsupported file type. Expected ${mediaType} file, got ${file.type}`
      };
    }

    // Additional validation based on media type
    switch (mediaType) {
      case 'image':
        if (!file.type.startsWith('image/')) {
          return { valid: false, error: 'Please select a valid image file' };
        }
        break;
      case 'video':
        if (!file.type.startsWith('video/')) {
          return { valid: false, error: 'Please select a valid video file' };
        }
        break;
      case 'audio':
        if (!file.type.startsWith('audio/')) {
          return { valid: false, error: 'Please select a valid audio file' };
        }
        break;
      case 'document':
        const validDocTypes = this.SUPPORTED_TYPES.document;
        if (!validDocTypes.includes(file.type)) {
          return { valid: false, error: 'Please select a valid document file (PDF, DOC, DOCX, PPT, PPTX, TXT)' };
        }
        break;
    }

    return { valid: true };
  }

  /**
   * Upload and process media file to Supabase Storage
   */
  async uploadMedia(file: File, mediaType: MediaType, options: MediaUploadOptions = {}): Promise<MediaFile> {
    // Validate file
    const validation = this.validateFile(file, mediaType, options);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const id = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}.${fileExt}`;
    const filePath = `${mediaType}s/${fileName}`;
    
    try {
      // Try to ensure bucket exists
      await this.ensureBucketExists();
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.STORAGE_BUCKET)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      // Get metadata
      const metadata = await this.extractMetadata(file, mediaType);
      
      // Generate thumbnail if needed
      let thumbnailUrl: string | undefined;
      if (options.generateThumbnail !== false && (mediaType === 'image' || mediaType === 'video')) {
        try {
          thumbnailUrl = await this.generateThumbnail(file, mediaType, id);
        } catch (error) {
          console.warn('Failed to generate thumbnail:', error);
          // Continue without thumbnail
        }
      }

      const mediaFile: MediaFile = {
        id,
        file,
        type: mediaType,
        url: urlData.publicUrl,
        thumbnailUrl,
        metadata,
        uploadedAt: new Date()
      };

      console.log(`✅ Media uploaded successfully to Supabase:`, {
        id,
        type: mediaType,
        size: this.formatFileSize(file.size),
        url: urlData.publicUrl,
        metadata
      });

      return mediaFile;
    } catch (error) {
      console.warn('❌ Supabase upload failed, using local fallback:', error);
      
      // Fallback to local object URLs
      return this.uploadMediaLocal(file, mediaType, options, id);
    }
  }

  /**
   * Fallback method for local media storage
   */
  private async uploadMediaLocal(file: File, mediaType: MediaType, options: MediaUploadOptions, id: string): Promise<MediaFile> {
    try {
      // Create object URL for the file
      const url = URL.createObjectURL(file);
      
      // Get metadata
      const metadata = await this.extractMetadata(file, mediaType);
      
      // Generate thumbnail if needed (local)
      let thumbnailUrl: string | undefined;
      if (options.generateThumbnail !== false && (mediaType === 'image' || mediaType === 'video')) {
        try {
          thumbnailUrl = await this.generateThumbnailLocal(file, mediaType);
        } catch (error) {
          console.warn('Failed to generate local thumbnail:', error);
        }
      }

      const mediaFile: MediaFile = {
        id,
        file,
        type: mediaType,
        url,
        thumbnailUrl,
        metadata,
        uploadedAt: new Date()
      };

      console.log(`✅ Media uploaded locally:`, {
        id,
        type: mediaType,
        size: this.formatFileSize(file.size),
        metadata
      });

      return mediaFile;
    } catch (error) {
      console.error('❌ Local media upload failed:', error);
      throw new Error(`Failed to upload ${mediaType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract metadata from media file
   */
  private async extractMetadata(file: File, mediaType: MediaType): Promise<MediaFile['metadata']> {
    const metadata: MediaFile['metadata'] = {
      size: file.size
    };

    try {
      switch (mediaType) {
        case 'image':
          const imageDimensions = await this.getImageDimensions(file);
          metadata.dimensions = imageDimensions;
          break;
        
        case 'video':
          const videoData = await this.getVideoMetadata(file);
          metadata.dimensions = videoData.dimensions;
          metadata.duration = videoData.duration;
          break;
        
        case 'audio':
          const audioDuration = await this.getAudioDuration(file);
          metadata.duration = audioDuration;
          break;
        
        case 'document':
          // For documents, we could extract page count, but for now just store basic info
          metadata.pages = 1; // Placeholder
          break;
      }
    } catch (error) {
      console.warn('Failed to extract metadata:', error);
    }

    return metadata;
  }

  /**
   * Generate thumbnail for media and upload to Supabase
   */
  private async generateThumbnail(file: File, mediaType: MediaType, mediaId: string): Promise<string | undefined> {
    try {
      switch (mediaType) {
        case 'image':
          return await this.generateImageThumbnail(file, mediaId);
        case 'video':
          return await this.generateVideoThumbnail(file, mediaId);
        case 'audio':
          return undefined; // Audio doesn't need thumbnails
        case 'document':
          return undefined; // Document thumbnails would require PDF.js or similar
        default:
          return undefined;
      }
    } catch (error) {
      console.warn('Failed to generate thumbnail:', error);
      return undefined;
    }
  }

  /**
   * Generate thumbnail locally (fallback)
   */
  private async generateThumbnailLocal(file: File, mediaType: MediaType): Promise<string | undefined> {
    try {
      switch (mediaType) {
        case 'image':
          return await this.generateImageThumbnailLocal(file);
        case 'video':
          return await this.generateVideoThumbnailLocal(file);
        case 'audio':
          return undefined;
        case 'document':
          return undefined;
        default:
          return undefined;
      }
    } catch (error) {
      console.warn('Failed to generate local thumbnail:', error);
      return undefined;
    }
  }

  /**
   * Get image dimensions
   */
  private getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Get video metadata
   */
  private getVideoMetadata(file: File): Promise<{ dimensions: { width: number; height: number }; duration: number }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        resolve({
          dimensions: { width: video.videoWidth, height: video.videoHeight },
          duration: video.duration
        });
      };
      video.onerror = reject;
      video.src = URL.createObjectURL(file);
    });
  }

  /**
   * Get audio duration
   */
  private getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = document.createElement('audio');
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
      audio.onerror = reject;
      audio.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate image thumbnail and upload to Supabase
   */
  private async generateImageThumbnail(file: File, mediaId: string, maxSize = 400): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = async () => {
        try {
          // Calculate thumbnail dimensions
          const { width, height } = this.calculateThumbnailSize(img.naturalWidth, img.naturalHeight, maxSize);
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(async (blob) => {
            if (blob) {
              try {
                // Upload thumbnail to Supabase
                const thumbnailPath = `thumbnails/${mediaId}_thumb.jpg`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                  .from(this.STORAGE_BUCKET)
                  .upload(thumbnailPath, blob, {
                    cacheControl: '3600',
                    upsert: false
                  });

                if (uploadError) {
                  console.warn('Failed to upload thumbnail:', uploadError);
                  resolve(URL.createObjectURL(blob)); // Fallback to local URL
                  return;
                }

                // Get public URL for thumbnail
                const { data: urlData } = supabase.storage
                  .from(this.STORAGE_BUCKET)
                  .getPublicUrl(thumbnailPath);

                resolve(urlData.publicUrl);
              } catch (error) {
                console.warn('Failed to upload thumbnail:', error);
                resolve(URL.createObjectURL(blob)); // Fallback to local URL
              }
            } else {
              reject(new Error('Failed to generate thumbnail'));
            }
          }, 'image/jpeg', 0.8);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate video thumbnail and upload to Supabase
   */
  private async generateVideoThumbnail(file: File, mediaId: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1, video.duration * 0.1); // 10% into video or 1 second
      };

      video.onseeked = async () => {
        try {
          const { width, height } = this.calculateThumbnailSize(video.videoWidth, video.videoHeight, 400);
          
          canvas.width = width;
          canvas.height = height;
          
          ctx?.drawImage(video, 0, 0, width, height);
          
          canvas.toBlob(async (blob) => {
            if (blob) {
              try {
                // Upload thumbnail to Supabase
                const thumbnailPath = `thumbnails/${mediaId}_thumb.jpg`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                  .from(this.STORAGE_BUCKET)
                  .upload(thumbnailPath, blob, {
                    cacheControl: '3600',
                    upsert: false
                  });

                if (uploadError) {
                  console.warn('Failed to upload video thumbnail:', uploadError);
                  resolve(URL.createObjectURL(blob)); // Fallback to local URL
                  return;
                }

                // Get public URL for thumbnail
                const { data: urlData } = supabase.storage
                  .from(this.STORAGE_BUCKET)
                  .getPublicUrl(thumbnailPath);

                resolve(urlData.publicUrl);
              } catch (error) {
                console.warn('Failed to upload video thumbnail:', error);
                resolve(URL.createObjectURL(blob)); // Fallback to local URL
              }
            } else {
              reject(new Error('Failed to generate video thumbnail'));
            }
          }, 'image/jpeg', 0.8);
        } catch (error) {
          reject(error);
        }
      };

      video.onerror = reject;
      video.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calculate thumbnail dimensions maintaining aspect ratio
   */
  private calculateThumbnailSize(originalWidth: number, originalHeight: number, maxSize: number) {
    const aspectRatio = originalWidth / originalHeight;
    
    if (originalWidth > originalHeight) {
      return {
        width: Math.min(maxSize, originalWidth),
        height: Math.min(maxSize, originalWidth) / aspectRatio
      };
    } else {
      return {
        width: Math.min(maxSize, originalHeight) * aspectRatio,
        height: Math.min(maxSize, originalHeight)
      };
    }
  }

  /**
   * Generate image thumbnail locally
   */
  private generateImageThumbnailLocal(file: File, maxSize = 400): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const { width, height } = this.calculateThumbnailSize(img.naturalWidth, img.naturalHeight, maxSize);
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Failed to generate thumbnail'));
          }
        }, 'image/jpeg', 0.8);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate video thumbnail locally
   */
  private generateVideoThumbnailLocal(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1, video.duration * 0.1);
      };

      video.onseeked = () => {
        const { width, height } = this.calculateThumbnailSize(video.videoWidth, video.videoHeight, 400);
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(video, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Failed to generate video thumbnail'));
          }
        }, 'image/jpeg', 0.8);
      };

      video.onerror = reject;
      video.src = URL.createObjectURL(file);
    });
  }

  /**
   * Delete media file from Supabase Storage
   */
  async deleteMedia(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.STORAGE_BUCKET)
        .remove([filePath]);
      
      if (error) {
        console.error('Failed to delete media:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete media:', error);
      return false;
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format duration for display
   */
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

}

export const mediaStorageService = new MediaStorageService();