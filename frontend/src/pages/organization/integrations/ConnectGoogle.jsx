import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Loader2,
  PlugZap,
  RefreshCw,
  Unplug
} from 'lucide-react';
import { toast } from 'sonner';
import { useGoogleStore, useUserStore } from '@/stores';

const getEntityId = (entity) => {
  if (!entity) return null;
  if (typeof entity === 'string') return entity;
  return entity._id || entity.id || null;
};

const ConnectGoogle = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    status,
    calendars,
    isLoading,
    isConnecting,
    isDisconnecting,
    isFetchingCalendars,
    error,
    redirectToGoogle,
    handleCallback,
    getStatus,
    listCalendars,
    disconnectGoogle,
    clearError
  } = useGoogleStore();

  const { userProfile, getUserProfile } = useUserStore();
  const organizationId = useMemo(
    () => getEntityId(userProfile?.activeOrganization),
    [userProfile?.activeOrganization]
  );

  const isConnected = Boolean(status?.isConnected);
  const isBusy = isLoading || isConnecting || isDisconnecting;

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

    const syncGoogleConnection = async () => {
      try {
        if (code && state) {
          await handleCallback({ code, state });
          setSearchParams({}, { replace: true });
          await getStatus(organizationId);
          return;
        }

        if (connected === 'true') {
          toast.success('Google account connected successfully.');
          setSearchParams({}, { replace: true });
        }

        await getStatus(organizationId);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load Google integration');
      }
    };

    syncGoogleConnection();
  }, [
    getStatus,
    handleCallback,
    organizationId,
    searchParams,
    setSearchParams
  ]);

  useEffect(() => {
    if (!organizationId || !isConnected) return;

    listCalendars(organizationId).catch(() => {
      toast.error('Failed to load Google calendars');
    });
  }, [isConnected, listCalendars, organizationId]);

  const handleConnect = async () => {
    if (!organizationId) {
      toast.error('Select an active organization before connecting Google.');
      return;
    }

    try {
      await redirectToGoogle(organizationId);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to start Google connection');
    }
  };

  const handleRefresh = async () => {
    if (!organizationId) return;

    try {
      await getStatus(organizationId);
      if (isConnected) {
        await listCalendars(organizationId);
      }
      toast.success('Google integration refreshed');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to refresh Google integration');
    }
  };

  const handleDisconnect = async () => {
    if (!organizationId) return;

    try {
      await disconnectGoogle(organizationId);
    } catch {
      // Store handles the user-facing error toast.
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-background p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-2xl">
        <div className="relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-blue-500/20 via-red-500/20 to-yellow-500/20 rounded-2xl sm:rounded-3xl blur-lg opacity-50 group-hover:opacity-100 transition duration-1000"></div>

          <div className="relative bg-card text-card-foreground border border-border shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden">
            <div className="p-5 sm:p-8 md:p-12">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4 sm:mb-6">
                  <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"></div>
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white dark:bg-zinc-900 border border-border shadow-[0_8px_16px_-4px_rgba(0,0,0,0.2)] rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <Calendar className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-[#4285F4]" strokeWidth={1.5} />
                  </div>
                </div>

                <div className="mb-2 flex items-center gap-2">
                  {isConnected && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Connected
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold tracking-tight mb-2 sm:mb-3">
                  Google Calendar
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-xs sm:max-w-sm md:max-w-md">
                  Sync your schedule with real-time data mirroring.
                </p>

                {status?.email && (
                  <div className="mb-5 w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-left">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Connected account
                    </p>
                    <p className="mt-1 break-all text-sm font-medium text-foreground">
                      {status.email}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Calendar: {status.calendarId || 'primary'}
                    </p>
                  </div>
                )}

                {error && (
                  <button
                    type="button"
                    onClick={clearError}
                    className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive cursor-pointer"
                  >
                    {error}
                  </button>
                )}

                <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
                  {!isConnected ? (
                    <div className="group/btn relative w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleConnect}
                        disabled={isBusy || !organizationId}
                        className="w-full sm:w-auto p-[1px] rounded-[var(--radius-lg)] transition-all active:scale-[0.97] hover:shadow-[0_0_20px_rgba(66,133,244,0.15)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <div className="absolute inset-0 bg-linear-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC05] rounded-[var(--radius-lg)]"></div>

                        <div className="relative bg-white dark:bg-zinc-950 py-2.5 sm:py-3 px-4 sm:px-6 rounded-[calc(var(--radius-lg)-1px)] flex items-center justify-center gap-2.5 sm:gap-3 transition-colors group-hover/btn:bg-opacity-95">
                          {isConnecting ? (
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 animate-spin text-zinc-900 dark:text-zinc-100" />
                          ) : (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                          )}
                          <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {isConnecting ? 'Connecting...' : 'Sign in with Google'}
                          </span>
                          <ChevronRight size={16} className="text-zinc-900 dark:text-zinc-100 group-hover/btn:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={isBusy || isFetchingCalendars}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-xs font-bold text-foreground transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoading || isFetchingCalendars ? 'animate-spin' : ''}`} />
                        Refresh
                      </button>

                      <button
                        type="button"
                        onClick={handleDisconnect}
                        disabled={isDisconnecting}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 text-xs font-bold text-destructive transition-colors hover:bg-destructive/15 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        {isDisconnecting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Unplug className="h-4 w-4" />
                        )}
                        Disconnect
                      </button>
                    </>
                  )}
                </div>

                {!organizationId && (
                  <p className="mt-4 text-xs font-medium text-amber-600 dark:text-amber-400">
                    Select an active organization to connect Google Calendar.
                  </p>
                )}

                {isConnected && (
                  <div className="mt-8 w-full rounded-xl border border-border bg-muted/20 p-4 text-left">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <PlugZap className="h-4 w-4 text-[#4285F4]" />
                        <h2 className="text-sm font-bold text-foreground">Available calendars</h2>
                      </div>
                      {isFetchingCalendars && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>

                    {calendars.length > 0 ? (
                      <div className="space-y-2">
                        {calendars.map((calendar) => (
                          <div
                            key={calendar.id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">
                                {calendar.summary}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {calendar.id}
                              </p>
                            </div>
                            {calendar.primary && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                                Primary
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {isFetchingCalendars ? 'Loading calendars...' : 'No calendars found.'}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 md:gap-x-8 gap-y-2.5 sm:gap-y-3 mt-8 sm:mt-10 w-full sm:w-auto text-left">
                  {['Real-time Sync', 'Event Reminders', 'Multi-Calendar', 'Auto Mirroring'].map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground/80">
                      <CheckCircle2 size={16} className="text-[#4285F4] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectGoogle;
