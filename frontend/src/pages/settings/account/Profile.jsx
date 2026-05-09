import React, { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/stores/userStore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  User,
  Camera,
  Trash2,
  Save,
  X,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import AccountInfo from './AccountInfo';
import PhoneComponent from './PhoneComponent';

const Profile = () => {
  const {
    userProfile,
    isLoading,
    isUpdating,
    getUserProfile,
    updateUserProfile,
    updateUserAvatar,
    deleteUserAvatar
  } = useUserStore();

  const [name, setName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getUserProfile();
  }, []);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
    }
  }, [userProfile]);

  const handleNameUpdate = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    if (name.trim() === userProfile?.name) {
      setIsEditing(false);
      return;
    }

    try {
      await updateUserProfile({ name: name.trim() });
      setIsEditing(false);
      toast.success('Name updated successfully', {
        icon: <Save className="h-4 w-4 text-primary" />,
        duration: 2000
      });
    } catch (error) {
      setName(userProfile?.name || '');
      toast.error(error.message || 'Failed to update name');
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewAvatar(reader.result);
    };
    reader.readAsDataURL(file);

    setIsAvatarUploading(true);

    try {
      await updateUserAvatar(file);
      setPreviewAvatar(null);
      toast.success('Avatar updated successfully', {
        icon: <Camera className="h-4 w-4 text-primary" />,
        duration: 2000
      });
    } catch (error) {
      setPreviewAvatar(null);
      toast.error(error.message || 'Failed to update avatar');
    } finally {
      setIsAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAvatarRemove = async () => {
    if (!userProfile?.avatar?.url) {
      toast.error('No avatar to remove');
      return;
    }

    try {
      await deleteUserAvatar();
      toast.success('Avatar removed successfully', {
        icon: <Trash2 className="h-4 w-4 text-success" />,
        duration: 2000
      });
    } catch (error) {
      toast.error(error.message || 'Failed to remove avatar');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const cancelEdit = () => {
    setName(userProfile?.name || '');
    setIsEditing(false);
  };

  const cancelAvatarPreview = () => {
    setPreviewAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-5 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {/* Header - Compact on mobile */}
      <div className="space-y-0.5 sm:space-y-1">
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
          Profile
        </h1>
        <p className="text-xs sm:text-base text-muted-foreground">
          Manage your personal information and profile picture.
        </p>
      </div>

      {/* Profile Information Card */}
      <Card className="border-border/50 bg-card/70 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.03)] overflow-hidden rounded-xl sm:rounded-2xl">
        <CardHeader className="pb-3 sm:pb-4 pt-4 sm:pt-6 px-4 sm:px-6 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-primary/10 border border-primary/20">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-lg font-semibold">
                Personal Information
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-0.5 sm:mt-1">
                Update your name and profile picture.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Avatar Section - Compact on mobile */}
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 sm:gap-6">
            {/* Avatar Preview */}
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <div className="relative">
                <Avatar className="h-20 w-20 sm:h-28 sm:w-28 ring-2 ring-border/50">
                  {previewAvatar ? (
                    <img
                      src={previewAvatar}
                      alt="Avatar preview"
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <>
                      {userProfile?.avatar?.url ? (
                        <AvatarImage
                          src={userProfile.avatar.url}
                          alt={userProfile.name}
                        />
                      ) : null}
                      <AvatarFallback className="text-xl sm:text-2xl bg-primary/10 text-primary">
                        {getInitials(userProfile?.name)}
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>

                {isAvatarUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-white" />
                  </div>
                )}

                {previewAvatar && !isAvatarUploading && (
                  <button
                    onClick={cancelAvatarPreview}
                    className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 p-0.5 sm:p-1 bg-destructive rounded-full text-white hover:bg-destructive/90 transition-colors"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                )}
              </div>

              {/* Avatar Actions - Compact on mobile */}
              <div className="flex gap-1.5 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAvatarUploading}
                  className="gap-1 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm"
                >
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                  {isAvatarUploading ? 'Uploading...' : 'Upload'}
                </Button>

                {userProfile?.avatar?.url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAvatarRemove}
                    disabled={isAvatarUploading}
                    className="gap-1 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Remove</span>
                  </Button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />

              <p className="text-[10px] sm:text-xs text-muted-foreground text-center hidden sm:block">
                Max file size: 5MB<br />
                Formats: JPEG, PNG, GIF, WEBP
              </p>
            </div>

            <Separator orientation="vertical" className="hidden sm:block h-28" />
            <Separator className="sm:hidden" />

            {/* Name Section - Compact on mobile */}
            <div className="flex-1 space-y-3 sm:space-y-4 w-full">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userProfile?.email || ''}
                  disabled
                  className="bg-muted/50 cursor-not-allowed h-9 sm:h-10 text-sm"
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Email address cannot be changed
                </p>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="name" className="text-xs sm:text-sm font-medium">
                  Full Name
                </Label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="flex-1 h-9 sm:h-10 text-sm"
                      autoFocus
                      disabled={isUpdating}
                    />
                    <Button
                      onClick={handleNameUpdate}
                      disabled={isUpdating}
                      size="sm"
                      className="gap-1 h-9 sm:h-10 px-3 sm:px-4"
                    >
                      {isUpdating ? (
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      ) : (
                        <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                      <span className="hidden sm:inline">Save</span>
                    </Button>
                    <Button
                      onClick={cancelEdit}
                      disabled={isUpdating}
                      variant="outline"
                      size="sm"
                      className="h-9 sm:h-10 px-3 sm:px-4"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-between gap-2 p-2 sm:p-3 bg-muted/30 rounded-lg border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setIsEditing(true)}
                  >
                    <span className="text-sm sm:text-base text-foreground truncate">
                      {userProfile?.name || 'Not set'}
                    </span>
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phone Component */}
      <PhoneComponent />

      {/* Account Information Component */}
      <AccountInfo />
    </div>
  );
};

export default Profile;