import { CategoryInfo } from "@/types";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowRight, Users, FileText } from "lucide-react";

interface CategoryCardProps {
  category: CategoryInfo;
  variant?: "default" | "compact" | "featured";
}

export function CategoryCard({ category, variant = "default" }: CategoryCardProps) {
  if (variant === "compact") {
    return (
      <Link 
        to={`/category/${category.id}`}
        className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
      >
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
          `bg-gradient-to-br ${category.gradient}`
        )}>
          {category.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">{category.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{category.creatorsCount} creators</p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link 
        to={`/category/${category.id}`}
        className="relative group overflow-hidden rounded-2xl aspect-[4/3]"
      >
        <img 
          src={category.coverImage} 
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">{category.icon}</span>
            <h3 className="text-2xl font-bold">{category.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {category.description}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <FileText className="w-4 h-4" />
              {category.postsCount.toLocaleString()} posts
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-4 h-4" />
              {category.creatorsCount.toLocaleString()} creators
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={`/category/${category.id}`}
      className="relative group overflow-hidden rounded-xl aspect-[3/2]"
    >
      <img 
        src={category.coverImage} 
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
      
      <div className="absolute inset-0 p-4 flex flex-col justify-end">
        <div className="flex items-center gap-2">
          <span className="text-xl">{category.icon}</span>
          <h3 className="font-bold">{category.name}</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {category.postsCount.toLocaleString()} posts
        </p>
      </div>
    </Link>
  );
}
