import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreatorTypeBadgeProps {
  creatorTypeDisplay: string;
  categoryName?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function CreatorTypeBadge({
  creatorTypeDisplay,
  categoryName,
  variant = "default",
  size = "md",
  showIcon = true,
  className,
}: CreatorTypeBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const iconSizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  // Determine gradient based on category
  const getCategoryGradient = (category?: string) => {
    const gradients: Record<string, string> = {
      cinema: "from-violet-500/20 to-purple-600/20 border-violet-500/30",
      art: "from-pink-500/20 to-rose-600/20 border-pink-500/30",
      tech: "from-emerald-500/20 to-green-600/20 border-emerald-500/30",
      books: "from-amber-500/20 to-orange-600/20 border-amber-500/30",
      nature: "from-teal-500/20 to-emerald-600/20 border-teal-500/30",
      music: "from-purple-500/20 to-fuchsia-600/20 border-purple-500/30",
    };
    return gradients[category?.toLowerCase() || ""] || "from-primary/20 to-secondary/20 border-primary/30";
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        "bg-gradient-to-r font-medium",
        getCategoryGradient(categoryName),
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Sparkles className={cn(iconSizes[size], "mr-1")} />}
      {creatorTypeDisplay}
    </Badge>
  );
}
