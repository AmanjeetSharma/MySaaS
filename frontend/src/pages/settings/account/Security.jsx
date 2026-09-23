import React, { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Laptop,
  Smartphone,
  Clock,
  LogOut,
  History,
} from 'lucide-react';
import { toast } from 'sonner';
import DangerZone from './DangerZone';

const Security = () => {
  const {
    sessions,
    currentSessionId,
    isLoading,
    isUpdating,
    getUserSessions,
    logoutSessionById,
    logoutAllSessions,
    deleteUserAccount,
  } = useUserStore();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      await getUserSessions();
    } catch {
      toast.error('Failed to load sessions');
    }
  };

  const handleLogoutSession = async (sessionId) => {
    try {
      await logoutSessionById(sessionId);
      toast.success('Session logged out successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to logout session');
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAllSessions();
      toast.success('Logged out from all other devices');
      await fetchSessions();
    } catch (error) {
      toast.error(error.message || 'Failed to logout from other devices');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUserAccount();
      toast.success('Account deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete account');
    }
  };

  const activeSessionsCount =
    sessions?.filter(
      (s) => s.isActive && s.sessionId !== currentSessionId
    ).length || 0;

  if (isLoading && (!sessions || sessions.length === 0)) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center font-semibold text-xs uppercase tracking-widest text-subtle-foreground/60 animate-pulse">
        Synchronizing Security...
      </div>
    );
  }

  const sortedSessions = [...(sessions || [])].sort((a, b) => {
    if (a.isActive === b.isActive) {
      return new Date(b.latestLogin) - new Date(a.latestLogin);
    }
    return a.isActive ? -1 : 1;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 bg-background text-foreground">
      {/* 1. Page Title Header */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Security
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage your active sessions, device authorizations, and account credentials.
        </p>
      </div>

      <Separator className="bg-border-subtle" />

      {/* 2. Device & Active Sessions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Device Sessions
            </h3>
            <p className="text-xs text-muted-foreground">
              Review all active and past sessions authenticated with your account.
            </p>
          </div>

          {activeSessionsCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogoutAll}
              disabled={isUpdating}
              className="h-8 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 shrink-0 transition-all cursor-pointer self-start sm:self-auto"
            >
              {isUpdating ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="mr-1.5 h-3.5 w-3.5" />
              )}
              Logout Other Devices
            </Button>
          )}
        </div>

        <Separator className="bg-border-subtle" />

        {sortedSessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-subtle p-8 text-center text-xs text-muted-foreground">
            No session history found.
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {sortedSessions.map((session) => {
              const isMobile =
                session.device?.toLowerCase().match(/mobile|ios|android/);
              const isCurrentSession =
                session.sessionId === currentSessionId;

              return (
                <div
                  key={session.sessionId}
                  className={`group relative rounded-xl border p-3.5 sm:p-4 transition-all duration-200 ${
                    session.isActive
                      ? 'border-border-subtle bg-surface/50 hover:bg-surface/80 hover:border-border'
                      : 'border-border-subtle/50 bg-surface-sunken/20 opacity-70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    {/* Left: Device Icon & Info */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                          session.isActive
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-surface-sunken text-muted-foreground border-border-subtle'
                        }`}
                      >
                        {isMobile ? (
                          <Smartphone className="h-4 w-4" />
                        ) : (
                          <Laptop className="h-4 w-4" />
                        )}
                      </div>

                      <div className="space-y-1 min-w-0">
                        {/* Device Name & Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <h4
                            className={`text-xs sm:text-sm font-semibold truncate ${
                              session.isActive
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {session.device || 'Unknown Device'}
                          </h4>

                          {isCurrentSession && session.isActive && (
                            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider">
                              Current Session
                            </span>
                          )}

                          {session.isActive && !isCurrentSession && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          )}

                          {!session.isActive && (
                            <span className="inline-flex items-center rounded-full border border-border-subtle bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                              Inactive
                            </span>
                          )}
                        </div>

                        {/* Timestamps */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 opacity-70 shrink-0" />
                            <span>
                              Last active: {new Date(session.latestLogin).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <History className="h-3 w-3 opacity-70 shrink-0" />
                            <span>
                              Signed in: {new Date(session.firstLogin).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Logout Action */}
                    {session.isActive && !isCurrentSession && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLogoutSession(session.sessionId)}
                        disabled={isUpdating}
                        className="h-8 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 shrink-0 transition-all cursor-pointer self-start sm:self-center"
                      >
                        <LogOut className="mr-1.5 h-3.5 w-3.5" />
                        Logout
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Separator className="bg-border-subtle" />

      {/* 3. Danger Zone */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-destructive">
            Danger Zone
          </h3>
          <p className="text-xs text-muted-foreground">
            Irreversible actions and permanent deletion of your account.
          </p>
        </div>

        <Separator className="bg-border-subtle" />

        <DangerZone
          onDeleteAccount={handleDeleteAccount}
          isUpdating={isUpdating}
        />
      </div>
    </div>
  );
};

export default Security;