import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useUserStore } from '@/stores/userStore';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Camera,
  Trash2,
  Save,
  RotateCcw,
  Copy,
  Check,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import AccountInfo from './AccountInfo';
import PhoneComponent from './PhoneComponent';
import AvatarCropModal from './AvatarCropModal';

const Profile = () => {
  const {
    userProfile,
    isLoading,
    getUserProfile,
    updateUserProfile,
    updateUserAvatar,
    deleteUserAvatar
  } = useUserStore();

  const [name, setName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Crop states
  const [selectedImageSrc, setSelectedImageSrc] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState('image/jpeg');

  const fileInputRef = useRef(null);

  useEffect(() => {
    getUserProfile();
  }, [getUserProfile]);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
    }
  }, [userProfile]);

  const isDirty = useMemo(() => {
    return name.trim() !== (userProfile?.name || '').trim();
  }, [name, userProfile?.name]);

  const handleCopyId = async () => {
    if (!userProfile?._id) return;
    try {
      await navigator.clipboard.writeText(userProfile._id);
      setCopiedId(true);
      toast.success('User ID copied to clipboard');
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      toast.error('Failed to copy ID');
    }
  };

  const handleNameUpdate = async (e) => {
    e?.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    if (!isDirty) {
      toast.info('No changes to save');
      return;
    }

    setIsSavingName(true);
    try {
      await updateUserProfile({ name: name.trim() });
      toast.success('Changes saved successfully', {
        icon: <Save className="h-4 w-4 text-primary" />,
        duration: 2000
      });
    } catch (error) {
      setName(userProfile?.name || '');
      toast.error(error.message || 'Failed to update name');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleResetName = () => {
    setName(userProfile?.name || '');
  };

  // Direct upload handler for uncroppable media like animated GIFs
  const uploadDirectAvatar = async (file) => {
    setIsAvatarUploading(true);
    try {
      await updateUserAvatar(file);
      await getUserProfile();
      toast.success('Avatar updated successfully', {
        icon: <Camera className="h-4 w-4 text-primary" />,
        duration: 2000
      });
    } catch (error) {
      toast.error(error.message || 'Failed to update avatar');
    } finally {
      setIsAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // File selection routing & size validations
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WEBP)');
      return;
    }

    if (file.type === 'image/gif') {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('GIF size should be less than 2MB');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      uploadDirectAvatar(file);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSelectedFileType(file.type);

    if (selectedImageSrc) {
      URL.revokeObjectURL(selectedImageSrc);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedImageSrc(objectUrl);
    setIsCropModalOpen(true);
    event.target.value = '';
  };

  const handleCropAndUpload = async (croppedFile) => {
    setIsAvatarUploading(true);
    try {
      await updateUserAvatar(croppedFile);
      cleanupCropState();
      await getUserProfile();
      toast.success('Avatar updated successfully', {
        icon: <Camera className="h-4 w-4 text-primary" />,
        duration: 2000
      });
    } catch (error) {
      toast.error(error.message || 'Failed to update avatar');
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const cleanupCropState = () => {
    if (selectedImageSrc) {
      URL.revokeObjectURL(selectedImageSrc);
    }
    setSelectedImageSrc(null);
    setIsCropModalOpen(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAvatarRemove = async () => {
    if (!userProfile?.avatar?.url) {
      toast.error('No avatar to remove');
      return;
    }

    setIsRemovingAvatar(true);
    try {
      await deleteUserAvatar();
      setPreviewAvatar(null);
      await getUserProfile();
      toast.success('Avatar removed successfully', {
        icon: <Trash2 className="h-4 w-4 text-primary" />,
        duration: 2000
      });
    } catch (error) {
      toast.error(error.message || 'Failed to remove avatar');
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  const initials =
    userProfile?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  if (isLoading && !userProfile) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center font-semibold text-xs uppercase tracking-widest text-subtle-foreground/60 animate-pulse">
        Synchronizing Profile...
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 bg-background text-foreground">
      {/* Page Title Header */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Profile
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage your personal identity, contact credentials, and account settings.
        </p>
      </div>

      <Separator className="bg-border-subtle" />

      {/* Section 1: Avatar */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Avatar</h3>
          <p className="text-xs text-muted-foreground">
            This avatar is displayed on your profile and across your team workspaces.
          </p>
        </div>

        <Separator className="bg-border-subtle" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-1">
          <Avatar className="h-20 w-20 ring-1 ring-border/80 shadow-xs bg-background shrink-0">
            {previewAvatar ? (
              <img
                src={previewAvatar}
                alt="Avatar preview"
                className="h-full w-full object-cover rounded-full"
              />
            ) : userProfile?.avatar?.url ? (
              <AvatarImage
                src={userProfile.avatar.url}
                alt={userProfile.name}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="bg-muted text-lg font-bold text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAvatarUploading}
                className="h-8 px-3 text-xs font-medium rounded-lg cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5 mr-1.5 text-primary" />
                <span>{isAvatarUploading ? 'Uploading...' : 'Change avatar'}</span>
              </Button>

              {userProfile?.avatar?.url && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAvatarRemove}
                  disabled={isAvatarUploading || isRemovingAvatar}
                  className="h-8 px-3 text-xs font-medium rounded-lg text-subtle-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  {isRemovingAvatar ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  <span>Remove</span>
                </Button>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground">
              JPG, PNG, GIF or WebP. Maximum file size 5MB.
            </p>
          </div>
        </div>
      </div>

      <Separator className="bg-border-subtle" />

      {/* Section 2: Personal Information */}
      <form onSubmit={handleNameUpdate} className="space-y-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Personal Information</h3>
          <p className="text-xs text-muted-foreground">
            Update your public display identity and email credentials.
          </p>
        </div>

        <Separator className="bg-border-subtle" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl pt-1">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs font-medium text-foreground">
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={50}
              className="h-9 text-xs sm:text-sm rounded-lg"
              disabled={isSavingName}
            />
            <p className="text-[11px] text-muted-foreground">
              Your name as visible across all your team workspaces.
            </p>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <Label htmlFor="accountEmail" className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <span>Email Address</span>
              <Lock className="h-3 w-3 text-muted-foreground opacity-70" />
            </Label>
            <Input
              id="accountEmail"
              type="email"
              value={userProfile?.email || ''}
              disabled
              className="h-9 text-xs sm:text-sm bg-muted/40 text-muted-foreground cursor-not-allowed rounded-lg"
            />
            <p className="text-[11px] text-muted-foreground">
              Email cannot be changed.
            </p>
          </div>
        </div>

        {/* User ID inline info */}
        {userProfile?._id && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <span>User ID:</span>
            <code className="px-2 py-0.5 rounded bg-muted/50 font-mono text-[11px] text-foreground border border-border-subtle">
              {userProfile._id}
            </code>
            <button
              type="button"
              onClick={handleCopyId}
              aria-label="Copy User ID"
              className="text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer rounded"
              title="Copy User ID"
            >
              {copiedId ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="submit"
            disabled={isSavingName || !isDirty}
            size="sm"
            className="h-9 px-4 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer disabled:opacity-50"
          >
            {isSavingName ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Saving...
              </>
            ) : (
              <>
                Save
              </>
            )}
          </Button>

          {isDirty && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetName}
              disabled={isSavingName}
              className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Discard
            </Button>
          )}
        </div>
      </form>

      <Separator className="bg-border-subtle" />

      {/* Section 3: Phone & SMS Security */}
      <PhoneComponent />

      <Separator className="bg-border-subtle" />

      {/* Section 4: Account Metadata & Preferences */}
      <AccountInfo />

      {/* Hidden File Input for Avatar */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Avatar Crop Modal */}
      <AvatarCropModal
        imageSrc={selectedImageSrc}
        isOpen={isCropModalOpen}
        onClose={cleanupCropState}
        onCropComplete={handleCropAndUpload}
        isUploading={isAvatarUploading}
        fileType={selectedFileType}
      />
    </div>
  );
};

export default Profile;