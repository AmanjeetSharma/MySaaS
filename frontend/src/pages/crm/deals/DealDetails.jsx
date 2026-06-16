import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { isToday, isYesterday, differenceInCalendarDays, format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import DealDetailsCard from "@/components/crm/deal/DealDetailsCard";
import DealEditDialog from "@/components/crm/deal/DealEditDialog";
import DealStatusDialog from "@/components/crm/deal/DealStatusDialog";
import DealActivity from "@/components/crm/deal/DealActivity";
import ActivityFormDialog from "@/components/crm/deal/ActivityFormDialog";

import { useDealStore, useActivityStore } from "@/stores";

function groupActivitiesByDay(activities) {
  const map = new Map();
  activities.forEach((a) => {
    const key = new Date(a.createdAt).toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(a);
  });

  return Array.from(map.entries()).map(([key, items]) => {
    const date = new Date(key);
    const diff = differenceInCalendarDays(new Date(), date);
    let label = "Today";
    if (isYesterday(date)) label = "Yesterday";
    else if (!isToday(date) && diff < 7) label = `${diff} days ago`;
    else if (diff >= 7) label = format(date, "dd MMM yyyy");
    return { label, items };
  });
}

const DealDetails = () => {
  const navigate = useNavigate();
  const { dealId } = useParams();

  const {
    currentDeal, activitiesByDealId,
    getDealById, getDealActivities,
    updateDeal, updateDealStatus, deleteDeal,
    isLoading, isActivitiesLoading, isUpdating,
  } = useDealStore();

  const { deleteActivity } = useActivityStore();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityDialogMode, setActivityDialogMode] = useState("create");
  const [deleteDealOpen, setDeleteDealOpen] = useState(false);
  const [deleteActivityOpen, setDeleteActivityOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const activityFeed = activitiesByDealId?.[dealId];
  const activities = activityFeed?.activities || [];
  const hasMore = activityFeed?.hasMore || false;
  const nextCursor = activityFeed?.nextCursor || null;
  const groups = groupActivitiesByDay(activities);

  useEffect(() => {
    if (!dealId) return;
    (async () => {
      try {
        await getDealById(dealId);
        await getDealActivities(dealId);
      } catch (err) { console.error(err); }
    })();
  }, [dealId]);

  const handleDealUpdate = async (title) => {
    try { await updateDeal(currentDeal._id, { title }); setIsEditOpen(false); }
    catch (err) { console.error(err); }
  };

  const handleStatusUpdate = async (status) => {
    try { await updateDealStatus(currentDeal._id, status); setIsStatusOpen(false); }
    catch (err) { console.error(err); }
  };

  const handleLoadMore = async () => {
    try { await getDealActivities(dealId, { cursor: nextCursor, append: true }); }
    catch (err) { console.error(err); }
  };

  const handleDeleteDeal = async () => {
    try { await deleteDeal(dealId); navigate(`/customers/${currentDeal.customerId}`); }
    catch (err) { console.error(err); }
  };

  const handleDeleteActivity = async () => {
    if (!selectedActivity) return;
    try {
      await deleteActivity(selectedActivity._id, { activity: selectedActivity, dealId });
      setDeleteActivityOpen(false);
    } catch (err) { console.error(err); }
  };

  const openCreateActivity = () => {
    setEditingActivity(null);
    setActivityDialogMode("create");
    setIsActivityOpen(true);
  };

  const openEditActivity = (activity) => {
    setEditingActivity(activity);
    setActivityDialogMode("edit");
    setIsActivityOpen(true);
  };

  const openDeleteActivity = (activity) => {
    setSelectedActivity(activity);
    setDeleteActivityOpen(true);
  };

  if (isLoading && !currentDeal) {
    return (
      <div className="px-6 py-8 max-w-[1440px] mx-auto">
        <Skeleton className="h-9 w-40 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[600px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!currentDeal) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        Deal not found.
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-[1440px] mx-auto h-screen flex flex-col">
      {/* Top Navigation */}
      <div className="flex items-center justify-between shrink-0 mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-3 text-muted-foreground hover:text-foreground -ml-2"
          onClick={() => navigate(`/customers/${currentDeal.customer._id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to customer
        </Button>
      </div>

      {/* Main Content Grid - 40/60 Split */}
      <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6 flex-1 min-h-0">
        {/* Left Column - Deal Info (40%) */}
        <div className="min-h-0">
          <DealDetailsCard
            deal={currentDeal}
            onEdit={() => setIsEditOpen(true)}
            onStatus={() => setIsStatusOpen(true)}
            onDelete={() => setDeleteDealOpen(true)}
          />
        </div>

        {/* Right Column - Activity Timeline (60%) */}
        <Card className="flex flex-col border-border/50 shadow-sm rounded-xl overflow-hidden min-h-0">
          <CardHeader className="border-b bg-background/50 py-4 px-6 flex flex-row items-center justify-between space-y-0 shrink-0">
            <div className="space-y-0.5">
              <h2 className="text-sm font-semibold tracking-tight">Activity Timeline</h2>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Track interactions and milestones
              </p>
            </div>
            <Button 
              size="sm" 
              className="h-8 text-xs font-medium cursor-pointer shrink-0" 
              onClick={openCreateActivity}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add activity
            </Button>
          </CardHeader>

          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full px-6 py-6">
              {activities.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <div className="relative flex flex-col items-center">
                    <div className="w-px h-16 bg-border" />
                    <div className="h-3 w-3 rounded-full border-2 border-border bg-background absolute top-2" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-6 mb-4">
                    No activities logged yet
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 text-xs" 
                    onClick={openCreateActivity}
                  >
                    Log first activity
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {groups.map((group, gi) => {
                    const isLastGroup = gi === groups.length - 1;
                    return (
                      <div key={group.label} className="space-y-3">
                        {/* Date Separator */}
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-px bg-border/60" />
                          <Badge
                            variant="outline"
                            className="text-[10px] font-medium text-muted-foreground rounded-full px-3 py-0.5 shrink-0 bg-background"
                          >
                            {group.label}
                          </Badge>
                          <div className="flex-1 h-px bg-border/60" />
                        </div>

                        {/* Activities */}
                        <div className="space-y-1">
                          {group.items.map((activity, ai) => {
                            const isLast = isLastGroup && ai === group.items.length - 1;
                            return (
                              <DealActivity
                                key={activity._id}
                                activity={activity}
                                isLast={isLast}
                                onEdit={() => openEditActivity(activity)}
                                onDelete={() => openDeleteActivity(activity)}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {hasMore && (
                <div className="flex justify-center pt-6 pb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-medium cursor-pointer"
                    onClick={handleLoadMore}
                    disabled={isActivitiesLoading}
                  >
                    {isActivitiesLoading ? (
                      <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Loading...</>
                    ) : (
                      "Load more activities"
                    )}
                  </Button>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <DealEditDialog 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        deal={currentDeal} 
        isUpdating={isUpdating} 
        onSubmit={handleDealUpdate} 
      />
      <DealStatusDialog 
        open={isStatusOpen} 
        onOpenChange={setIsStatusOpen} 
        deal={currentDeal} 
        isUpdating={isUpdating} 
        onSubmit={handleStatusUpdate} 
      />
      <ActivityFormDialog 
        open={isActivityOpen} 
        onOpenChange={setIsActivityOpen} 
        mode={activityDialogMode} 
        dealId={dealId} 
        activity={editingActivity} 
      />

      <AlertDialog open={deleteDealOpen} onOpenChange={setDeleteDealOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this deal and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDeleteDeal}>
              Delete deal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteActivityOpen} onOpenChange={setDeleteActivityOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete activity</AlertDialogTitle>
            <AlertDialogDescription>
              This activity log entry cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDeleteActivity}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DealDetails;