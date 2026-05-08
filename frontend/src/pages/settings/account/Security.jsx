import React, { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, Laptop, Smartphone, Clock, LogOut, History } from 'lucide-react';
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
    deleteUserAccount
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

  const activeSessionsCount = sessions?.filter(s => s.isActive && s.sessionId !== currentSessionId).length || 0;

  if (isLoading && (!sessions || sessions.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
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
    <div className="container mx-auto py-6 md:py-10 px-4 sm:px-6 max-w-4xl space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <Shield className="h-6 w-6 md:h-7 md:w-7 text-primary" />
          </div>
          Security
        </h1>
        <p className="text-muted-foreground text-sm md:text-base ml-1">
          Manage your account sessions and security settings.
        </p>
      </div>

      {/* Sessions History Section */}
      <Card className="border-border shadow-sm overflow-hidden bg-card">
        <CardHeader className="bg-muted/30 border-b border-border/50 p-5 md:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="space-y-1.5">
            <CardTitle className="text-lg md:text-xl font-semibold">Device Status</CardTitle>
            <CardDescription className="text-sm md:text-base max-w-lg">
              Review all active and past sessions associated with your account.
            </CardDescription>
          </div>
          {activeSessionsCount > 0 && (
            <Button
              variant="outline"
              onClick={handleLogoutAll}
              disabled={isUpdating}
              className="w-full sm:w-auto shrink-0 group hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200 cursor-pointer"
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4 group-hover:animate-pulse" />
              )}
              Logout Other Devices
            </Button>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {sortedSessions.length === 0 ? (
              <div className="py-12 px-4 text-center text-sm text-muted-foreground">
                No session history found.
              </div>
            ) : (
              sortedSessions.map((session) => {
                const isMobile = session.device?.toLowerCase().match(/mobile|ios|android/);
                const isCurrentSession = session.sessionId === currentSessionId;

                return (
                  <div
                    key={session.sessionId}
                    className={`p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200 ${session.isActive ? 'hover:bg-muted/20' : 'bg-muted/5 opacity-80 hover:bg-muted/10'
                      }`}
                  >
                    {/* Session Info */}
                    <div className="flex items-start gap-3 md:gap-4 flex-1 overflow-hidden">
                      <div
                        className={`p-2.5 md:p-3 rounded-full shrink-0 ${session.isActive
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                          }`}
                      >
                        {isMobile ? <Smartphone className="h-5 w-5 md:h-6 md:w-6" /> : <Laptop className="h-5 w-5 md:h-6 md:w-6" />}
                      </div>

                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                          <h4 className={`font-medium text-sm md:text-base truncate ${session.isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {session.device || 'Unknown Device'}
                          </h4>

                          {/* Status Badges */}
                          <div className="flex flex-wrap gap-1.5">
                            {isCurrentSession && session.isActive && (
                              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border-transparent px-2 py-0 md:py-0.5 text-[10px] md:text-xs font-semibold tracking-wide">
                                Current Device
                              </Badge>
                            )}
                            {session.isActive && !isCurrentSession && (
                              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-transparent px-2 py-0 md:py-0.5 text-[10px] md:text-xs font-semibold tracking-wide">
                                Online
                              </Badge>
                            )}
                            {!session.isActive && (
                              <Badge variant="outline" className="text-muted-foreground px-2 py-0 md:py-0.5 text-[10px] md:text-xs font-medium">
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Timestamps */}
                        <div className="flex flex-col xl:flex-row xl:items-center gap-1 xl:gap-6 text-xs text-muted-foreground mt-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <Clock className="h-3.5 w-3.5 opacity-60 shrink-0" />
                            <span className="truncate">Last active: {new Date(session.latestLogin).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <History className="h-3.5 w-3.5 opacity-60 shrink-0" />
                            <span className="truncate">Signed in: {new Date(session.firstLogin).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {session.isActive && !isCurrentSession && (
                      <div className="mt-2 sm:mt-0 w-full sm:w-auto shrink-0 pl-11 sm:pl-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLogoutSession(session.sessionId)}
                          disabled={isUpdating}
                          className="w-full sm:w-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors h-9 text-xs md:text-sm font-medium cursor-pointer"
                        >
                          Revoke Access
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone Section */}
      <div className="pt-2">
        <DangerZone
          onDeleteAccount={handleDeleteAccount}
          isUpdating={isUpdating}
        />
      </div>

    </div>
  );
};

export default Security;