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
import ActivityCreateDialog from "@/components/crm/deal/ActivityCreateDialog";
import ActivityDetailsDialog from "@/components/crm/deal/ActivityDetailsDialog";

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

  // Primary state configs
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [deleteDealOpen, setDeleteDealOpen] = useState(false);
  const [deleteActivityOpen, setDeleteActivityOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // New Unified Details & Edit Dialog States
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsDialogMode, setDetailsDialogMode] = useState("view");
  const [activeActivityId, setActiveActivityId] = useState(null);

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
    const customerId = currentDeal?.customer?._id; // Storing the customer ID before deleting the deal to avoid invalid reference after deletion
    try { await deleteDeal(dealId); navigate(`/customers/${customerId}`); }
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
    setIsActivityOpen(true);
  };

  // Callback mapping from truncated DealActivity cards
  const handleViewDetails = (activity) => {
    setActiveActivityId(activity._id);
    setDetailsDialogMode("view");
    setDetailsDialogOpen(true);
  };

  const handleEditActivity = (activity) => {
    setActiveActivityId(activity._id);
    setDetailsDialogMode("edit");
    setDetailsDialogOpen(true);
  };

  const openDeleteActivity = (activity) => {
    setSelectedActivity(activity);
    setDeleteActivityOpen(true);
  };

  if (isLoading && !currentDeal) {
    return (
      <div className="px-2 md:px-6 py-4 md:py-8 max-w-360 mx-auto w-full">
        <Skeleton className="h-9 w-40 mb-6 md:mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-4 sm:gap-6">
          <Skeleton className="h-75 lg:h-100 rounded-xl" />
          <Skeleton className="h-125 lg:h-150 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!currentDeal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
        <div className="space-y-2 max-w-sm">
          <h2 className="text-base sm:text-lg font-semibold tracking-tight">Deal not found</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            The deal you are looking for might have been deleted or the URL is incorrect.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-6 h-8 sm:h-9 text-xs sm:text-sm rounded-xl cursor-pointer"
          onClick={() => navigate("/deals")}
        >
          <ArrowLeft className="mr-1.5 sm:mr-2 h-4 w-4" />
          Back to Deals
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6 lg:py-8 max-w-360 mx-auto min-h-screen lg:h-screen flex flex-col">
      {/* Top Navigation */}
      <div className="flex items-center justify-between shrink-0 mb-4 sm:mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm text-muted-foreground hover:text-foreground -ml-2"
          onClick={() => navigate(`/customers/${currentDeal.customer._id}`)}
        >
          <ArrowLeft className="mr-1.5 sm:mr-2 h-4 w-4" />
          Back to customer
        </Button>
      </div>

      {/* Main Content Grid - 40/60 Split */}
      <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-4 sm:gap-6 flex-1 min-h-0">
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
        <Card className="flex flex-col border-border/50 shadow-sm rounded-xl overflow-hidden min-h-[400px] lg:min-h-0">
          <CardHeader className="border-b bg-background/50 py-3 px-4 sm:py-4 sm:px-6 flex flex-row items-center justify-between space-y-0 shrink-0">
            <div className="space-y-0.5 max-w-[60%] sm:max-w-none">
              <h2 className="text-xs sm:text-sm font-semibold tracking-tight">Activity Timeline</h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden xs:block">
                Track interactions and milestones
              </p>
            </div>
            <Button
              size="sm"
              className="h-7 sm:h-8 text-[11px] sm:text-xs font-medium cursor-pointer shrink-0 px-2.5 sm:px-3"
              onClick={openCreateActivity}
            >
              <Plus className="mr-1 sm:mr-1.5 h-3.5 w-3.5" />
              Add activity
            </Button>
          </CardHeader>

          <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="h-full px-4 py-4 sm:px-6 sm:py-6">
              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <div className="relative flex flex-col items-center">
                    <div className="w-px h-12 sm:h-16 bg-border" />
                    <div className="h-3 w-3 rounded-full border-2 border-border bg-background absolute top-2" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-6 mb-4">
                    No activities logged yet
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 sm:h-8 text-[11px] sm:text-xs cursor-pointer"
                    onClick={openCreateActivity}
                  >
                    <Plus className="mr-1 sm:mr-1.5 h-3.5 w-3.5" />
                    Log first activity
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {groups.map((group, gi) => {
                    const isLastGroup = gi === groups.length - 1;
                    return (
                      <div key={group.label} className="space-y-3">
                        <div className="flex items-center gap-2 sm:gap-4">
                          <div className="flex-1 h-px bg-border/60" />
                          <Badge
                            variant="outline"
                            className="text-[9px] sm:text-[10px] font-medium text-muted-foreground rounded-full px-2.5 sm:px-3 py-0.5 shrink-0 bg-background"
                          >
                            {group.label}
                          </Badge>
                          <div className="flex-1 h-px bg-border/60" />
                        </div>

                        <div className="space-y-1">
                          {group.items.map((activity, ai) => {
                            const isLast = isLastGroup && ai === group.items.length - 1;
                            return (
                              <DealActivity
                                key={activity._id}
                                activity={activity}
                                isLast={isLast}
                                onViewDetails={handleViewDetails}
                                onEdit={handleEditActivity}
                                onDelete={openDeleteActivity}
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
                <div className="flex justify-center pt-4 sm:pt-6 pb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 sm:h-8 text-[11px] sm:text-xs font-medium cursor-pointer"
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

      {/* Shared Dialogs Matrix */}
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

      {/* Creation Mode Only Form Dialog */}
      <ActivityCreateDialog
        open={isActivityOpen}
        onOpenChange={setIsActivityOpen}
        dealId={dealId}
      />

      {/* New Unified Details View & Edit Mode Dialog */}
      <ActivityDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        activityId={activeActivityId}
        initialMode={detailsDialogMode}
      />

      {/* Delete Deal Confirmation */}
      <AlertDialog open={deleteDealOpen} onOpenChange={setDeleteDealOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              This will permanently delete this deal and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="text-xs sm:text-sm h-9 rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-xs sm:text-sm h-9 rounded-xl" onClick={handleDeleteDeal}>
              Delete deal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Activity Confirmation */}
      <AlertDialog open={deleteActivityOpen} onOpenChange={setDeleteActivityOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">Delete activity</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              This will permanently delete this activity and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="text-xs sm:text-sm h-9 rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-xs sm:text-sm h-9 rounded-xl" onClick={handleDeleteActivity}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DealDetails;