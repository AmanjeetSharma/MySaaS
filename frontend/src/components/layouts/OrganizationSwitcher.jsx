// OrganizationSwitcher.jsx

import {
  useEffect,
  useMemo,
} from 'react';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import {
  Building2,
  Check,
  ChevronDown,
  Loader2,
} from 'lucide-react';

import { toast } from 'sonner';

import {
  useOrganizationStore,
  useUserStore,
} from '@/stores';

import { useIsMobile } from '@/hooks/use-mobile';

import { cn } from '@/lib/utils';

export function OrganizationSwitcher() {
  const {
    ownedOrganization,
    memberOrganizations,
    currentOrganization,

    isLoading,
    isUpdating,

    getOrganizations,
    switchOrganization,

    setCurrentOrganization,
    getAllOrganizations,
  } = useOrganizationStore();

  const {
    userProfile,
    getUserProfile,
  } = useUserStore();

  const isMobile = useIsMobile();

  // =========================================================
  // DERIVED STATE
  // =========================================================

  const organizations = useMemo(
    () => getAllOrganizations(),
    [ownedOrganization, memberOrganizations]
  );

  const activeOrganizationId =
    userProfile?.activeOrganization;

  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {
    const initialize = async () => {
      await Promise.all([
        getUserProfile(),
        getOrganizations(),
      ]);
    };

    initialize();
  }, []);

  // =========================================================
  // HYDRATE ACTIVE ORG
  // =========================================================

  useEffect(() => {
    if (
      !activeOrganizationId ||
      organizations.length === 0
    ) {
      return;
    }

    const matchedOrganization =
      organizations.find(
        (org) =>
          org._id ===
          activeOrganizationId
      );

    if (
      matchedOrganization &&
      currentOrganization?._id !==
      matchedOrganization._id
    ) {
      setCurrentOrganization(
        matchedOrganization
      );
    }
  }, [
    activeOrganizationId,
    organizations,
  ]);

  // =========================================================
  // HELPERS
  // =========================================================

  const isOwner = (orgId) => {
    return (
      ownedOrganization?._id === orgId
    );
  };

  // =========================================================
  // SWITCH
  // =========================================================

  const handleSwitch = async (
    orgId
  ) => {
    if (
      currentOrganization?._id ===
      orgId
    ) {
      return;
    }

    try {
      const organization =
        organizations.find(
          (org) => org._id === orgId
        );

      await switchOrganization(orgId);

      await getUserProfile();

      toast.success(
        `Switched to ${organization?.name}`
      );
    } catch (error) {
      toast.error(
        error?.response?.data
          ?.message ||
        error.message ||
        'Failed to switch organization'
      );
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading) {
    return (
      <button
        disabled
        className="
          flex h-10 items-center gap-2
          rounded-xl border border-border/50
          bg-card px-3 text-sm
          text-muted-foreground
        "
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </button>
    );
  }

  // =========================================================
  // EMPTY STATE
  // =========================================================

  if (organizations.length === 0) {
    return (
      <div
        className="
          flex h-10 items-center gap-2
          rounded-xl border border-dashed
          border-border/60 px-3
          text-sm text-muted-foreground
        "
      >
        <Building2 className="h-4 w-4" />
        {!isMobile && 'No Workspace'}
      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            `
              group flex items-center
              justify-between
              transition-all
              hover:bg-accent/50
            `,
            isMobile
              ? `
                  h-10 w-10 rounded-xl
                  border border-border/50
                  bg-card
                `
              : `
                  h-11 min-w-57.5
                  rounded-sm border
                  border-border/50
                  bg-card px-3
                `
          )}
        >
          {isMobile ? (
            <Building2 className="mx-auto h-4 w-4 text-primary" />
          ) : (
            <>
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="
                    flex h-8 w-8
                    items-center justify-center
                    rounded-xl bg-primary/10
                  "
                >
                  <Building2 className="h-4 w-4 text-primary" />
                </div>

                <div className="min-w-0 text-left">
                  <p className="truncate text-sm font-medium">
                    {
                      currentOrganization?.name
                    }
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {isOwner(
                      currentOrganization?._id
                    )
                      ? 'Primary Workspace'
                      : 'Shared Workspace'}
                  </p>
                </div>
              </div>

              <ChevronDown
                className="
                  h-4 w-4 shrink-0
                  text-muted-foreground
                "
              />
            </>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="end"
          className="
            z-50 w-[320px]
            overflow-hidden rounded-2xl
            border border-border/50
            bg-popover p-2 shadow-xl
          "
        >
          <div className="mb-2 px-2 pt-1">
            <p
              className="
                text-[11px]
                font-semibold uppercase
                tracking-wider
                text-muted-foreground
              "
            >
              Workspaces
            </p>
          </div>

          <div className="space-y-1">
            {organizations.map((org) => {
              const active =
                currentOrganization?._id ===
                org._id;

              const owner =
                isOwner(org._id);

              return (
                <DropdownMenu.Item
                  key={org._id}
                  asChild
                >
                  <button
                    onClick={() =>
                      handleSwitch(org._id)
                    }
                    disabled={
                      isUpdating
                    }
                    className={cn(
                      `
                        flex w-full items-center
                        gap-3 rounded-xl
                        px-3 py-3 text-left
                        transition-all
                        hover:bg-accent/60
                      `,
                      active &&
                      'bg-primary/5'
                    )}
                  >
                    <div
                      className="
                        flex h-9 w-9
                        items-center justify-center
                        rounded-xl bg-primary/10
                      "
                    >
                      <Building2
                        className="
                          h-4 w-4 text-primary
                        "
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {org.name}
                        </p>

                        {owner && (
                          <div
                            className="
                              flex items-center gap-1
                              rounded-sm bg-primary/10
                              px-1.5 py-0.5
                              text-[10px]
                              font-medium text-primary
                            "
                          >
                            Owner
                          </div>
                        )}
                      </div>

                      <p
                        className="
                          mt-0.5 text-xs
                          text-muted-foreground
                        "
                      >
                        {owner
                          ? 'Primary workspace'
                          : 'Shared workspace'}
                      </p>
                    </div>

                    {active && (
                      <div
                        className="
                          flex h-5 w-5
                          items-center justify-center
                          rounded-full
                          bg-primary/10
                        "
                      >
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                    )}
                  </button>
                </DropdownMenu.Item>
              );
            })}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}