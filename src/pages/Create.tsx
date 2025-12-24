import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Image, 
  Video, 
  Music, 
  FileText, 
  Upload,
  Coins,
  X,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clapperboard,
  Palette,
  Code,
  BookOpen,
  Leaf,
  Music2,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCategories, useSubcategories, Subcategory } from "@/hooks/useCategories";
import { useCreatePost } from "@/hooks/usePosts";
import { Database } from "@/integrations/supabase/types";
import { motion, AnimatePresence } from "framer-motion";
import { MediaUploader } from "@/components/media/MediaUploader";
import { MediaFile } from "@/services/mediaStorageService";


type MediaType = Database["public"]["Enums"]["media_type"];
type CreatorType = Database["public"]["Enums"]["creator_type"];

const mediaTypes: { id: MediaType; label: string; icon: React.ComponentType<{ className?: string }>; accept: string }[] = [
  { id: "image", label: "Image", icon: Image, accept: "image/*" },
  { id: "video", label: "Video", icon: Video, accept: "video/*" },
  { id: "audio", label: "Audio", icon: Music, accept: "audio/*" },
  { id: "document", label: "Document", icon: FileText, accept: ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
];

// Category icon and color mapping
const categoryConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; gradient: string; color: string }> = {
  cinema: { icon: Clapperboard, gradient: "from-red-500 to-orange-500", color: "text-red-400" },
  art: { icon: Palette, gradient: "from-purple-500 to-pink-500", color: "text-purple-400" },
  tech: { icon: Code, gradient: "from-cyan-500 to-blue-500", color: "text-cyan-400" },
  books: { icon: BookOpen, gradient: "from-amber-500 to-yellow-500", color: "text-amber-400" },
  nature: { icon: Leaf, gradient: "from-green-500 to-emerald-500", color: "text-green-400" },
  music: { icon: Music2, gradient: "from-pink-500 to-rose-500", color: "text-pink-400" },
};

