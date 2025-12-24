import { useState } from "react";
import { Plus, X, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface StoryHighlight {
  id: string;
  title: string;
  coverImage: string;
  items: {
    id: string;
    type: "image" | "video";
    url: string;
    duration?: number;
  }[];
}

interface StoryHighlightsProps {
  highlights: StoryHighlight[];
  isOwnProfile: boolean;
  onAddHighlight?: () => void;
}

// Mock highlights data
const mockHighlights: StoryHighlight[] = [
  {
    id: "1",
    title: "Art",
    coverImage: "https://images.unsplash.com/photo-1634017839464-5c339bbe3c35?w=200",
    items: [
      { id: "1-1", type: "image", url: "https://images.unsplash.com/photo-1634017839464-5c339bbe3c35?w=800" },
      { id: "1-2", type: "image", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800" },
    ]
  },
  {
    id: "2",
    title: "Travel",
    coverImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=200",
    items: [
      { id: "2-1", type: "image", url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800" },
    ]
  },
  {
    id: "3",
    title: "Studio",
    coverImage: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=200",
    items: [
      { id: "3-1", type: "image", url: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800" },
      { id: "3-2", type: "image", url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800" },
    ]
  },
  {
    id: "4",
    title: "NFTs",
    coverImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200",
    items: [
      { id: "4-1", type: "image", url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800" },
    ]
  },
  {
    id: "5",
    title: "BTS",
    coverImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200",
    items: [
      { id: "5-1", type: "image", url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800" },
    ]
  },
];

export function StoryHighlights({ highlights = mockHighlights, isOwnProfile, onAddHighlight }: StoryHighlightsProps) {
  const [selectedHighlight, setSelectedHighlight] = useState<StoryHighlight | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const openHighlight = (highlight: StoryHighlight) => {
    setSelectedHighlight(highlight);
    setCurrentItemIndex(0);
    setProgress(0);
  };

  const closeHighlight = () => {
    setSelectedHighlight(null);
    setCurrentItemIndex(0);
    setProgress(0);
  };

  const nextItem = () => {
    if (selectedHighlight && currentItemIndex < selectedHighlight.items.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
      setProgress(0);
    } else {
      closeHighlight();
    }
  };

  const prevItem = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  return (
    <>
      <div className="px-4 py-3">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {/* Add New Highlight (only for own profile) */}
          {isOwnProfile && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAddHighlight}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-card border-2 border-dashed border-primary/50 flex items-center justify-center hover:border-primary transition-colors">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">New</span>
            </motion.button>
          )}

          {/* Highlight Items */}
          {highlights.map((highlight, index) => (
            <motion.button
              key={highlight.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openHighlight(highlight)}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div className="relative">
                {/* Gradient Ring */}
                <div className="absolute -inset-0.5 rounded-full bg-gradient-primary opacity-80" />
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-background overflow-hidden">
                  <img 
                    src={highlight.coverImage} 
                    alt={highlight.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <span className="text-xs font-medium truncate max-w-[80px]">
                {highlight.title}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      <Dialog open={!!selectedHighlight} onOpenChange={() => closeHighlight()}>
        <DialogContent className="max-w-lg p-0 bg-background/95 backdrop-blur-xl border-none overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedHighlight && (
              <motion.div
                key={selectedHighlight.items[currentItemIndex]?.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="relative aspect-[9/16] max-h-[80vh] bg-card"
              >
                {/* Progress Bars */}
                <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
                  {selectedHighlight.items.map((_, idx) => (
                    <div 
                      key={idx}
                      className="flex-1 h-0.5 bg-foreground/30 rounded-full overflow-hidden"
                    >
                      <div 
                        className={cn(
                          "h-full bg-foreground rounded-full transition-all duration-300",
                          idx < currentItemIndex ? "w-full" : idx === currentItemIndex ? "w-1/2" : "w-0"
                        )}
                      />
                    </div>
                  ))}
                </div>

                {/* Header */}
                <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img 
                        src={selectedHighlight.coverImage} 
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-semibold text-white drop-shadow-lg">
                      {selectedHighlight.title}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon-sm"
                    onClick={closeHighlight}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Content */}
                <img 
                  src={selectedHighlight.items[currentItemIndex]?.url}
                  alt=""
                  className="w-full h-full object-cover"
                />

                {/* Navigation Areas */}
                <button 
                  onClick={prevItem}
                  className="absolute left-0 top-0 bottom-0 w-1/3 focus:outline-none"
                  aria-label="Previous"
                />
                <button 
                  onClick={nextItem}
                  className="absolute right-0 top-0 bottom-0 w-2/3 focus:outline-none"
                  aria-label="Next"
                />

                {/* Navigation Arrows (visible on hover) */}
                {currentItemIndex > 0 && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={prevItem}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                )}
                {currentItemIndex < selectedHighlight.items.length - 1 && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={nextItem}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
