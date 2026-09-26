import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Unlink,
  ExternalLink,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUserStore } from '@/stores/userStore';

const GoogleIcon = ({ className = 'size-4' }) => (
  <svg className={`shrink-0 ${className}`} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const LoginProviders = () => {
  const { userProfile, unlinkGoogle, unlinkLocal, isUpdating } = useUserStore();

  const [unlinkConfirmTarget, setUnlinkConfirmTarget] = useState(null); // 'local' | 'google' | null
  const [isProcessing, setIsProcessing] = useState(false);

  const localEnabled = Boolean(userProfile?.providers?.local?.enabled);
  const googleEnabled = Boolean(userProfile?.providers?.google?.enabled);
  const activeMethodsCount = (localEnabled ? 1 : 0) + (googleEnabled ? 1 : 0);
  const canUnlink = activeMethodsCount > 1;

  const handleConfirmUnlink = async () => {
    if (!unlinkConfirmTarget) return;

    setIsProcessing(true);
    try {
      if (unlinkConfirmTarget === 'local') {
        await unlinkLocal();
        toast.success('Password login removed successfully');
      } else if (unlinkConfirmTarget === 'google') {
        await unlinkGoogle();
        toast.success('Google account unlinked successfully');
      }
      setUnlinkConfirmTarget(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Failed to unlink provider');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold text-foreground">
            Authentication &amp; Login Methods
          </h3>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage how you sign in to your workspace. At least one login method must remain active.
        </p>
      </div>

      <Separator className="bg-border-subtle" />

      {/* Grid of Login Providers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-1">
        {/* 1. Email & Password Provider Card */}
        <div
          className={`flex flex-col justify-between rounded-xl sm:rounded-2xl border p-4 sm:p-5 transition-colors ${localEnabled
            ? 'border-border-subtle bg-surface-elevated'
            : 'border-dashed border-border bg-surface-sunken/40'
            }`}
        >
          <div className="space-y-3 sm:space-y-3.5">
            {/* Top row: Icon + Status badge */}
            <div className="flex items-center justify-between gap-3">
              <div
                className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl transition-colors ${localEnabled
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
                  }`}
              >
                <KeyRound className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>

              {localEnabled ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-success border border-success/20">
                  <CheckCircle2 className="h-3 w-3" /> Enabled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground border border-border-subtle">
                  Not Configured
                </span>
              )}
            </div>

            {/* Provider title and description */}
            <div>
              <h4 className="font-heading text-sm font-bold text-foreground">
                Email &amp; Password
              </h4>
              <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                {localEnabled
                  ? `Sign in with ${userProfile?.email || 'your email'} and password.`
                  : 'No password is set on this account. Set a password to log in without Google.'}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-3.5 sm:mt-5 pt-2.5 sm:pt-3 border-t border-border-subtle flex items-center gap-2">
            {localEnabled ? (
              <>
                <Button
                  asChild
                  className="w-full flex-1 h-10 rounded-xl bg-accent text-accent-foreground font-semibold shadow-md shadow-accent/20 hover:opacity-90 active:scale-95 transition-all cursor-pointer text-xs sm:text-sm"
                >
                  <Link to="/settings/account/change-password" className="flex items-center justify-center gap-1.5 w-full">
                    <span>Change Password</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                  </Link>
                </Button>

                {canUnlink ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isProcessing || isUpdating}
                    onClick={() => setUnlinkConfirmTarget('local')}
                    className="h-10 px-3 text-xs font-semibold rounded-xl bg-secondary/80 text-secondary-foreground border border-border-strong shadow-xs hover:text-destructive hover:border-destructive/50 hover:bg-destructive/15 active:scale-95 transition-all cursor-pointer"
                  >
                    <Unlink className="h-3.5 w-3.5 mr-1" />
                    <span>Remove</span>
                  </Button>
                ) : (
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0} className="inline-block cursor-not-allowed">
                          <Button
                            type="button"
                            variant="outline"
                            disabled
                            className="h-10 px-3 text-xs font-semibold rounded-xl bg-secondary/30 text-muted-foreground/50 border border-border-subtle opacity-60 shadow-none pointer-events-none"
                          >
                            <Unlink className="h-3.5 w-3.5 mr-1" />
                            <span>Remove</span>
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={4} className="text-xs max-w-xs text-center">
                        Cannot remove password when it is your only login method. Link Google first.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </>
            ) : (
              <Button
                asChild
                className="w-full h-10 rounded-xl bg-accent text-accent-foreground font-semibold shadow-md shadow-accent/20 hover:opacity-90 active:scale-95 transition-all cursor-pointer text-xs sm:text-sm"
              >
                <Link to="/settings/account/set-password" className="flex items-center justify-center gap-1.5 w-full">
                  <KeyRound className="h-4 w-4 mr-1.5" />
                  <span>Set Password</span>
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* 2. Google OAuth Provider Card */}
        <div
          className={`flex flex-col justify-between rounded-xl sm:rounded-2xl border p-4 sm:p-5 transition-colors ${googleEnabled
            ? 'border-border-subtle bg-surface-elevated'
            : 'border-dashed border-border bg-surface-sunken/40'
            }`}
        >
          <div className="space-y-3 sm:space-y-3.5">
            {/* Top row: Icon + Status badge */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-surface border border-border-subtle shadow-2xs">
                <GoogleIcon className="size-4.5 sm:size-5" />
              </div>

              {googleEnabled ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-success border border-success/20">
                  <CheckCircle2 className="h-3 w-3" /> Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground border border-border-subtle">
                  Not Connected
                </span>
              )}
            </div>

            {/* Provider title and description */}
            <div>
              <h4 className="font-heading text-sm font-bold text-foreground">
                Google Account
              </h4>
              <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                {googleEnabled
                  ? `Connected with Google account (${userProfile?.email || 'Google ID linked'}).`
                  : 'Single-click authentication via Google OAuth 2.0.'}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-3.5 sm:mt-5 pt-2.5 sm:pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
            {googleEnabled ? (
              <>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground/80 truncate max-w-[130px] sm:max-w-[170px]">
                    ID: {userProfile?.providers?.google?.googleId || 'linked'}
                  </span>
                </div>

                {canUnlink ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isProcessing || isUpdating}
                    onClick={() => setUnlinkConfirmTarget('google')}
                    className="h-10 px-3.5 text-xs font-semibold rounded-xl bg-secondary/80 text-secondary-foreground border border-border-strong shadow-xs hover:text-destructive hover:border-destructive/50 hover:bg-destructive/15 active:scale-95 transition-all cursor-pointer ml-auto shrink-0"
                  >
                    <Unlink className="h-3.5 w-3.5 mr-1" />
                    <span>Disconnect</span>
                  </Button>
                ) : (
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0} className="inline-block cursor-not-allowed ml-auto shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            disabled
                            className="h-10 px-3.5 text-xs font-semibold rounded-xl bg-secondary/30 text-muted-foreground/50 border border-border-subtle opacity-60 shadow-none pointer-events-none"
                          >
                            <Unlink className="h-3.5 w-3.5 mr-1" />
                            <span>Disconnect</span>
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={4} className="text-xs max-w-xs text-center">
                        Cannot unlink Google when it is your only login method. Please set a password first.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </>
            ) : (
              <div className="w-full rounded-xl bg-surface/70 p-2.5 sm:p-3 border border-border-subtle flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <p className="leading-relaxed text-[10px] sm:text-[11px]">
                  To connect Google, sign out and sign in with Google using this account&apos;s email (<span className="text-foreground font-medium">{userProfile?.email}</span>).
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="flex items-start gap-2.5 rounded-xl border border-border-subtle bg-surface-sunken/40 p-3 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
        <span>
          Enabling multiple login methods allows flexible sign-in options while safeguarding your account from lockout if a third-party service is temporarily unavailable.
        </span>
      </div>

      {/* Unlink Confirmation Dialog */}
      {unlinkConfirmTarget && (
        <Dialog open={!!unlinkConfirmTarget} onOpenChange={() => setUnlinkConfirmTarget(null)}>
          <DialogContent className="sm:max-w-sm rounded-2xl border-border bg-card text-card-foreground [&>button]:cursor-pointer [&>button]:rounded-full [&>button]:p-1.5">
            <DialogHeader className="space-y-2 text-left">
              <div className="h-9 w-9 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-semibold text-foreground tracking-tight">
                {unlinkConfirmTarget === 'local'
                  ? 'Remove Password Login?'
                  : 'Unlink Google Account?'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-normal">
                {unlinkConfirmTarget === 'local' ? (
                  <>
                    Are you sure you want to remove password login? You will no longer be able to log in with your email and password, and will rely exclusively on your linked{' '}
                    <strong className="text-foreground">Google Account</strong>.
                  </>
                ) : (
                  <>
                    Are you sure you want to disconnect your Google account? You will need to sign in using your{' '}
                    <strong className="text-foreground">Email and Password</strong>.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-2 pt-2 justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isProcessing}
                className="h-8 rounded-lg text-xs font-medium cursor-pointer"
                onClick={() => setUnlinkConfirmTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isProcessing}
                className="h-8 rounded-lg text-xs font-medium cursor-pointer shadow-2xs"
                onClick={handleConfirmUnlink}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Unlinking...
                  </>
                ) : unlinkConfirmTarget === 'local' ? (
                  'Remove Password'
                ) : (
                  'Unlink Google Account'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default LoginProviders;
