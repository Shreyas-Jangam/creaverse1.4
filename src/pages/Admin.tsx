import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Pencil, Trash2, FolderTree, Layers, ChevronRight } from "lucide-react";
import { useCategories, useAllSubcategories, type Category, type Subcategory } from "@/hooks/useCategories";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export default function Admin() {
  const queryClient = useQueryClient();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: subcategories, isLoading: subcategoriesLoading } = useAllSubcategories();
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<(Subcategory & { category?: Category }) | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    icon: "",
    description: "",
    color: "",
    gradient: "",
    display_order: 0,
    is_active: true,
  });

  // Subcategory form state
  const [subcategoryForm, setSubcategoryForm] = useState({
    category_id: "",
    name: "",
    creator_type_display: "",
    description: "",
    icon: "",
    display_order: 0,
    is_active: true,
  });

  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      icon: "",
      description: "",
      color: "",
      gradient: "",
      display_order: 0,
      is_active: true,
    });
    setEditingCategory(null);
  };

  const resetSubcategoryForm = () => {
    setSubcategoryForm({
      category_id: "",
      name: "",
      creator_type_display: "",
      description: "",
      icon: "",
      display_order: 0,
      is_active: true,
    });
    setEditingSubcategory(null);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      icon: category.icon || "",
      description: category.description || "",
      color: category.color || "",
      gradient: category.gradient || "",
      display_order: category.display_order,
      is_active: category.is_active,
    });
    setCategoryDialogOpen(true);
  };

  const handleEditSubcategory = (subcategory: Subcategory & { category?: Category }) => {
    setEditingSubcategory(subcategory);
    setSubcategoryForm({
      category_id: subcategory.category_id,
      name: subcategory.name,
      creator_type_display: subcategory.creator_type_display,
      description: subcategory.description || "",
      icon: subcategory.icon || "",
      display_order: subcategory.display_order,
      is_active: subcategory.is_active,
    });
    setSubcategoryDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update(categoryForm)
          .eq("id", editingCategory.id);
        if (error) throw error;
        toast.success("Category updated successfully");
      } else {
        const { error } = await supabase
          .from("categories")
          .insert([categoryForm]);
        if (error) throw error;
        toast.success("Category created successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCategoryDialogOpen(false);
      resetCategoryForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to save category");
    }
  };

  const handleSaveSubcategory = async () => {
    try {
      if (editingSubcategory) {
        const { error } = await supabase
          .from("subcategories")
          .update(subcategoryForm)
          .eq("id", editingSubcategory.id);
        if (error) throw error;
        toast.success("Subcategory updated successfully");
      } else {
        const { error } = await supabase
          .from("subcategories")
          .insert([subcategoryForm]);
        if (error) throw error;
        toast.success("Subcategory created successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["subcategories-all"] });
      setSubcategoryDialogOpen(false);
      resetSubcategoryForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to save subcategory");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure? This will also delete all subcategories.")) return;
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;
    try {
      const { error } = await supabase.from("subcategories").delete().eq("id", id);
      if (error) throw error;
      toast.success("Subcategory deleted");
      queryClient.invalidateQueries({ queryKey: ["subcategories-all"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete subcategory");
    }
  };

  // Group subcategories by category
  const subcategoriesByCategory = subcategories?.reduce((acc, sub) => {
    const catId = sub.category_id;
    if (!acc[catId]) acc[catId] = [];
    acc[catId].push(sub);
    return acc;
  }, {} as Record<string, (Subcategory & { category: Category })[]>) || {};

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage categories and subcategories</p>
        </div>

        <Tabs defaultValue="categories">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="categories" className="gap-2">
              <FolderTree className="w-4 h-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="subcategories" className="gap-2">
              <Layers className="w-4 h-4" />
              Subcategories
            </TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={categoryDialogOpen} onOpenChange={(open) => {
                setCategoryDialogOpen(open);
                if (!open) resetCategoryForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
                    <DialogDescription>
                      {editingCategory ? "Update category details" : "Create a new content category"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                          placeholder="e.g., Cinema"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Icon (emoji)</Label>
                        <Input
                          value={categoryForm.icon}
                          onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                          placeholder="e.g., 🎬"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        placeholder="Brief description..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Color (HSL)</Label>
                        <Input
                          value={categoryForm.color}
                          onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                          placeholder="e.g., hsl(260, 60%, 50%)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Gradient</Label>
                        <Input
                          value={categoryForm.gradient}
                          onChange={(e) => setCategoryForm({ ...categoryForm, gradient: e.target.value })}
                          placeholder="e.g., from-violet-500 to-purple-600"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Display Order</Label>
                        <Input
                          type="number"
                          value={categoryForm.display_order}
                          onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <Switch
                          checked={categoryForm.is_active}
                          onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, is_active: checked })}
                        />
                        <Label>Active</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveCategory}>
                      {editingCategory ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoriesLoading ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">Loading...</div>
              ) : (
                categories?.map((category) => (
                  <Card key={category.id} className="relative overflow-hidden">
                    <div className={cn(
                      "absolute inset-0 opacity-10 bg-gradient-to-br",
                      category.gradient || "from-primary to-secondary"
                    )} />
                    <CardHeader className="relative pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{category.icon}</span>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative">
                      <CardDescription className="line-clamp-2 mb-3">
                        {category.description}
                      </CardDescription>
                      <div className="flex items-center gap-2">
                        <Badge variant={category.is_active ? "default" : "secondary"}>
                          {category.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Order: {category.display_order}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Subcategories Tab */}
          <TabsContent value="subcategories" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={subcategoryDialogOpen} onOpenChange={(open) => {
                setSubcategoryDialogOpen(open);
                if (!open) resetSubcategoryForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Subcategory
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingSubcategory ? "Edit Subcategory" : "Add Subcategory"}</DialogTitle>
                    <DialogDescription>
                      {editingSubcategory ? "Update subcategory details" : "Create a new subcategory"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={subcategoryForm.category_id}
                        onValueChange={(value) => setSubcategoryForm({ ...subcategoryForm, category_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.icon} {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Subcategory Name</Label>
                      <Input
                        value={subcategoryForm.name}
                        onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                        placeholder="e.g., Short Films"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Creator Type Display</Label>
                      <Input
                        value={subcategoryForm.creator_type_display}
                        onChange={(e) => setSubcategoryForm({ ...subcategoryForm, creator_type_display: e.target.value })}
                        placeholder="e.g., Cinema Creator – Short Films"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description (optional)</Label>
                      <Textarea
                        value={subcategoryForm.description}
                        onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                        placeholder="Brief description..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Display Order</Label>
                        <Input
                          type="number"
                          value={subcategoryForm.display_order}
                          onChange={(e) => setSubcategoryForm({ ...subcategoryForm, display_order: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <Switch
                          checked={subcategoryForm.is_active}
                          onCheckedChange={(checked) => setSubcategoryForm({ ...subcategoryForm, is_active: checked })}
                        />
                        <Label>Active</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSubcategoryDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveSubcategory}>
                      {editingSubcategory ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <ScrollArea className="h-[600px]">
              <div className="space-y-6">
                {categoriesLoading || subcategoriesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : (
                  categories?.map((category) => (
                    <Card key={category.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{category.icon}</span>
                          <CardTitle className="text-base">{category.name}</CardTitle>
                          <Badge variant="outline" className="ml-2">
                            {subcategoriesByCategory[category.id]?.length || 0} subcategories
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {subcategoriesByCategory[category.id]?.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium text-sm">{sub.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {sub.creator_type_display}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={sub.is_active ? "default" : "secondary"} className="text-xs">
                                  {sub.is_active ? "Active" : "Inactive"}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleEditSubcategory(sub)}
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleDeleteSubcategory(sub.id)}
                                >
                                  <Trash2 className="w-3 h-3 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {(!subcategoriesByCategory[category.id] || subcategoriesByCategory[category.id].length === 0) && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No subcategories yet
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
