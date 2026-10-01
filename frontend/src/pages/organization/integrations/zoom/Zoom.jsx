import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Video,
  VideoOff,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Unplug,
  AlertTriangle,
  X,
  Clock,
  ExternalLink,
  Info,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useZoomStore, useUserStore, useOrganizationStore } from '@/stores';
import {
  getEntityId,
  isSameId,
  checkIsOwner,
  formatConnectedDate,
  parseZoomCallbackParams
} from './zoom.helper';

const Zoom = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const redirectTimerRef = useRef(null);

  const {
    status,
    statusOrgId,
    isLoading,
    isConnecting,
    isDisconnecting,
    error,
    redirectToZoom,
    getStatus,
    disconnectZoom,
    clearError
  } = useZoomStore();

  const { userProfile, getUserProfile } = useUserStore();
  const { currentOrganization, ownedOrganization, getOrganizations } = useOrganizationStore();

  const activeOrg = userProfile?.activeOrganization;
  const organizationId = useMemo(() => getEntityId(activeOrg), [activeOrg]);
  const activeOrgName = currentOrganization?.name || (typeof activeOrg === 'object' ? activeOrg?.name : null);

  const isStatusForActiveOrg = statusOrgId === organizationId;
  const isConnected = isStatusForActiveOrg && Boolean(status?.isConnected);
  const isBusy = isLoading || isConnecting || isDisconnecting;
  const isConnectingOrRedirecting = isConnecting || isRedirecting;

  // Determine if the current user is the owner of the active organization
  const isOwner = useMemo(() => {
    if (!userProfile || !organizationId) return false;
    const currentUserId = getEntityId(userProfile);
    if (!currentUserId) return false;

    // 1. If ownedOrganization in orgStore matches active organizationId
    if (ownedOrganization && isSameId(ownedOrganization._id, organizationId)) {
      return true;
    }

    // 2. If currentOrganization in orgStore has owner matching currentUserId
    if (currentOrganization && isSameId(currentOrganization._id, organizationId)) {
      if (checkIsOwner(currentOrganization, userProfile)) return true;
    }

    // 3. If activeOrganization object on userProfile has owner matching currentUserId
    if (typeof activeOrg === 'object' && activeOrg !== null) {
      if (checkIsOwner(activeOrg, userProfile)) return true;
    }

    return false;
  }, [userProfile, organizationId, ownedOrganization, currentOrganization, activeOrg]);

  // Ensure organization details are fetched when activeOrg exists
  useEffect(() => {
    if (userProfile && organizationId) {
      if (!currentOrganization || !isSameId(currentOrganization._id, organizationId)) {
        getOrganizations(organizationId);
      }
    }
  }, [userProfile, organizationId, currentOrganization, getOrganizations]);

  // Unfreeze redirect state if user navigates back from Zoom via Back button or tab refocus
  useEffect(() => {
    const handleRestoreFromZoom = () => {
      setIsRedirecting(false);
      useZoomStore.setState({ isConnecting: false });
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setIsRedirecting(false);
        useZoomStore.setState({ isConnecting: false });
        if (redirectTimerRef.current) {
          clearTimeout(redirectTimerRef.current);
        }
      }
    };

    window.addEventListener('pageshow', handleRestoreFromZoom);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pageshow', handleRestoreFromZoom);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      useZoomStore.setState({ isConnecting: false });
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  // Ensure userProfile is loaded to resolve active organization
  useEffect(() => {
    if (!userProfile) {
      getUserProfile().catch(() => {
        toast.error('Failed to load active organization profile');
      });
    }
  }, [getUserProfile, userProfile]);

  // Handle OAuth callback parameters and fetch status
  useEffect(() => {
    if (!organizationId) return;

    const { isSuccess, isError, message, email } = parseZoomCallbackParams(searchParams);

    if (isError) {
      useZoomStore.setState({ isConnecting: false });
      setSearchParams({}, { replace: true });
      toast.error(message, {
        duration: 10000,
      });
      return;
    }

    if (isSuccess) {
      toast.success(message, {
        description: email
          ? `Connected: ${email}`
          : 'Zoom video meetings are enabled.'
      });
      setSearchParams({}, { replace: true });
    }

    getStatus(organizationId).catch((err) => {
      toast.error(err?.response?.data?.message || 'Failed to load Zoom status');
    });
  }, [getStatus, organizationId, searchParams, setSearchParams]);

  // Handle escape key for disconnect modal
  useEffect(() => {
    if (!isDisconnectModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDisconnecting) {
        setIsDisconnectModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDisconnectModalOpen, isDisconnecting]);

  const handleConnect = async () => {
    if (!organizationId) {
      toast.error('Select an active organization first.');
      return;
    }

    if (isConnectingOrRedirecting) return;
    setIsRedirecting(true);

    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    redirectTimerRef.current = setTimeout(() => {
      setIsRedirecting(false);
      useZoomStore.setState({ isConnecting: false });
    }, 8000);

    try {
      await redirectToZoom(organizationId);
    } catch (err) {
      setIsRedirecting(false);
      useZoomStore.setState({ isConnecting: false });
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
      toast.error(err?.response?.data?.message || 'Failed to initiate Zoom connection');
    }
  };

  const handleRefresh = async () => {
    if (!organizationId || isSyncing) return;
    setIsSyncing(true);

    try {
      const result = await getStatus(organizationId);
      if (result?.message) {
        toast.success(result.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to refresh Zoom status');
    } finally {
      setIsSyncing(false);
    }
  };

  const confirmDisconnect = async () => {
    if (!organizationId) return;

    try {
      await disconnectZoom(organizationId);
      setIsDisconnectModalOpen(false);
    } catch {
      // Errors handled with toast in zoomStore
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="w-full h-[calc(100vh-6.25rem)] md:h-[calc(100vh-7.25rem)] max-h-[calc(100vh-6.25rem)] md:max-h-[calc(100vh-7.25rem)] flex flex-col overflow-hidden bg-background text-foreground font-sans">
        {/* Compact Header Bar */}
        <header className="shrink-0 sticky top-0 z-30 border-b border-border-subtle bg-surface-elevated/95 backdrop-blur-md px-4 sm:px-6 py-2.5 sm:py-3 shadow-xs">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            {/* Identity and Connection Indicator */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <h1 className="font-heading text-sm sm:text-base font-semibold tracking-tight text-foreground truncate">
                Zoom
              </h1>

              {/* Status Pill */}
              {isConnected ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 text-[10px] sm:text-xs font-medium text-emerald-400 shrink-0">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  <span>Connected</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 border border-border px-2.5 py-0.5 text-[10px] sm:text-xs font-medium text-muted-foreground shrink-0">
                  <span className="size-1.5 rounded-full bg-muted-foreground/60" />
                  <span>Not Connected</span>
                </span>
              )}
            </div>

            {/* Actions: Sync Button styled with depth like Launch button */}
            {isConnected && (
              <div className="flex items-center gap-2 shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isBusy || isSyncing}
                      className="cursor-pointer text-xs gap-1.5 h-8 px-3 bg-surface text-foreground border border-border-strong shadow-xs hover:bg-surface-elevated hover:border-foreground/30 hover:shadow-sm transition-all active:scale-[0.98]"
                      aria-label="Refresh Zoom status"
                    >
                      <RefreshCw className={cn('size-3.5', isSyncing && 'animate-spin')} />
                      <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Sync Zoom status</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </header>

        {/* Warning / Notification Banners */}
        <div className="shrink-0 max-w-2xl mx-auto w-full px-4 sm:px-6 pt-3 space-y-2">
          {!organizationId && (
            <div className="rounded-xl bg-warning/10 border border-warning/20 p-2.5 sm:p-3 text-xs font-medium text-warning flex items-center gap-2">
              <Info className="size-4 shrink-0" />
              <span>Select an active organization in your workspace to manage Zoom.</span>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-2.5 sm:p-3 flex items-center justify-between text-xs text-destructive">
              <span className="truncate pr-2">{error}</span>
              <Button
                variant="link"
                size="xs"
                onClick={clearError}
                className="cursor-pointer text-destructive font-semibold p-0 h-auto underline shrink-0"
              >
                Dismiss
              </Button>
            </div>
          )}
        </div>

        {/* Minimal Main Area - Centered and Focused */}
        <main className="flex-1 min-h-0 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center overflow-y-auto">
          {!isConnected ? (
            /* Not Connected: Minimal, Focused Card */
            <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-elevated p-6 sm:p-10 text-center shadow-xs">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#0B5CFF]" />

              <div className="size-16 sm:size-20 rounded-2xl bg-[#0B5CFF]/10 border border-[#0B5CFF]/25 shadow-lg shadow-[#0B5CFF]/10 flex items-center justify-center mx-auto mb-4 sm:mb-5">
                <VideoOff className="size-8 sm:size-10 text-[#0B5CFF]" strokeWidth={1.75} />
              </div>

              <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Connect Zoom
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mx-auto mt-1.5 leading-relaxed">
                Automatically generate meeting rooms and secure video links for bookings.
              </p>

              {isOwner ? (
                <div className="mt-6 flex justify-center">
                  <Button
                    size="default"
                    onClick={handleConnect}
                    disabled={isBusy || !organizationId || isConnectingOrRedirecting}
                    className="cursor-pointer w-full sm:w-auto px-7 h-10 gap-2 bg-[#0B5CFF] hover:bg-[#094ecf] text-white font-semibold shadow-md shadow-[#0B5CFF]/20 transition-all active:scale-[0.98] text-xs sm:text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isConnectingOrRedirecting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Video className="size-4" />
                    )}
                    <span>{isConnectingOrRedirecting ? 'Redirecting...' : 'Connect Account'}</span>
                  </Button>
                </div>
              ) : (
                <div className="mt-6 flex justify-center">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-surface border border-border-subtle px-3.5 py-2 text-xs text-muted-foreground shadow-2xs">
                    <ShieldAlert className="size-4 text-warning shrink-0" />
                    <span>Only the organization owner can connect Zoom.</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Connected: Huge CheckCircle with Green on Blue Theme */
            <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-elevated p-6 sm:p-10 text-center shadow-xs">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-[#0B5CFF] via-emerald-400 to-[#0B5CFF]" />

              {/* Huge CheckCircle with Green on Blue Theme */}
              <div className="size-20 sm:size-24 rounded-3xl bg-[#0B5CFF]/15 border-2 border-[#0B5CFF]/40 shadow-xl shadow-[#0B5CFF]/20 flex items-center justify-center mx-auto mb-4 sm:mb-5 relative">
                <div className="absolute inset-0 rounded-3xl bg-[#0B5CFF]/20 blur-xl -z-10" />
                <CheckCircle2 className="size-10 sm:size-12 text-emerald-400" strokeWidth={2.25} />
              </div>

              <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Zoom Connected
              </h2>

              {/* Connected Account Identity without green dot */}
              <div className="mt-3 inline-flex items-center rounded-full border border-border-subtle bg-surface px-3.5 py-1 text-xs text-foreground">
                <span className="font-medium truncate max-w-[260px] sm:max-w-none">
                  {status?.email || 'Connected Zoom Account'}
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground mt-2 flex items-center justify-center gap-1.5 flex-wrap">
                <Clock className="size-3" />
                <span>Active since {formatConnectedDate(status?.connectedAt)}</span>
                {activeOrgName && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[160px]">Workspace: {activeOrgName}</span>
                  </>
                )}
              </p>

              {/* Actions with Depth and Tooltips */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      asChild
                      className="cursor-pointer text-xs gap-1.5 h-9 px-4.5 bg-surface text-foreground border border-border-strong shadow-xs hover:bg-surface-elevated hover:border-foreground/30 hover:shadow-sm transition-all active:scale-[0.98]"
                    >
                      <a
                        href="https://zoom.us/signin"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open Zoom web portal in a new tab"
                      >
                        <ExternalLink className="size-3.5 text-muted-foreground" />
                        <span>Launch Zoom</span>
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Open Zoom web portal in a new tab</TooltipContent>
                </Tooltip>

                {isOwner && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => setIsDisconnectModalOpen(true)}
                        disabled={isDisconnecting}
                        className="cursor-pointer text-xs gap-1.5 h-9 px-4.5 bg-destructive/10 text-destructive border border-destructive/35 shadow-xs hover:bg-destructive/20 hover:border-destructive/60 hover:shadow-sm transition-all active:scale-[0.98]"
                        aria-label="Disconnect Zoom integration"
                      >
                        <Unplug className="size-3.5" />
                        <span>Disconnect</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Disconnect Zoom from this organization</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          )}

        </main>

        {/* Minimal Disconnect Confirmation Modal */}
        {isDisconnectModalOpen && (
          <div
            className="cursor-pointer fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/80 backdrop-blur-xs animate-in fade-in-0 duration-200"
            onClick={() => !isDisconnecting && setIsDisconnectModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="disconnect-modal-title"
          >
            <div
              className="cursor-default relative w-full max-w-sm rounded-xl border border-border bg-surface-elevated text-surface-elevated-foreground p-5 shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDisconnectModalOpen(false)}
                    disabled={isDisconnecting}
                    className="cursor-pointer absolute right-3 top-3 size-8 text-muted-foreground hover:text-foreground"
                    aria-label="Close dialog"
                  >
                    <X className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close</TooltipContent>
              </Tooltip>

              <div className="flex items-start gap-3">
                <div className="size-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0 border border-destructive/20">
                  <AlertTriangle className="size-4" />
                </div>
                <div className="pr-3">
                  <h3 id="disconnect-modal-title" className="font-heading text-sm font-semibold tracking-tight text-foreground">
                    Disconnect Zoom?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    New bookings will not receive Zoom meeting links. Existing meetings in Zoom will remain untouched.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-5 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDisconnectModalOpen(false)}
                  disabled={isDisconnecting}
                  className="cursor-pointer text-xs h-8"
                >
                  Cancel
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={confirmDisconnect}
                  disabled={isDisconnecting}
                  className="cursor-pointer text-xs gap-1.5 h-8"
                >
                  {isDisconnecting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Unplug className="size-3.5" />
                  )}
                  <span>{isDisconnecting ? 'Disconnecting...' : 'Disconnect'}</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default Zoom;