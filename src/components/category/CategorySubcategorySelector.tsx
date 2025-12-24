import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCategories, useSubcategories, type Category, type Subcategory } from "@/hooks/useCategories";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface CategorySubcategorySelectorProps {
  selectedSubcategories: string[];
  primarySubcategoryId?: string;
  onSelectionChange: (subcategoryIds: string[], primaryId?: string) => void;
  maxSelections?: number;
  className?: string;
}

export function CategorySubcategorySelector({
  selectedSubcategories,
  primarySubcategoryId,
  onSelectionChange,
  maxSelections = 3,
  className,
}: CategorySubcategorySelectorProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [subcategoryOpen, setSubcategoryOpen] = useState(false);
  
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: subcategories, isLoading: subcategoriesLoading } = useSubcategories(selectedCategoryId);

  const selectedCategory = categories?.find(c => c.id === selectedCategoryId);
  
  // Get selected subcategory details
  const { data: allSubcategories } = useSubcategories();
  const selectedSubcategoryDetails = allSubcategories?.filter(
    sub => selectedSubcategories.includes(sub.id)
  ) || [];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setCategoryOpen(false);
    setSubcategoryOpen(true);
  };

  const handleSubcategoryToggle = (subcategoryId: string) => {
    const isSelected = selectedSubcategories.includes(subcategoryId);
    
    if (isSelected) {
      // Remove subcategory
      const newSelection = selectedSubcategories.filter(id => id !== subcategoryId);
      const newPrimary = primarySubcategoryId === subcategoryId 
        ? newSelection[0] 
        : primarySubcategoryId;
      onSelectionChange(newSelection, newPrimary);
    } else {
      // Add subcategory if under max
      if (selectedSubcategories.length < maxSelections) {
        const newSelection = [...selectedSubcategories, subcategoryId];
        const newPrimary = primarySubcategoryId || subcategoryId;
        onSelectionChange(newSelection, newPrimary);
      }
    }
  };

  const handleSetPrimary = (subcategoryId: string) => {
    onSelectionChange(selectedSubcategories, subcategoryId);
  };

  const handleRemoveSubcategory = (subcategoryId: string) => {
    const newSelection = selectedSubcategories.filter(id => id !== subcategoryId);
    const newPrimary = primarySubcategoryId === subcategoryId 
      ? newSelection[0] 
      : primarySubcategoryId;
    onSelectionChange(newSelection, newPrimary);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Selector */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={categoryOpen}
                className="w-full justify-between"
              >
                {selectedCategory ? (
                  <span className="flex items-center gap-2">
                    <span>{selectedCategory.icon}</span>
                    {selectedCategory.name}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Select category...</span>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-popover border border-border z-50" align="start">
              <ScrollArea className="h-[240px]">
                <div className="p-2 space-y-1">
                  {categoriesLoading ? (
                    <div className="p-4 text-center text-muted-foreground">Loading...</div>
                  ) : (
                    categories?.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                          "hover:bg-accent/50",
                          selectedCategoryId === category.id && "bg-primary/10"
                        )}
                      >
                        <span className="text-xl">{category.icon}</span>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{category.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {category.description}
                          </p>
                        </div>
                        {selectedCategoryId === category.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>

        {/* Subcategory Selector */}
        <div className="space-y-2">
          <Label>Subcategory</Label>
          <Popover open={subcategoryOpen} onOpenChange={setSubcategoryOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={subcategoryOpen}
                className="w-full justify-between"
                disabled={!selectedCategoryId}
              >
                <span className="text-muted-foreground">
                  {selectedSubcategories.length > 0 
                    ? `${selectedSubcategories.length} selected`
                    : "Select subcategory..."}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-popover border border-border z-50" align="start">
              <ScrollArea className="h-[280px]">
                <div className="p-2 space-y-1">
                  {subcategoriesLoading ? (
                    <div className="p-4 text-center text-muted-foreground">Loading...</div>
                  ) : subcategories?.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No subcategories available
                    </div>
                  ) : (
                    subcategories?.map((subcategory) => {
                      const isSelected = selectedSubcategories.includes(subcategory.id);
                      const isDisabled = !isSelected && selectedSubcategories.length >= maxSelections;
                      
                      return (
                        <button
                          key={subcategory.id}
                          onClick={() => !isDisabled && handleSubcategoryToggle(subcategory.id)}
                          disabled={isDisabled}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                            "hover:bg-accent/50",
                            isSelected && "bg-primary/10",
                            isDisabled && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center",
                            isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                          )}>
                            {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-sm">{subcategory.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {subcategory.creator_type_display}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
              {selectedSubcategories.length >= maxSelections && (
                <div className="p-2 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    Maximum {maxSelections} selections reached
                  </p>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Selected Subcategories Display */}
      <AnimatePresence>
        {selectedSubcategoryDetails.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <Label className="text-xs text-muted-foreground">
              Selected Creator Types (click to set primary)
            </Label>
            <div className="flex flex-wrap gap-2">
              {selectedSubcategoryDetails.map((sub) => (
                <motion.div
                  key={sub.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <Badge
                    variant={primarySubcategoryId === sub.id ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer pl-2 pr-1 py-1 gap-1",
                      primarySubcategoryId === sub.id && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => handleSetPrimary(sub.id)}
                  >
                    {primarySubcategoryId === sub.id && (
                      <Sparkles className="w-3 h-3 mr-1" />
                    )}
                    {sub.creator_type_display}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSubcategory(sub.id);
                      }}
                      className="ml-1 p-0.5 rounded-full hover:bg-destructive/20"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creator Type Preview */}
      {primarySubcategoryId && selectedSubcategoryDetails.length > 0 && (
        <div className="p-3 rounded-lg bg-gradient-card border border-border/50">
          <Label className="text-xs text-muted-foreground">Your Primary Creator Type</Label>
          <p className="text-lg font-semibold mt-1 bg-gradient-primary bg-clip-text text-transparent">
            {selectedSubcategoryDetails.find(s => s.id === primarySubcategoryId)?.creator_type_display}
          </p>
        </div>
      )}
    </div>
  );
}
