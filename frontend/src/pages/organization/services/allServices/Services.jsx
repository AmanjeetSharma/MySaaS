import { useEffect, useState, useMemo } from 'react';
import { Plus, Search, X, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useServiceStore, useUserStore } from '@/stores';
import ServiceCard, { CreateServiceCard } from './ServiceCard';
import ServiceModal from './ServiceModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const getEntityId = (entity) => {
  if (!entity) return null;
  if (typeof entity === 'string') return entity;
  return entity._id || entity.id || null;
};

export default function Services() {
  const navigate = useNavigate();
  const {
    services,
    getOrganizationServices,
    createService,
    deleteService,
    toggleServiceStatus,
    clearServices,
    isLoading,
  } = useServiceStore();

  const { userProfile, getUserProfile } = useUserStore();
  const [modalMode, setModalMode] = useState(null);
  const [cardAction, setCardAction] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteServiceTarget, setDeleteServiceTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const activeOrganizationId = getEntityId(userProfile?.activeOrganization);
  const isModalOpen = modalMode === 'create';

  useEffect(() => {
    if (!userProfile) {
      getUserProfile();
    }
  }, [getUserProfile, userProfile]);

  useEffect(() => {
    if (activeOrganizationId) {
      getOrganizationServices(activeOrganizationId).catch((error) => {
        toast.error(error?.response?.data?.message || 'Failed to load services');
      });
    } else {
      clearServices();
    }
  }, [activeOrganizationId, clearServices, getOrganizationServices]);

  const openCreate = () => {
    if (!activeOrganizationId) {
      toast.error('Select or create an active organization first');
      return;
    }
    setModalMode('create');
  };

  const closeModal = () => {
    setModalMode(null);
  };

  const handleCreateSave = async (payload) => {
    setSaveLoading(true);

    try {
      await createService(payload);
      toast.success('Service created successfully');
      closeModal();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to create service');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleStatus = async (service) => {
    setCardAction(`status:${service._id}`);

    try {
      const result = await toggleServiceStatus(service._id);
      toast.success(result?.message || 'Service status updated');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Status update failed');
    } finally {
      setCardAction(null);
    }
  };

  const handleManageService = (service) => {
    if (!service?._id || !activeOrganizationId) return;
    navigate(`/organizations/${activeOrganizationId}/services/${service._id}`);
  };

  const handleDelete = async (serviceId) => {
    setIsDeleting(true);
    try {
      await deleteService(serviceId);
      setDeleteServiceTarget(null);
      toast.success('Service deleted successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  // Comprehensive Filter & Search Logic
  const filteredServices = useMemo(() => {
    const list = services || [];
    return list.filter((item) => {
      // Filter tab category
      if (activeFilter === 'active' && !item.isActive) return false;
      if (activeFilter === 'inactive' && item.isActive) return false;
      if (activeFilter === 'online' && item.mode !== 'ONLINE') return false;
      if (activeFilter === 'offline' && item.mode !== 'OFFLINE') return false;

      // Search term matching across multiple attributes
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const nameMatch = item.name?.toLowerCase().includes(query);
        const descMatch = item.description?.toLowerCase().includes(query);
        const cityMatch = item.address?.city?.toLowerCase().includes(query);
        const stateMatch = item.address?.state?.toLowerCase().includes(query);
        const providerMatch =
          item.meetingProvider?.toLowerCase().replace(/_/g, ' ').includes(query) ||
          item.meetingProvider?.toLowerCase().includes(query);
        const modeMatch = item.mode?.toLowerCase().includes(query);
        const freeMatch =
          query === 'free' && (!item.price || Number(item.price) === 0);
        const priceMatch = String(item.price || '').includes(query);

        if (
          !nameMatch &&
          !descMatch &&
          !cityMatch &&
          !stateMatch &&
          !providerMatch &&
          !modeMatch &&
          !freeMatch &&
          !priceMatch
        ) {
          return false;
        }
      }

      return true;
    });
  }, [services, activeFilter, searchQuery]);

  // Counts for filter tabs
  const counts = useMemo(() => {
    const list = services || [];
    return {
      all: list.length,
      active: list.filter((s) => s.isActive).length,
      inactive: list.filter((s) => !s.isActive).length,
      online: list.filter((s) => s.mode === 'ONLINE').length,
      offline: list.filter((s) => s.mode === 'OFFLINE').length,
    };
  }, [services]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5 sm:pb-6">
          <div className="space-y-2">
            <Skeleton className="h-7 w-36 sm:w-44" />
            <Skeleton className="h-4 w-64 sm:w-80" />
          </div>
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-border/70 bg-card/40 p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-16 w-full rounded-2xl" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-10 flex-1 rounded-xl" />
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5 sm:pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Services
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Configure and manage your services, including online and offline offerings, pricing, and availability.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={openCreate}
          className="h-9 px-3.5 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer rounded-xl shadow-2xs active:scale-[0.98] transition-all self-start sm:self-auto shrink-0"
        >
          <Plus className="h-3.5 w-3.5 shrink-0" />
          <span>New Service</span>
        </Button>
      </div>

      {/* No Active Organization Banner */}
      {!activeOrganizationId && (
        <div className="flex items-center gap-2.5 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-xs sm:text-sm text-warning font-medium">
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
          <span>No active workspace selected. Please select or launch a workspace to manage services.</span>
        </div>
      )}

      {/* Toolbar: Search + Filter Tabs (Only shown when services exist) */}
      {activeOrganizationId && services.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Box with Clear Details of Searchable Fields */}
            <div className="relative w-full sm:w-80 md:w-96">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchQuery('');
                }}
                placeholder="Search by name, description, location, or provider..."
                className="h-9 rounded-xl border-border bg-surface pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground/80 shadow-2xs focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  title="Clear search (Esc)"
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-elevated cursor-pointer transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Segment Tabs */}
            <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-surface-sunken border border-border-subtle text-xs">
              {[
                { id: 'all', label: 'All', count: counts.all },
                { id: 'active', label: 'Active', count: counts.active },
                { id: 'inactive', label: 'Inactive', count: counts.inactive },
                { id: 'online', label: 'Online', count: counts.online },
                { id: 'offline', label: 'Offline', count: counts.offline },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all cursor-pointer ${activeFilter === tab.id
                      ? 'bg-surface-elevated text-foreground font-semibold border border-border shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated/40'
                    }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${activeFilter === tab.id
                        ? 'bg-surface text-foreground font-semibold'
                        : 'bg-surface-elevated/80 text-muted-foreground'
                      }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Search Results Feedback Counter */}
          {searchQuery.trim() && (
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pt-0.5">
              <span>
                Found <strong className="font-semibold text-foreground">{filteredServices.length}</strong> {filteredServices.length === 1 ? 'service' : 'services'} matching &ldquo;<span className="text-foreground">{searchQuery}</span>&rdquo;
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-primary hover:underline cursor-pointer font-medium"
              >
                Reset search
              </button>
            </div>
          )}
        </div>
      )}

      {/* Services Responsive Grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
      {filteredServices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service._id}
              service={service}
              actionLoading={{
                status: cardAction === `status:${service._id}`,
              }}
              onToggleStatus={handleToggleStatus}
              onManageService={handleManageService}
              onDelete={(svc) => setDeleteServiceTarget(svc)}
            />
          ))}

          {/* Create Service Card in grid when viewing all services without active search */}
          {activeFilter === 'all' && !searchQuery.trim() && (
            <CreateServiceCard onClick={openCreate} />
          )}
        </div>
      )}

      {/* Filtered Empty State (Search / Filter returned 0 results) */}
      {activeOrganizationId && services.length > 0 && filteredServices.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-surface-sunken/40 px-4 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border-subtle bg-surface text-subtle-foreground shadow-2xs">
            <Search className="h-5 w-5" />
          </div>
          <h3 className="font-heading mt-3.5 text-base font-semibold text-foreground">
            No matching services found
          </h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
            {searchQuery
              ? `No services match "${searchQuery}". Try searching by service name, description, location (city/state), or meeting provider.`
              : 'No services match the selected filter category.'}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
            className="mt-4 h-9 rounded-xl text-xs font-medium cursor-pointer"
          >
            Clear search &amp; filters
          </Button>
        </div>
      )}

      {/* Initial Empty State (No services in organization yet) */}
      {activeOrganizationId && services.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          <CreateServiceCard onClick={openCreate} />
        </div>
      )}

      {/* Create Service Modal */}
      {activeOrganizationId && (
        <ServiceModal
          key="create-new"
          open={isModalOpen}
          mode="create"
          service={null}
          organizationId={activeOrganizationId}
          isUpdating={saveLoading}
          onOpenChange={(open) => {
            if (!open) closeModal();
          }}
          onSubmit={handleCreateSave}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteServiceTarget && (
        <Dialog open={!!deleteServiceTarget} onOpenChange={() => setDeleteServiceTarget(null)}>
          <DialogContent className="sm:max-w-sm rounded-2xl border-border bg-card text-card-foreground [&>button]:cursor-pointer [&>button]:rounded-full [&>button]:p-1.5">
            <DialogHeader className="space-y-2 text-left">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-semibold text-foreground tracking-tight">
                Delete Service
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-normal">
                Are you sure you want to delete <span className="font-semibold text-foreground underline">{deleteServiceTarget.name}</span>? This action is permanent and cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 pt-2 justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-8 rounded-lg text-xs font-medium cursor-pointer"
                onClick={() => setDeleteServiceTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                className="h-8 rounded-lg text-xs font-medium cursor-pointer shadow-2xs"
                onClick={() => handleDelete(deleteServiceTarget._id)}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}