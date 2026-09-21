import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  Unplug,
  ShieldCheck,
  Layers,
  Radio,
  Info,
  AlertTriangle,
  X,
  Clock,
  ExternalLink,
  Video
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
import { useGoogleStore, useUserStore } from '@/stores';
import { GoogleCalendarList } from './GoogleCalendarList';

const getEntityId = (entity) => {
  if (!entity) return null;
  if (typeof entity === 'string') return entity;
  return entity._id || entity.id || null;
};

const GoogleIcon = ({ className = 'size-4' }) => (
  <svg className={cn('shrink-0', className)} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const ConnectGoogle = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const redirectTimerRef = useRef(null);

  const {
    status,
    statusOrgId,
    calendars,
    calendarsOrgId,
    role,
    isLoading,
    isConnecting,
    isDisconnecting,
    isFetchingCalendars,
    isUpdatingCalendar,
    error,
    redirectToGoogle,
    handleCallback,
    getStatus,
    listCalendars,
    updateSelectedCalendar,
    disconnectGoogle,
    clearError
  } = useGoogleStore();

  const { userProfile, getUserProfile } = useUserStore();

  const activeOrg = userProfile?.activeOrganization;
  const organizationId = useMemo(() => getEntityId(activeOrg), [activeOrg]);

  const isStatusForActiveOrg = statusOrgId === organizationId;
  const isCalendarsForActiveOrg = calendarsOrgId === organizationId;
  const activeCalendars = useMemo(
    () => (isCalendarsForActiveOrg ? calendars : []),
    [calendars, isCalendarsForActiveOrg]
  );
  const isConnected = isStatusForActiveOrg && Boolean(status?.isConnected);
  const isBusy = isLoading || isConnecting || isDisconnecting;
  const isOwner = role === 'owner';
  const isSyncActive = isSyncing || (isLoading && isFetchingCalendars);
  const isConnectingOrRedirecting = isConnecting || isRedirecting;

  // Unfreeze redirect state if user navigates back from Google via Back button (bfcache) or tab refocus
  useEffect(() => {
    const handleRestoreFromGoogle = () => {
      setIsRedirecting(false);
      useGoogleStore.setState({ isConnecting: false });
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setIsRedirecting(false);
        useGoogleStore.setState({ isConnecting: false });
        if (redirectTimerRef.current) {
          clearTimeout(redirectTimerRef.current);
        }
      }
    };

    window.addEventListener('pageshow', handleRestoreFromGoogle);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pageshow', handleRestoreFromGoogle);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      useGoogleStore.setState({ isConnecting: false });
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!userProfile) {
      getUserProfile().catch(() => {
        toast.error('Failed to load active organization');
      });
    }
  }, [getUserProfile, userProfile]);

  useEffect(() => {
    if (!organizationId) return;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const connected = searchParams.get('connected');
    const errorParam = searchParams.get('error');

    // Handle user cancellation or decline on Google OAuth consent screen
    if (errorParam) {
      useGoogleStore.setState({ isConnecting: false });
      setSearchParams({}, { replace: true });
      if (errorParam === 'access_denied') {
        toast.info('Google sign-in was cancelled.');
      } else {
        toast.error(`Google connection cancelled: ${errorParam}`);
      }
      return;
    }

    const syncGoogleConnection = async () => {
      try {
        if (code && state) {
          await handleCallback({ code, state });
          setSearchParams({}, { replace: true });
          await getStatus(organizationId);
          return;
        }

        if (connected === 'true') {
          toast.success('Google Calendar connected successfully.', {
            description: 'Appointments will automatically sync with your selected calendar.'
          });
          setSearchParams({}, { replace: true });
        }

        await getStatus(organizationId);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load Google integration');
      }
    };

    syncGoogleConnection();
  }, [getStatus, handleCallback, organizationId, searchParams, setSearchParams]);

  useEffect(() => {
    if (!organizationId || !isConnected) return;

    listCalendars(organizationId).catch(() => {
      toast.error('Failed to load Google calendars');
    });
  }, [isConnected, listCalendars, organizationId]);

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

    // Safety timeout: if page does not redirect within 8 seconds, unfreeze button
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    redirectTimerRef.current = setTimeout(() => {
      setIsRedirecting(false);
      useGoogleStore.setState({ isConnecting: false });
    }, 8000);

    try {
      await redirectToGoogle(organizationId);
    } catch (err) {
      setIsRedirecting(false);
      useGoogleStore.setState({ isConnecting: false });
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
      toast.error(err?.response?.data?.message || 'Failed to start Google connection');
    }
  };

  const handleRefresh = async () => {
    if (!organizationId || isSyncing) return;
    setIsSyncing(true);

    try {
      await Promise.all([getStatus(organizationId), listCalendars(organizationId)]);
      toast.success('Google Calendar status synced');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to refresh integration');
    } finally {
      setIsSyncing(false);
    }
  };

  const confirmDisconnect = async () => {
    if (!organizationId) return;

    try {
      await disconnectGoogle(organizationId);
      setIsDisconnectModalOpen(false);
    } catch {
      // Store handles error toasts
    }
  };

  const handleSelectCalendar = async (calendarId) => {
    try {
      await updateSelectedCalendar(organizationId, calendarId);
    } catch {
      // Store handles error toasts
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="w-full h-[calc(100vh-6.25rem)] md:h-[calc(100vh-7.25rem)] max-h-[calc(100vh-6.25rem)] md:max-h-[calc(100vh-7.25rem)] flex flex-col overflow-hidden bg-background text-foreground font-sans">
        {/* Top Header - Compact & fully responsive */}
        <header className="shrink-0 sticky top-0 z-30 border-b border-border-subtle bg-surface-elevated/95 backdrop-blur-md px-3.5 sm:px-6 py-2.5 sm:py-3 shadow-xs">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
            {/* Identity */}
            <div className="flex items-center justify-between w-full sm:w-auto gap-2.5 sm:gap-3 min-w-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="relative size-8 sm:size-9 rounded-lg bg-surface border border-border-subtle shadow-xs flex items-center justify-center shrink-0">
                  <GoogleIcon className="size-4 sm:size-5" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-heading text-sm sm:text-base font-semibold tracking-tight text-foreground truncate">
                    Google Calendar
                  </h1>
                </div>
              </div>

              {/* Status pill on mobile aligns cleanly to top-right */}
              {isConnected ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 border border-success/20 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-success shrink-0">
                  <CheckCircle2 className="size-2.5 sm:size-3" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 border border-destructive/30 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-destructive shrink-0">
                  Not Connected
                </span>
              )}
            </div>

            {/* Top Bar Actions */}
            {isConnected && (
              <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0 border-t border-border-subtle sm:border-t-0 shrink-0 justify-end">
                {/* Refresh / Sync */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isBusy || isSyncActive}
                      className="cursor-pointer flex-1 sm:flex-none text-xs gap-1.5 h-7.5 sm:h-8 hover:bg-surface"
                      aria-label="Synchronize calendar feeds from Google"
                    >
                      <RefreshCw className={cn('size-3.5', isSyncActive && 'animate-spin')} />
                      <span>{isSyncActive ? 'Syncing...' : 'Sync'}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Sync account status and calendars
                  </TooltipContent>
                </Tooltip>

                {/* Disconnect (Owner Only) */}
                {isOwner && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsDisconnectModalOpen(true)}
                        disabled={isDisconnecting}
                        className="cursor-pointer flex-1 sm:flex-none text-xs gap-1.5 h-7.5 sm:h-8 text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                        aria-label="Disconnect Google Calendar integration"
                      >
                        <Unplug className="size-3.5" />
                        <span>Disconnect</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Disconnect Google account
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Warning Banners */}
        <div className="shrink-0 max-w-4xl mx-auto w-full px-3.5 sm:px-6 pt-2.5 sm:pt-3 space-y-2">
          {!organizationId && (
            <div className="rounded-xl bg-warning/10 border border-warning/20 p-2.5 sm:p-3 text-xs font-medium text-warning flex items-center gap-2">
              <Info className="size-4 shrink-0" />
              <span>Select an active organization in your sidebar to manage calendar integrations.</span>
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

        {/* Body Area */}
        <main className="flex-1 min-h-0 max-w-4xl mx-auto w-full px-3.5 sm:px-6 py-2.5 sm:py-3 flex flex-col overflow-hidden">
          {!isConnected ? (
            /* Not Connected */
            <div className="flex-1 min-h-0 overflow-y-auto space-y-4 sm:space-y-5 py-2">
              <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-elevated p-6 sm:p-10 text-center shadow-xs">
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]" />

                <div className="size-12 sm:size-14 rounded-2xl bg-surface border border-border-subtle shadow-xs flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <GoogleIcon className="size-6 sm:size-7" />
                </div>

                <h2 className="font-heading text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                  Connect Your Google Calendar
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm max-w-lg mx-auto mt-1.5 sm:mt-2 leading-relaxed">
                  Connect your calendar to automatically create events, prevent scheduling conflicts, and generate meeting links for appointments.
                </p>

                <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    size="lg"
                    onClick={handleConnect}
                    disabled={isBusy || !organizationId || isConnectingOrRedirecting}
                    className="cursor-pointer w-full sm:w-auto px-6 sm:px-7 py-4 sm:py-5 gap-2.5 sm:gap-3 bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-md transition-all active:scale-[0.98] text-xs sm:text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isConnectingOrRedirecting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <GoogleIcon className="size-4" />
                    )}
                    <span>{isConnectingOrRedirecting ? 'Redirecting to Google...' : 'Sign in with Google'}</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 pb-2">
                {[
                  {
                    icon: Radio,
                    title: 'Real-time Sync',
                    desc: 'Keep bookings and calendar events updated automatically.'
                  },
                  {
                    icon: Video,
                    title: 'Automatic Meeting Links',
                    desc: 'Add meeting links to online appointments automatically.'
                  },
                  {
                    icon: Layers,
                    title: 'Flexible Calendars',
                    desc: 'Choose which calendar receives your bookings.'
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Secure Integration',
                    desc: 'Connect securely with protected access and permissions.'
                  }
                ].map((feat) => (
                  <div
                    key={feat.title}
                    className="rounded-xl border border-border-subtle bg-surface-elevated/70 p-3.5 sm:p-4 shadow-2xs hover:border-border transition-colors flex items-start gap-3"
                  >
                    <div className="size-7 sm:size-8 rounded-lg bg-surface border border-border-subtle text-foreground flex items-center justify-center shrink-0 mt-0.5">
                      <feat.icon className="size-3.5 sm:size-4 text-foreground/80" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading text-xs font-semibold text-foreground">{feat.title}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Connected */
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden space-y-2.5 sm:space-y-3">
              {/* Connected Account Strip - Avatar removed, compact & responsive */}
              <div className="shrink-0 rounded-xl border border-border-subtle bg-surface-elevated p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shadow-xs min-w-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-foreground truncate min-w-0" title={status?.email}>
                      {status?.email || 'N/A'}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success shrink-0">
                      Active
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 flex-wrap min-w-0">
                    <Clock className="size-3 shrink-0" />
                    <span>
                      Connected on{' '}
                      {status?.connectedAt
                        ? new Date(status.connectedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                        : 'Active'}
                    </span>
                    {activeOrg?.name && (
                      <>
                        <span className="mx-1">•</span>
                        <span className="truncate max-w-[140px] sm:max-w-none">Workspace: {activeOrg.name}</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Right Side: Open Calendar button */}
                <div className="shrink-0 self-end sm:self-auto pt-1 sm:pt-0 border-t border-border-subtle sm:border-t-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="cursor-pointer text-[11px] sm:text-xs gap-1.5 h-7.5 sm:h-8 px-2.5 sm:px-3 hover:bg-surface"
                      >
                        <a
                          href="https://calendar.google.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Open Google Calendar in a new browser tab"
                        >
                          <ExternalLink className="size-3 sm:size-3.5 text-muted-foreground" />
                          <span>Open Calendar</span>
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Open Calendar in New Tab
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Child Component for Calendar Listing & Selection */}
              <GoogleCalendarList
                calendars={activeCalendars}
                selectedCalendarId={status?.calendarId}
                isOwner={isOwner}
                organizationId={organizationId}
                isUpdatingCalendar={isUpdatingCalendar}
                onSelectCalendar={handleSelectCalendar}
              />
            </div>
          )}
        </main>

        {/* Disconnect Modal */}
        {isDisconnectModalOpen && (
          <div
            className="cursor-pointer fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/80 backdrop-blur-xs animate-in fade-in-0 duration-200"
            onClick={() => !isDisconnecting && setIsDisconnectModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="disconnect-modal-title"
          >
            <div
              className="cursor-default relative w-full max-w-md rounded-xl border border-border bg-surface-elevated text-surface-elevated-foreground p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDisconnectModalOpen(false)}
                    disabled={isDisconnecting}
                    className="cursor-pointer absolute right-3 top-3 size-8 sm:size-9 text-muted-foreground hover:text-foreground"
                    aria-label="Close dialog"
                  >
                    <X className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close</TooltipContent>
              </Tooltip>

              <div className="flex items-start gap-3 sm:gap-4">
                <div className="size-9 sm:size-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0 border border-destructive/20">
                  <AlertTriangle className="size-4 sm:size-5" />
                </div>
                <div className="pr-4">
                  <h3 id="disconnect-modal-title" className="font-heading text-sm sm:text-base font-semibold tracking-tight text-foreground">
                    Disconnect Google Calendar?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 sm:mt-2 leading-relaxed">
                    Future bookings will no longer sync with Google Calendar, and Google Meet video conference links will not be automatically generated. Previously scheduled meetings will remain in your calendar.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 sm:gap-3 mt-5 sm:mt-6 w-full">
                <Button
                  variant="outline"
                  onClick={() => setIsDisconnectModalOpen(false)}
                  disabled={isDisconnecting}
                  className="cursor-pointer text-xs h-8 sm:h-9"
                >
                  Cancel
                </Button>

                <Button
                  variant="destructive"
                  onClick={confirmDisconnect}
                  disabled={isDisconnecting}
                  className="cursor-pointer text-xs gap-1.5 h-8 sm:h-9"
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

export default ConnectGoogle;