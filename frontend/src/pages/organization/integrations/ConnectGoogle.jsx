import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Loader2,
  PlugZap,
  RefreshCw,
  Unplug,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Globe,
  BellRing,
  RotateCw,
  Sliders,
  ExternalLink,
  Layers
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
  const [activeTab, setActiveTab] = useState('overview');

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
      toast.success('Google integration refreshed successfully.');
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
    <div className="min-h-screen w-full bg-background text-foreground font-sans pb-16">
      {/* Top Accent Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]"></div>

      {/* Page Header / Breadcrumb Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10 px-4 sm:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 border border-border/80 shadow-xs flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-[#4285F4]" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Integrations</span>
                <span className="text-muted-foreground text-xs">/</span>
                <span className="text-xs font-semibold text-foreground">Google Calendar</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                Google Calendar
                {isConnected && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    Connected
                  </span>
                )}
              </h1>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isBusy || isFetchingCalendars}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground shadow-xs transition-colors hover:bg-muted disabled:opacity-60 cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-[#4285F4] ${isLoading || isFetchingCalendars ? 'animate-spin' : ''}`} />
                  Sync Status
                </button>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs font-semibold text-destructive shadow-xs transition-colors hover:bg-destructive/20 disabled:opacity-60 cursor-pointer"
                >
                  {isDisconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unplug className="h-3.5 w-3.5" />}
                  Disconnect
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                disabled={isBusy || !organizationId}
                className="relative inline-flex items-center gap-2.5 rounded-lg bg-[#4285F4] hover:bg-[#3367D6] text-white px-5 py-2.5 text-xs font-semibold shadow-md transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                {isConnecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                <span>{isConnecting ? 'Connecting...' : 'Connect Google Workspace'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Layout Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">

        {/* Banner Alert for missing Organization */}
        {!organizationId && (
          <div className="mb-8 rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Select an active organization in your workspace options before initiating Google integration.</span>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="mb-8 rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex items-center justify-between gap-3 text-xs font-medium text-destructive">
            <span>{error}</span>
            <button type="button" onClick={clearError} className="font-bold underline hover:opacity-80 cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Overview Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-3">
              <span className="text-xs font-semibold">Integration Status</span>
              <Globe className="w-4 h-4 text-[#4285F4]" />
            </div>
            <p className="text-xl font-bold text-foreground">
              {isConnected ? 'Active & Synced' : 'Disconnected'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isConnected ? 'OAuth 2.0 Token Valid' : 'Action Required'}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-3">
              <span className="text-xs font-semibold">Active Account</span>
              <ShieldCheck className="w-4 h-4 text-[#34A853]" />
            </div>
            <p className="text-base font-bold text-foreground truncate">
              {status?.email || 'Not connected'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {status?.calendarId ? `Calendar: ${status.calendarId}` : 'Google Workspace'}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-3">
              <span className="text-xs font-semibold">Synced Calendars</span>
              <Layers className="w-4 h-4 text-[#FBBC05]" />
            </div>
            <p className="text-xl font-bold text-foreground">
              {isConnected ? calendars.length : 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Available feeds</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-3">
              <span className="text-xs font-semibold">Sync Engine</span>
              <RotateCw className="w-4 h-4 text-[#EA4335]" />
            </div>
            <p className="text-xl font-bold text-foreground">Bi-Directional</p>
            <p className="text-xs text-muted-foreground mt-1">Real-time webhooks</p>
          </div>
        </div>

        {/* 2-Column Page Layout Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content Area (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Tabbed Interface */}
            <div className="border-b border-border flex items-center gap-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${activeTab === 'overview'
                    ? 'border-[#4285F4] text-[#4285F4]'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
              >
                Overview & Feeds
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`pb-3 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${activeTab === 'features'
                    ? 'border-[#4285F4] text-[#4285F4]'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
              >
                Features & Permissions
              </button>
            </div>

            {/* TAB CONTENT: Overview & Feeds */}
            {activeTab === 'overview' && (
              <div className="space-y-6">

                {/* Connection Box if NOT Connected */}
                {!isConnected && (
                  <div className="rounded-2xl border border-border bg-gradient-to-br from-card via-card to-muted/30 p-8 text-center shadow-xs">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-[#4285F4] flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                      <PlugZap className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Connect Google Workspace</h2>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                      Sync your Google Calendar events seamlessly to manage schedules, avoid double booking, and keep your workspace updated.
                    </p>
                    <button
                      type="button"
                      onClick={handleConnect}
                      disabled={isBusy || !organizationId}
                      className="inline-flex items-center gap-3 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white px-6 py-3 text-sm font-semibold shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                    >
                      {isConnecting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      )}
                      <span>{isConnecting ? 'Connecting Account...' : 'Sign in with Google'}</span>
                    </button>
                  </div>
                )}

                {/* Available Calendars List Section */}
                {isConnected && (
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                      <div>
                        <h2 className="text-base font-bold text-foreground">Authorized Calendar Feeds</h2>
                        <p className="text-xs text-muted-foreground">Selectable feeds synced with your profile</p>
                      </div>
                      {isFetchingCalendars && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin text-[#4285F4]" />
                          <span>Fetching updates...</span>
                        </div>
                      )}
                    </div>

                    {calendars.length > 0 ? (
                      <div className="space-y-3">
                        {calendars.map((calendar) => (
                          <div
                            key={calendar.id}
                            className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-muted/20 hover:border-[#4285F4]/40 transition-all"
                          >
                            <div className="min-w-0 flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-[#4285F4] shrink-0"></div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {calendar.summary}
                                </p>
                                <p className="truncate text-xs font-mono text-muted-foreground mt-0.5">
                                  {calendar.id}
                                </p>
                              </div>
                            </div>
                            {calendar.primary && (
                              <span className="rounded-full bg-[#4285F4]/10 border border-[#4285F4]/20 px-3 py-1 text-[11px] font-bold text-[#4285F4] shrink-0">
                                Primary Calendar
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center rounded-xl border border-dashed border-border">
                        <p className="text-sm text-muted-foreground">
                          {isFetchingCalendars ? 'Loading calendars...' : 'No calendars found.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Features */}
            {activeTab === 'features' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: RotateCw,
                    title: 'Real-time Auto Sync',
                    desc: 'Changes in Google Calendar reflect instantly across your workspace.'
                  },
                  {
                    icon: BellRing,
                    title: 'Smart Reminders',
                    desc: 'Get automated notifications ahead of important schedule updates.'
                  },
                  {
                    icon: Layers,
                    title: 'Multi-Calendar Feeds',
                    desc: 'Manage work, personal, and team calendars under one unified interface.'
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Enterprise Security',
                    desc: 'Tokenized OAuth 2.0 connection ensuring maximum data privacy.'
                  }
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-border bg-card p-5 shadow-xs">
                    <div className="w-10 h-10 rounded-lg bg-[#4285F4]/10 text-[#4285F4] flex items-center justify-center mb-3">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Area (Right Column) */}
          <div className="space-y-6">

            {/* Account Details Box */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Connection Info
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground">Status</label>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    {isConnected ? 'Connected' : 'Action Required'}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Connected Email</label>
                  <p className="text-sm font-mono text-foreground mt-1 break-all">
                    {status?.email || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Scope Authorization</label>
                  <p className="text-xs text-foreground mt-1 font-medium">
                    read / write (events & calendar metadata)
                  </p>
                </div>
              </div>
            </div>

            {/* Help & Support Box */}
            <div className="rounded-2xl border border-border bg-muted/30 p-6 shadow-xs">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm mb-2">
                <Sparkles className="w-4 h-4 text-[#4285F4]" />
                <span>Need Integration Help?</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Learn how to configure webhook triggers and permissions for Google Workspace accounts.
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4285F4] hover:underline"
              >
                <span>Read Integration Docs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default ConnectGoogle;