import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Unplug,
  ShieldCheck,
  Layers,
  Radio,
  Check,
  Building2,
  Info,
  AlertTriangle,
  X,
  Mail,
  CornerDownRight,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useGoogleStore, useUserStore } from '@/stores';

const getEntityId = (entity) => {
  if (!entity) return null;
  if (typeof entity === 'string') return entity;
  return entity._id || entity.id || null;
};

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const ConnectGoogle = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [updatingCalendarId, setUpdatingCalendarId] = useState(null);

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
  const activeCalendars = useMemo(() => (
    isCalendarsForActiveOrg ? calendars : []
  ), [calendars, isCalendarsForActiveOrg]);
  const isConnected = isStatusForActiveOrg && Boolean(status?.isConnected);
  const isBusy = isLoading || isConnecting || isDisconnecting;
  const isOwner = role === 'owner';

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

  const handleConnect = async () => {
    if (!organizationId) {
      toast.error('Select an active organization first.');
      return;
    }

    try {
      await redirectToGoogle(organizationId);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to start Google connection');
    }
  };

  const handleRefresh = async () => {
    if (!organizationId) return;

    try {
      await getStatus(organizationId);
      if (isConnected) {
        await listCalendars(organizationId);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to refresh integration');
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
    if (!organizationId || !isOwner || isUpdatingCalendar) return;
    setUpdatingCalendarId(calendarId);

    try {
      await updateSelectedCalendar(organizationId, calendarId);
    } catch {
      // Store handles error toasts
    } finally {
      setUpdatingCalendarId(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans pb-12 sm:pb-16">
      {/* Header */}
      <header className="border-b border-border bg-card/40 relative z-20 px-3.5 sm:px-8 py-3.5 sm:py-5">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">

          {/* Left Side: Brand Icon, Title & Status Subtext */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 w-full sm:w-auto">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-card border border-border shadow-2xs flex items-center justify-center shrink-0">
              <CalendarIcon className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-blue-500" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                  Google Calendar
                </h1>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 sm:px-2.5 py-0.5 text-[11px] sm:text-xs font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 className="h-3 w-3" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 sm:px-2.5 py-0.5 text-[11px] sm:text-xs font-medium text-muted-foreground shrink-0">
                    Disconnected
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Action Buttons */}
          {isConnected && (
            <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto pt-2 sm:pt-0 border-t border-border/40 sm:border-t-0 shrink-0">
              {/* Sync Now Button */}
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isBusy || isFetchingCalendars}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold shadow-2xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading || isFetchingCalendars ? 'animate-spin' : ''}`} />
                <span>Sync Now</span>
              </button>

              {/* Disconnect Account Button (Owner Only) */}
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setIsDisconnectModalOpen(true)}
                  disabled={isDisconnecting}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/15 text-destructive px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <Unplug className="h-3.5 w-3.5" />
                  <span className="truncate">Disconnect</span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-3.5 sm:px-8 pt-4 sm:pt-8">

        {/* Global Alerts */}
        {!organizationId && (
          <div className="mb-4 sm:mb-6 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 sm:p-4 text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Select an active organization to continue.</span>
          </div>
        )}

        {error && (
          <div className="mb-4 sm:mb-6 rounded-xl border border-destructive/20 bg-destructive/10 p-3 sm:p-4 flex items-center justify-between text-xs text-destructive">
            <span>{error}</span>
            <button type="button" onClick={clearError} className="font-semibold underline cursor-pointer shrink-0 ml-2">
              Dismiss
            </button>
          </div>
        )}

        {/* DISCONNECTED STATE */}
        {!isConnected ? (
          <div className="space-y-6 sm:space-y-8 py-1 sm:py-2">
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-10 text-center shadow-2xs">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-border/80 shadow-2xs flex items-center justify-center mx-auto mb-3.5 sm:mb-4">
                <GoogleIcon />
              </div>

              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                Connect Google Calendar
              </h2>
              <p className="text-muted-foreground text-xs max-w-md mx-auto mt-1.5 sm:mt-2 leading-relaxed">
                Automate scheduling, generate instant Google Meet links, and connect your calendar to view all your appointments in one place.
              </p>

              <div className="mt-5 sm:mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={isBusy || !organizationId}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 sm:gap-3 rounded-xl border border-border/80 bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 text-gray-700 dark:text-gray-200 px-5 sm:px-6 py-2.5 sm:py-3 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  ) : (
                    <GoogleIcon />
                  )}
                  <span>{isConnecting ? 'Connecting Google...' : 'Sign in with Google'}</span>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4">
                Integration Benefits
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  {
                    icon: Radio,
                    title: 'Real-time Auto Sync',
                    desc: 'Edits and new bookings in your workspace automatically update on your Google Calendar.'
                  },
                  {
                    icon: Building2,
                    title: 'Instant Google Meet Links',
                    desc: 'Automatically generate and attach video meeting links to new appointments.'
                  },
                  {
                    icon: Layers,
                    title: 'Multi-Calendar Feeds',
                    desc: 'Select and switch between your personal, team, or primary calendar feeds.'
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Enterprise Security',
                    desc: 'Encrypted OAuth 2.0 token storage keeps your data strictly private.'
                  }
                ].map((benefit) => (
                  <div key={benefit.title} className="rounded-xl border border-border bg-card p-4 sm:p-5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2.5 sm:mb-3">
                      <benefit.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-foreground">{benefit.title}</h4>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-relaxed">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* CONNECTED STATE */
          <div className="space-y-4 sm:space-y-6">

            {/* 1. Connected Account Info Bar */}
            <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 shadow-2xs">
              {/* Left: Email & Account Info */}
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 block">
                    Account
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-foreground truncate mt-0.5" title={status?.email}>
                    {status?.email || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Right: Connected Date Badge */}
              {status?.connectedAt && (
                <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0 bg-muted/50 border border-border/60 rounded-lg px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] text-muted-foreground">
                  <Clock className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                  <span>
                    Connected On:{' '}
                    <span className="font-semibold text-foreground">
                      {new Date(status.connectedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* 2. Available Calendars List */}
            <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-3.5 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-border">
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-foreground">Available Calendars</h2>
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                    {isOwner
                      ? 'Select which calendar feed should receive new bookings.'
                      : 'Authorized Google Calendar feeds.'}
                  </p>
                </div>
                {isFetchingCalendars && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 ml-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                    <span className="hidden sm:inline">Syncing...</span>
                  </div>
                )}
              </div>

              {activeCalendars.length > 0 ? (
                <div className="space-y-2.5 sm:space-y-3">
                  {activeCalendars.map((calendar) => {
                    const isSelected = calendar.selected || calendar.id === status?.calendarId;
                    const isRowUpdating = updatingCalendarId === calendar.id;

                    return (
                      <div
                        key={calendar.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl border transition-all gap-3 ${isSelected
                          ? 'border-blue-500/50 bg-blue-500/5 dark:bg-blue-500/10'
                          : 'border-border/70 bg-card/60 hover:border-border'
                          }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <p className="text-xs font-bold text-foreground break-all">
                              Calendar: {calendar.name}
                            </p>
                            {calendar.primary && (
                              <span className="rounded-md bg-muted border border-border px-1.5 py-0.25 text-[10px] font-medium text-muted-foreground shrink-0">
                                Primary
                              </span>
                            )}
                          </div>

                          {/* Full Calendar ID shown clearly without truncation or clipping */}
                          {isOwner && calendar.id && (
                            <p className="text-[11px] font-mono text-muted-foreground/80 mt-1 break-all leading-relaxed bg-muted/30 p-1.5 sm:p-0 sm:bg-transparent rounded-md">
                              Calendar ID: {calendar.id}
                            </p>
                          )}

                          <div>
                            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-normal">
                              Description: {calendar.description || (calendar.primary ? "Google's default calendar" : "Business Calendar")}
                            </p>

                            {isSelected && (
                              <p className="text-[11px] sm:text-xs font-medium text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1.5">
                                <CornerDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 stroke-[2.5]" />
                                <span>Bookings are being created here</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 self-start sm:self-auto pt-1 sm:pt-0 border-t border-border/30 sm:border-t-0 w-full sm:w-auto flex justify-end">
                          {isSelected ? (
                            <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs font-bold">
                              <Check className="w-3.5 h-3.5 stroke-3" />
                              In Use
                            </span>
                          ) : isOwner ? (
                            <button
                              type="button"
                              onClick={() => handleSelectCalendar(calendar.id)}
                              disabled={isUpdatingCalendar}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background hover:bg-muted px-3.5 py-1.5 text-xs font-semibold text-foreground transition-all cursor-pointer disabled:opacity-50"
                            >
                              {isRowUpdating ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                              ) : (
                                'Use this Calendar'
                              )}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 sm:py-8 text-center rounded-xl border border-dashed border-border">
                  <p className="text-xs text-muted-foreground">
                    {isFetchingCalendars ? 'Loading calendars...' : 'No calendars found.'}
                  </p>
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      {/* DISCONNECT CONFIRMATION MODAL */}
      {isDisconnectModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200"
          onClick={() => !isDisconnecting && setIsDisconnectModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="disconnect-modal-title"
        >
          <div
            className="relative w-full max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-2xl ring-1 ring-border/50 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Icon Button */}
            <button
              type="button"
              onClick={() => setIsDisconnectModalOpen(false)}
              disabled={isDisconnecting}
              className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 rounded-lg p-1 text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Warning Header & Icon */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[var(--color-destructive)]/10 text-[var(--color-destructive)] flex items-center justify-center shrink-0 border border-[var(--color-destructive)]/20 ring-4 ring-[var(--color-destructive)]/5">
                <AlertTriangle className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </div>
              <div className="pr-4 sm:pr-6">
                <h3 id="disconnect-modal-title" className="text-sm sm:text-base font-bold tracking-tight text-foreground">
                  Disconnect Google Calendar?
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 sm:mt-1.5 leading-relaxed">
                  Warning: Future bookings will no longer be automatically added to Google Calendar, and Google Meet links will no longer be generated. Existing calendar events and meetings will remain unchanged.
                </p>
              </div>
            </div>

            {/* 50/50 Responsive Action Buttons */}
            <div className="flex items-center gap-2.5 mt-5 sm:mt-6 w-full">
              <button
                type="button"
                onClick={() => setIsDisconnectModalOpen(false)}
                disabled={isDisconnecting}
                className="flex-1 inline-flex items-center justify-center rounded-xl border border-border bg-card hover:bg-muted/60 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold text-foreground transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
              >
                Cancel
              </button>

              {/* Destructive Confirm Button */}
              <button
                type="button"
                onClick={confirmDisconnect}
                disabled={isDisconnecting}
                className="flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-destructive text-primary-foreground hover:opacity-90 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold shadow-2xs transition-all disabled:opacity-50 cursor-pointer active:scale-[0.98]"
              >
                {isDisconnecting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Unplug className="w-3.5 h-3.5" />
                )}
                <span>{isDisconnecting ? 'Disconnecting...' : 'Disconnect'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectGoogle;
