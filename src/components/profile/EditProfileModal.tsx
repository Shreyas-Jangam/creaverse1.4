import { useState, useEffect, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, CheckCircle, XCircle } from "lucide-react";
import { CategorySubcategorySelector } from "@/components/category/CategorySubcategorySelector";
import { User } from "@/types";
import { toast } from "sonner";
import { z } from "zod";
import { useUpdateProfile, useCheckUsername, profileFormSchema } from "@/hooks/useProfile";
import { useUpdateUserSubcategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSave?: (data: ProfileFormData) => void;
}

export interface ProfileFormData {
  displayName: string;
  username: string;
  bio: string;
  avatar?: string;
  subcategoryIds: string[];
  primarySubcategoryId?: string;
}

interface FormErrors {
  displayName?: string;
  username?: string;
  bio?: string;
}

export const EditProfileModal = forwardRef<HTMLDivElement, EditProfileModalProps>(
  ({ open, onOpenChange, user, onSave }, ref) => {
    const [formData, setFormData] = useState<ProfileFormData>({
      displayName: user.displayName,
      username: user.username,
      bio: user.bio || "",
      avatar: user.avatar,
      subcategoryIds: [],
      primarySubcategoryId: undefined,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);

    const updateProfile = useUpdateProfile();
    const updateSubcategories = useUpdateUserSubcategories();
    const checkUsername = useCheckUsername();

    // Reset form when modal opens
    useEffect(() => {
      if (open) {
        setFormData({
          displayName: user.displayName,
          username: user.username,
          bio: user.bio || "",
          avatar: user.avatar,
          subcategoryIds: [],
          primarySubcategoryId: undefined,
        });
        setErrors({});
        setIsUsernameAvailable(null);
      }
    }, [open, user]);

    // Debounced username check
    useEffect(() => {
      if (formData.username === user.username) {
        setIsUsernameAvailable(null);
        return;
      }

      const timeoutId = setTimeout(async () => {
        if (formData.username.length >= 3) {
          setIsCheckingUsername(true);
          try {
            const available = await checkUsername.mutateAsync({
              username: formData.username.toLowerCase(),
              currentUserId: user.id,
            });
            setIsUsernameAvailable(available);
          } catch (error) {
            setIsUsernameAvailable(null);
          } finally {
            setIsCheckingUsername(false);
          }
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }, [formData.username, user.username, user.id]);

    const validateField = (field: keyof ProfileFormData, value: string): string | undefined => {
      try {
        if (field === "displayName") {
          profileFormSchema.shape.display_name.parse(value);
        } else if (field === "username") {
          profileFormSchema.shape.username.parse(value.toLowerCase());
        } else if (field === "bio") {
          profileFormSchema.shape.bio.parse(value);
        }
        return undefined;
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.errors[0]?.message;
        }
        return "Invalid input";
      }
    };

    const handleFieldChange = (field: keyof ProfileFormData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      
      // Clear error when user starts typing
      if (errors[field as keyof FormErrors]) {
        const error = validateField(field, value);
        setErrors(prev => ({ ...prev, [field]: error }));
      }
    };

    const handleFieldBlur = (field: keyof ProfileFormData) => {
      const value = formData[field];
      if (typeof value === 'string') {
        const error = validateField(field, value);
        setErrors(prev => ({ ...prev, [field]: error }));
      }
    };

    const handleSubcategoryChange = (subcategoryIds: string[], primaryId?: string) => {
      setFormData(prev => ({
        ...prev,
        subcategoryIds,
        primarySubcategoryId: primaryId,
      }));
    };

    const handleSave = async () => {
      // Validate all fields
      const newErrors: FormErrors = {
        displayName: validateField("displayName", formData.displayName),
        username: validateField("username", formData.username),
        bio: validateField("bio", formData.bio),
      };

      setErrors(newErrors);

      // Check for any errors
      if (Object.values(newErrors).some(error => error)) {
        toast.error("Please fix the errors before saving");
        return;
      }

      // Check username availability
      if (formData.username !== user.username && isUsernameAvailable === false) {
        toast.error("Username is already taken");
        return;
      }

      try {
        // Update profile in database
        await updateProfile.mutateAsync({
          userId: user.id,
          data: {
            display_name: formData.displayName.trim(),
            username: formData.username.toLowerCase().trim(),
            bio: formData.bio.trim() || null,
            avatar_url: formData.avatar,
          },
        });

        // Update user subcategories if changed
        if (formData.subcategoryIds.length > 0) {
          await updateSubcategories.mutateAsync({
            userId: user.id,
            subcategoryIds: formData.subcategoryIds,
            primarySubcategoryId: formData.primarySubcategoryId,
          });
        }

        onSave?.(formData);
        onOpenChange(false);
        toast.success("Profile updated successfully!");
      } catch (error: any) {
        console.error("Profile update error:", error);
        toast.error(error.message || "Failed to update profile");
      }
    };

    const isLoading = updateProfile.isPending || updateSubcategories.isPending;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent ref={ref} className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information and creator type
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Avatar */}
            <div className="flex justify-center">
              <div className="relative group">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={formData.avatar} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-white">
                    {formData.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <button 
                  type="button"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => toast.info("Avatar upload coming soon!")}
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => handleFieldChange("displayName", e.target.value)}
                  onBlur={() => handleFieldBlur("displayName")}
                  placeholder="Your display name"
                  className={cn(errors.displayName && "border-destructive")}
                  maxLength={50}
                />
                {errors.displayName && (
                  <p className="text-xs text-destructive">{errors.displayName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                      @
                    </span>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleFieldChange("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                      onBlur={() => handleFieldBlur("username")}
                      className={cn(
                        "rounded-l-none pr-10",
                        errors.username && "border-destructive"
                      )}
                      placeholder="username"
                      maxLength={30}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isCheckingUsername && (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      )}
                      {!isCheckingUsername && isUsernameAvailable === true && (
                        <CheckCircle className="w-4 h-4 text-success" />
                      )}
                      {!isCheckingUsername && isUsernameAvailable === false && (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                  </div>
                </div>
                {errors.username && (
                  <p className="text-xs text-destructive">{errors.username}</p>
                )}
                {!errors.username && isUsernameAvailable === false && (
                  <p className="text-xs text-destructive">Username is already taken</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleFieldChange("bio", e.target.value)}
                  onBlur={() => handleFieldBlur("bio")}
                  placeholder="Tell people about yourself..."
                  rows={3}
                  className={cn(errors.bio && "border-destructive")}
                  maxLength={500}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  {errors.bio ? (
                    <span className="text-destructive">{errors.bio}</span>
                  ) : (
                    <span />
                  )}
                  <span>{formData.bio.length}/500</span>
                </div>
              </div>
            </div>

            {/* Category & Subcategory Selection */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Creator Type</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Select your category and specialization (up to 3)
              </p>
              <CategorySubcategorySelector
                selectedSubcategories={formData.subcategoryIds}
                primarySubcategoryId={formData.primarySubcategoryId}
                onSelectionChange={handleSubcategoryChange}
                maxSelections={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

EditProfileModal.displayName = "EditProfileModal";