export default function Create() {
  const navigate = useNavigate();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType>("image");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isTokenized, setIsTokenized] = useState(false);
  const [tokenReward, setTokenReward] = useState(100);
  const [uploadedMedia, setUploadedMedia] = useState<MediaFile | null>(null);

  // Fetch categories and subcategories from database
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: subcategories, isLoading: subcategoriesLoading } = useSubcategories(selectedCategoryId || undefined);
  
  const createPost = useCreatePost();

  // Update selected subcategory when subcategory ID changes
  useEffect(() => {
    if (selectedSubcategoryId && subcategories) {
      const sub = subcategories.find(s => s.id === selectedSubcategoryId);
      setSelectedSubcategory(sub || null);
    } else {
      setSelectedSubcategory(null);
    }
  }, [selectedSubcategoryId, subcategories]);

  // Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubcategoryId("");
    setSelectedSubcategory(null);
  }, [selectedCategoryId]);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (uploadedMedia) {
        URL.revokeObjectURL(uploadedMedia.url);
        if (uploadedMedia.thumbnailUrl) {
          URL.revokeObjectURL(uploadedMedia.thumbnailUrl);
        }
      }
    };
  }, [uploadedMedia]);

  // Get selected category data
  const selectedCategory = categories?.find(c => c.id === selectedCategoryId);
  const categoryKey = selectedCategory?.name.toLowerCase() || "";
  const config = categoryConfig[categoryKey] || categoryConfig.tech;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleMediaUpload = (mediaFile: MediaFile) => {
    setUploadedMedia(mediaFile);
  };

  const handleMediaRemove = () => {
    setUploadedMedia(null);
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!selectedCategoryId || !selectedCategory) {
      toast.error("Please select a category");
      return;
    }
    if (!selectedSubcategoryId) {
      toast.error("Please select a subcategory");
      return;
    }
    if (!content.trim()) {
      toast.error("Please add a description");
      return;
    }
    if (!uploadedMedia && !isDraft) {
      toast.error("Please upload media");
      return;
    }

    // Map category name to creator_type enum
    const categoryName = selectedCategory.name.toLowerCase() as CreatorType;
    
    try {
      // Save to database only
      await createPost.mutateAsync({
        title: content.substring(0, 100),
        content,
        category: categoryName,
        subcategory_id: selectedSubcategoryId,
        media_type: selectedMediaType,
        media_url: uploadedMedia?.url || undefined,
        tags,
        is_tokenized: isTokenized,
        token_reward: isTokenized ? tokenReward : 0,
        is_published: !isDraft,
      });

      toast.success(isDraft ? "Draft saved!" : "Post published successfully!", {
        description: isDraft 
          ? "Your draft has been saved" 
          : "Your content is now live on Creaverse"
      });

      // Reset form
      if (!isDraft) {
        setSelectedCategoryId("");
        setSelectedSubcategoryId("");
        setContent("");
        setTags([]);
        setUploadedMedia(null);
        setIsTokenized(false);
        setTokenReward(100);
        
        // Navigate to feed after successful post creation
        setTimeout(() => {
          navigate("/feed");
        }, 1500);
      }
    } catch (error: any) {
      toast.error("Failed to create post", {
        description: error.message || "Please try again"
      });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Create New Post</h1>
          <p className="text-muted-foreground">Share your creative work with the community</p>
        </div>

        {/* Category Selection - Visual Cards */}
        <div className="mb-8">
          <Label className="text-base font-semibold mb-4 block flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">1</span>
            Select Your Creative Category
          </Label>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories?.map((category, index) => {
                const catKey = category.name.toLowerCase();
                const catConfig = categoryConfig[catKey] || categoryConfig.tech;
                const Icon = catConfig.icon;
                const isSelected = selectedCategoryId === category.id;
                
                return (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={cn(
                      "relative group p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden",
                      isSelected
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card"
                    )}
                  >
                    {/* Gradient overlay on hover/select */}
                    <div className={cn(
                      "absolute inset-0 opacity-0 transition-opacity duration-300",
                      `bg-gradient-to-br ${catConfig.gradient}`,
                      isSelected ? "opacity-10" : "group-hover:opacity-5"
                    )} />
                    
                    {/* Selected indicator */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute top-2 right-2"
                        >
                          <CheckCircle className="w-5 h-5 text-primary" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-2 mx-auto transition-all duration-300",
                      `bg-gradient-to-br ${catConfig.gradient}`,
                      isSelected ? "scale-110 shadow-lg" : "group-hover:scale-105"
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Label */}
                    <span className={cn(
                      "text-sm font-medium block text-center transition-colors",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {category.name}
                    </span>
                    
                    {/* Description preview */}
                    {category.description && (
                      <span className="text-[10px] text-muted-foreground block text-center mt-1 line-clamp-1">
                        {category.description}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Subcategory Selection - Animated Pills */}
        <AnimatePresence mode="wait">
          {selectedCategoryId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <Label className="text-base font-semibold mb-4 block flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">2</span>
                Choose Your Specialty
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className={cn("text-sm font-normal", config.color)}>{selectedCategory?.name}</span>
              </Label>
              
              {subcategoriesLoading ? (
                <div className="flex flex-wrap gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 w-32 rounded-full bg-muted animate-pulse" />
                  ))}
                </div>
              ) : subcategories && subcategories.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {subcategories.map((subcategory, index) => {
                    const isSelected = selectedSubcategoryId === subcategory.id;
                    
                    return (
                      <motion.button
                        key={subcategory.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedSubcategoryId(subcategory.id)}
                        className={cn(
                          "relative group px-5 py-3 rounded-2xl border-2 transition-all duration-300",
                          isSelected
                            ? `border-transparent bg-gradient-to-r ${config.gradient} shadow-lg`
                            : "border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                            >
                              <CheckCircle className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                          <span className={cn(
                            "text-sm font-medium",
                            isSelected ? "text-white" : "text-foreground"
                          )}>
                            {subcategory.name}
                          </span>
                        </div>
                        
                        {/* Floating badge for creator type */}
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full"
                          >
                            <div className="bg-background/90 backdrop-blur-sm text-[10px] px-2 py-0.5 rounded-full border border-border/50 text-muted-foreground whitespace-nowrap">
                              {subcategory.creator_type_display}
                            </div>
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No subcategories available for this category
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Creator Type Display - Fancy Card */}
        <AnimatePresence mode="wait">
          {selectedSubcategory && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="mb-8"
            >
              <Card className={cn(
                "relative overflow-hidden border-0",
                `bg-gradient-to-r ${config.gradient}`
              )}>
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_50%)]" />
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
                </div>
                
                <CardContent className="relative p-6">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Sparkles className="w-7 h-7 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-white/70 text-sm mb-1">You're creating as</p>
                      <h3 className="text-xl font-bold text-white">
                        {selectedSubcategory.creator_type_display}
                      </h3>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                    >
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>



        {/* Media Type Selection */}
        <div className="mb-6">
          <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">3</span>
            Media Type
          </Label>
          <div className="flex flex-wrap gap-2">
            {mediaTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedMediaType(type.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                  selectedMediaType === type.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                )}
              >
                <type.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Media Upload */}
        <div className="mb-6">
          <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">3</span>
            Upload {mediaTypes.find(t => t.id === selectedMediaType)?.label}
          </Label>
          
          <MediaUploader
            mediaType={selectedMediaType}
            onUpload={handleMediaUpload}
            onRemove={handleMediaRemove}
            maxSize={50 * 1024 * 1024} // 50MB
            className="w-full"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <Label htmlFor="content" className="text-base font-semibold mb-3 block flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">4</span>
            Description
          </Label>
          <Textarea
            id="content"
            placeholder="Tell us about your creative work..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] bg-card"
          />
        </div>

        {/* Tags */}
        <div className="mb-6">
          <Label className="text-base font-semibold mb-3 block">Tags</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                #{tag}
                <button onClick={() => handleRemoveTag(tag)}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <Input
            placeholder="Add tags (press Enter)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="bg-card"
          />
        </div>

        {/* Tokenization */}
        <Card variant="gradient" className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Tokenize Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn tokens when users engage
                  </p>
                </div>
              </div>
              <Button
                variant={isTokenized ? "default" : "outline"}
                onClick={() => setIsTokenized(!isTokenized)}
              >
                {isTokenized ? "Enabled" : "Enable"}
              </Button>
            </div>

            <AnimatePresence>
              {isTokenized && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-4 border-t border-border"
                >
                  <div>
                    <Label className="text-sm mb-2 block">Token Reward Pool</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        value={tokenReward}
                        onChange={(e) => setTokenReward(Number(e.target.value))}
                        className="w-32 bg-background"
                      />
                      <span className="text-muted-foreground">tokens for reviewers</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm">
                      Early reviewers earn more tokens!
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Validation Messages */}
        {(!selectedCategoryId || !selectedSubcategoryId) && (
          <Card className="mb-6 border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <p className="text-sm text-yellow-500">
                  {!selectedCategoryId 
                    ? "Please select a category to continue" 
                    : "Please select a subcategory to continue"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => handleSubmit(true)}
            disabled={createPost.isPending}
          >
            {createPost.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Save Draft
          </Button>
          <Button 
            variant="glow" 
            className="flex-1" 
            onClick={() => handleSubmit(false)}
            disabled={createPost.isPending || !selectedCategoryId || !selectedSubcategoryId}
          >
            {createPost.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Publish Post
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
