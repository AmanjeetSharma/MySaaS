import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Plus,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Skeleton } from "@/components/ui/skeleton";

import DealDetailsCard from "@/components/crm/deal/DealDetailsCard";
import DealEditDialog from "@/components/crm/deal/DealEditDialog";
import DealStatusDialog from "@/components/crm/deal/DealStatusDialog";
import DealActivity from "@/components/crm/deal/DealActivity";
import ActivityFormDialog from "@/components/crm/deal/ActivityFormDialog";

import {
  useDealStore,
  useActivityStore,
} from "@/stores";

const DealDetails = () => {
  const navigate = useNavigate();

  const { dealId } = useParams();

  const {
    currentDeal,
    activitiesByDealId,

    getDealById,
    getDealActivities,

    deleteDeal,

    isLoading,
    isActivitiesLoading,
    isUpdating,
  } = useDealStore();

  const {
    deleteActivity,
  } = useActivityStore();

  const [isEditOpen, setIsEditOpen] =
    useState(false);

  const [isStatusOpen, setIsStatusOpen] =
    useState(false);

  const [isActivityOpen, setIsActivityOpen] =
    useState(false);

  const [editingActivity, setEditingActivity] =
    useState(null);

  const [activityDialogMode, setActivityDialogMode] =
    useState("create");

  const [deleteDealOpen, setDeleteDealOpen] =
    useState(false);

  const [deleteActivityOpen, setDeleteActivityOpen] =
    useState(false);

  const [selectedActivity, setSelectedActivity] =
    useState(null);

  const activityFeed =
    activitiesByDealId?.[dealId];

  const activities =
    activityFeed?.activities || [];

  const hasMore =
    activityFeed?.hasMore || false;

  const nextCursor =
    activityFeed?.nextCursor || null;

  useEffect(() => {
    if (!dealId) return;

    const loadData = async () => {
      try {
        await Promise.all([
          getDealById(dealId),
          getDealActivities(dealId),
        ]);
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, [
    dealId,
    getDealById,
    getDealActivities,
  ]);

  const handleLoadMore =
    async () => {
      try {
        await getDealActivities(
          dealId,
          {
            cursor: nextCursor,
            append: true,
          }
        );
      } catch (error) {
        console.error(error);
      }
    };

  const handleDeleteDeal =
    async () => {
      try {
        await deleteDeal(dealId);

        navigate("/customers");
      } catch (error) {
        console.error(error);
      }
    };

  const handleDeleteActivity =
    async () => {
      if (!selectedActivity) return;

      try {
        await deleteActivity(
          selectedActivity._id,
          {
            activity:
              selectedActivity,
            dealId,
          }
        );

        setDeleteActivityOpen(
          false
        );
      } catch (error) {
        console.error(error);
      }
    };

  const openCreateActivity =
    () => {
      setEditingActivity(null);

      setActivityDialogMode(
        "create"
      );

      setIsActivityOpen(true);
    };

  const openEditActivity =
    (activity) => {
      setEditingActivity(
        activity
      );

      setActivityDialogMode(
        "edit"
      );

      setIsActivityOpen(true);
    };

  const openDeleteActivity =
    (activity) => {
      setSelectedActivity(
        activity
      );

      setDeleteActivityOpen(
        true
      );
    };

  if (
    isLoading &&
    !currentDeal
  ) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />

        <Skeleton className="h-56 w-full" />

        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!currentDeal) {
    return (
      <div className="flex items-center justify-center py-16">
        Deal not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() =>
            navigate(-1)
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />

          Back
        </Button>

        <Button
          onClick={
            openCreateActivity
          }
        >
          <Plus className="mr-2 h-4 w-4" />

          Add Activity
        </Button>
      </div>

      {/* Deal Details */}

      <DealDetailsCard
        deal={currentDeal}
        onEdit={() =>
          setIsEditOpen(true)
        }
        onStatus={() =>
          setIsStatusOpen(true)
        }
        onDelete={() =>
          setDeleteDealOpen(
            true
          )
        }
      />

      {/* Activities */}

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">
            Activity Timeline
          </h2>

          <p className="text-sm text-muted-foreground">
            Complete history of
            customer interactions.
          </p>
        </div>

        {activities.length ===
          0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No activities yet.
            </p>

            <Button
              size="sm"
              className="mt-4"
              onClick={
                openCreateActivity
              }
            >
              Create First
              Activity
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map(
              (
                activity
              ) => (
                <DealActivity
                  key={
                    activity._id
                  }
                  activity={
                    activity
                  }
                  onEdit={() =>
                    openEditActivity(
                      activity
                    )
                  }
                  onDelete={() =>
                    openDeleteActivity(
                      activity
                    )
                  }
                />
              )
            )}
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={
                handleLoadMore
              }
              disabled={
                isActivitiesLoading
              }
            >
              {isActivitiesLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Edit Deal */}

      <DealEditDialog
        open={isEditOpen}
        onOpenChange={
          setIsEditOpen
        }
        deal={currentDeal}
      />

      {/* Status */}

      <DealStatusDialog
        open={isStatusOpen}
        onOpenChange={
          setIsStatusOpen
        }
        deal={currentDeal}
      />

      {/* Activity */}

      <ActivityFormDialog
        open={
          isActivityOpen
        }
        onOpenChange={
          setIsActivityOpen
        }
        mode={
          activityDialogMode
        }
        dealId={dealId}
        activity={
          editingActivity
        }
      />

      {/* Delete Deal */}

      <AlertDialog
        open={
          deleteDealOpen
        }
        onOpenChange={
          setDeleteDealOpen
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Deal
            </AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={
                handleDeleteDeal
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Activity */}

      <AlertDialog
        open={
          deleteActivityOpen
        }
        onOpenChange={
          setDeleteActivityOpen
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Activity
            </AlertDialogTitle>

            <AlertDialogDescription>
              This activity will
              be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={
                handleDeleteActivity
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DealDetails;