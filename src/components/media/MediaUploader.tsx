// Advanced Media Uploader Component for Creaverse DAO
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  X, 
  Image, 
  Video, 
  Music, 
  FileText, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { mediaStorageService, MediaFile, MediaType } from '@/services/mediaStorageService';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaUploaderProps {
  mediaType: MediaType;
  onUpload: (mediaFile: MediaFile) => void;
  onRemove: () => void;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
}

export function MediaUploader({ 
  mediaType, 
  onUpload, 
  onRemove, 
  maxSize = 50 * 1024 * 1024,
  className,
  disabled = false
}: MediaUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedMedia, setUploadedMedia] = useState<MediaFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Media type configuration
  const mediaConfig = {
    image: { 
      icon: Image, 
      label: 'Image', 
      accept: 'image/*',
      description: 'JPG, PNG, GIF, WebP up to 50MB'
    },
    video: { 
      icon: Video, 
      label: 'Video', 
      accept: 'video/*',
      description: 'MP4, WebM, MOV up to 50MB'
    },
    audio: { 
      icon: Music, 
      label: 'Audio', 
      accept: 'audio/*',
      description: 'MP3, WAV, OGG, M4A up to 50MB'
    },
    document: { 
      icon: FileText, 
      label: 'Document', 
      accept: '.pdf,.doc,.docx,.ppt,.pptx,.txt',
      description: 'PDF, DOC, DOCX, PPT, PPTX, TXT up to 50MB'
    }
  };

  const config = mediaConfig[mediaType];
  const Icon = config.icon;

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    if (disabled) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 100);

      // Upload media
      const mediaFile = await mediaStorageService.uploadMedia(file, mediaType, {
        maxSize,
        generateThumbnail: true
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Set uploaded media
      setUploadedMedia(mediaFile);
      onUpload(mediaFile);

      toast.success(`${config.label} uploaded successfully!`, {
        description: `${mediaFile.file.name} (${mediaStorageService.formatFileSize(mediaFile.file.size)})`
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [mediaType, maxSize, onUpload, disabled, config.label]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect, disabled]);

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle remove media
  const handleRemove = useCallback(() => {
    if (uploadedMedia) {
      mediaStorageService.deleteMedia(uploadedMedia.id);
      setUploadedMedia(null);
      setIsPlaying(false);
      onRemove();
    }
  }, [uploadedMedia, onRemove]);

  // Media playback controls
  const togglePlayback = useCallback(() => {
    if (mediaType === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (mediaType === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [mediaType, isPlaying]);

  const toggleMute = useCallback(() => {
    if (mediaType === 'video' && videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    } else if (mediaType === 'audio' && audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [mediaType, isMuted]);

  // Open document preview
  const openDocumentPreview = useCallback(() => {
    if (uploadedMedia && uploadedMedia.type === 'document') {
      const url = URL.createObjectURL(uploadedMedia.file);
      window.open(url, '_blank');
    }
  }, [uploadedMedia]);

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-0">
        <AnimatePresence mode="wait">
          {uploadedMedia ? (
            // Media Preview
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative"
            >
              {/* Remove button */}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 z-10 h-8 w-8"
                onClick={handleRemove}
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Media content */}
              {mediaType === 'image' && (
                <div className="relative aspect-square">
                  <img
                    src={uploadedMedia.url}
                    alt="Uploaded content"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="glass" className="text-xs">
                      {uploadedMedia.metadata.dimensions && 
                        `${uploadedMedia.metadata.dimensions.width}×${uploadedMedia.metadata.dimensions.height}`
                      }
                    </Badge>
                  </div>
                </div>
              )}

              {mediaType === 'video' && (
                <div className="relative aspect-video">
                  <video
                    ref={videoRef}
                    src={uploadedMedia.url}
                    className="w-full h-full object-cover rounded-lg"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    muted={isMuted}
                  />
                  
                  {/* Video controls overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-black/50 text-white hover:bg-black/70"
                        onClick={togglePlayback}
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-black/50 text-white hover:bg-black/70"
                        onClick={toggleMute}
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>

                  {/* Video info */}
                  <div className="absolute bottom-2 left-2 flex gap-2">
                    <Badge variant="glass" className="text-xs">
                      {uploadedMedia.metadata.duration && 
                        mediaStorageService.formatDuration(uploadedMedia.metadata.duration)
                      }
                    </Badge>
                    <Badge variant="glass" className="text-xs">
                      {uploadedMedia.metadata.dimensions && 
                        `${uploadedMedia.metadata.dimensions.width}×${uploadedMedia.metadata.dimensions.height}`
                      }
                    </Badge>
                  </div>
                </div>
              )}

              {mediaType === 'audio' && (
                <div className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                      <Music className="w-10 h-10 text-white" />
                    </div>
                    
                    <h3 className="font-medium mb-2 truncate">{uploadedMedia.file.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {mediaStorageService.formatFileSize(uploadedMedia.file.size)}
                      {uploadedMedia.metadata.duration && 
                        ` • ${mediaStorageService.formatDuration(uploadedMedia.metadata.duration)}`
                      }
                    </p>

                    {/* Audio controls */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={togglePlayback}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleMute}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                    </div>

                    <audio
                      ref={audioRef}
                      src={uploadedMedia.url}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      muted={isMuted}
                      controls
                      className="w-full max-w-sm"
                    />
                  </div>
                </div>
              )}

              {mediaType === 'document' && (
                <div className="p-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-10 h-10 text-white" />
                    </div>
                    
                    <h3 className="font-medium mb-2 truncate">{uploadedMedia.file.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {mediaStorageService.formatFileSize(uploadedMedia.file.size)}
                      {uploadedMedia.metadata.pages && uploadedMedia.metadata.pages > 1 && 
                        ` • ${uploadedMedia.metadata.pages} pages`
                      }
                    </p>

                    <Button
                      variant="outline"
                      onClick={openDocumentPreview}
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Preview Document
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            // Upload Area
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {isUploading ? (
                // Upload Progress
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <h3 className="font-medium mb-2">Uploading {config.label}...</h3>
                  <Progress value={uploadProgress} className="w-full max-w-xs mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{Math.round(uploadProgress)}% complete</p>
                </div>
              ) : (
                // Upload Interface
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "p-8 border-2 border-dashed rounded-lg transition-all cursor-pointer",
                    isDragOver 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => !disabled && fileInputRef.current?.click()}
                >
                  <div className="text-center">
                    <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors",
                      isDragOver 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {isDragOver ? (
                        <CheckCircle className="w-8 h-8" />
                      ) : (
                        <Icon className="w-8 h-8" />
                      )}
                    </div>
                    
                    <h3 className="font-medium mb-2">
                      {isDragOver 
                        ? `Drop ${config.label.toLowerCase()} here` 
                        : `Upload ${config.label}`
                      }
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {config.description}
                    </p>

                    <Button 
                      variant="outline" 
                      disabled={disabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept={config.accept}
                onChange={handleInputChange}
                className="hidden"
                disabled={disabled}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}