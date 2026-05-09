import React, { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
  Loader2,
  Shield,
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
    } catch (error) {
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
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
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
    <div className="relative container mx-auto max-w-4xl space-y-5 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 md:space-y-8 md:py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col gap-2">
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:gap-3 md:text-3xl">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Shield className="h-5 w-5 text-primary md:h-6 md:w-6" />
          </div>

          Security
        </h1>

        <p className="ml-1 text-sm text-muted-foreground md:text-base">
          Manage your account sessions and security settings.
        </p>
      </div>

      {/* Sessions */}
      <Card className="relative z-10 overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-lg backdrop-blur sm:rounded-3xl sm:shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
        <CardHeader className="flex flex-col gap-4 border-b border-border/50 bg-linear-to-b from-muted/50 to-muted/20 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5 md:p-6">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold md:text-xl">
              Device Status
            </CardTitle>

            <CardDescription className="max-w-lg text-sm md:text-base">
              Review all active and past sessions associated with your account.
            </CardDescription>
          </div>

          {activeSessionsCount > 0 && (
            <Button
              variant="outline"
              onClick={handleLogoutAll}
              disabled={isUpdating}
              className="h-10 w-full rounded-xl transition-all duration-200 hover:border-destructive/50 hover:bg-destructive/20 hover:text-destructive-foreground sm:w-auto cursor-pointer"
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}

              Logout Other Devices
            </Button>
          )}
        </CardHeader>

        <CardContent className="p-2 sm:p-3">
          {sortedSessions.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No session history found.
            </div>
          ) : (
            <div className="space-y-2">
              {sortedSessions.map((session) => {
                const isMobile =
                  session.device?.toLowerCase().match(/mobile|ios|android/);

                const isCurrentSession =
                  session.sessionId === currentSessionId;

                return (
                  <div
                    key={session.sessionId}
                    className={`group relative rounded-2xl border border-transparent px-3 py-3 transition-all duration-200 sm:px-4 sm:py-4 ${session.isActive
                      ? 'bg-background/80 hover:border-border hover:bg-muted/20 hover:shadow-md'
                      : 'bg-muted/10 opacity-80'
                      }`}
                  >
                    <div className="flex items-start gap-3">

                      {/* Device Icon */}
                      <div
                        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${session.isActive
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                          }`}
                      >
                        {isMobile ? (
                          <Smartphone className="h-4.5 w-4.5" />
                        ) : (
                          <Laptop className="h-4.5 w-4.5" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">

                        {/* Top */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4
                            className={`wrap-break-word text-sm font-medium sm:text-[15px] ${session.isActive
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                              }`}
                          >
                            {session.device || 'Unknown Device'}
                          </h4>

                          {/* Status Badges */}
                          {isCurrentSession && session.isActive && (
                            <Badge
                              variant="secondary"
                              className="border-transparent bg-blue-500/10 px-1.5 py-0 text-[10px] font-medium text-blue-600 dark:text-blue-400"
                            >
                              Current
                            </Badge>
                          )}

                          {session.isActive && !isCurrentSession && (
                            <Badge
                              variant="secondary"
                              className="border-transparent bg-emerald-500/10 px-1.5 py-0 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
                            >
                              Online
                            </Badge>
                          )}

                          {!session.isActive && (
                            <Badge
                              variant="outline"
                              className="px-1.5 py-0 text-[10px] font-medium text-muted-foreground"
                            >
                              Inactive
                            </Badge>
                          )}
                        </div>

                        {/* Details */}
                        <div className="mt-2 space-y-1.5 text-[11px] text-muted-foreground sm:text-xs">

                          <div className="flex items-start gap-1.5">
                            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60" />

                            <span className="wrap-break-word leading-relaxed">
                              Last active:{' '}
                              {new Date(session.latestLogin).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-start gap-1.5">
                            <History className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60" />

                            <span className="wrap-break-word leading-relaxed">
                              Signed in:{' '}
                              {new Date(session.firstLogin).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Action */}
                        {session.isActive && !isCurrentSession && (
                          <div className="mt-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleLogoutSession(session.sessionId)
                              }
                              disabled={isUpdating}
                              className="h-8 rounded-lg bg-destructive/8 px-3 text-xs font-medium text-destructive transition-all duration-200 hover:bg-destructive/30 hover:text-destructive-foreground cursor-pointer"
                            >
                              Logout Session
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <div className="relative z-10">
        <DangerZone
          onDeleteAccount={handleDeleteAccount}
          isUpdating={isUpdating}
        />
      </div>
    </div>
  );
};

export default Security;