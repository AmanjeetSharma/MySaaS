import { useEffect, useState } from 'react';
import { Plus, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useServiceStore, useUserStore } from '@/stores';
import ServiceCard from './ServiceCard';
import ServiceModal from './ServiceModal';
import { Button } from '@/components/ui/button';

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
    toggleServiceStatus,
    clearServices,
    isLoading,
  } = useServiceStore();

  const { userProfile, getUserProfile } = useUserStore();
  const [modalMode, setModalMode] = useState(null);
  const [cardAction, setCardAction] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

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

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center font-bold tracking-wider text-muted-foreground/60 text-xs uppercase">
        Synchronizing Workspace...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8">
      {/* Top Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Services
            </h1>
          </div>
          <p className="text-xs font-medium text-muted-foreground sm:text-sm">
            Create and manage your bookable services
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreate}
          className="h-9 min-h-[36px] w-full cursor-pointer rounded-lg px-4 text-xs font-bold uppercase tracking-wider shadow-xs transition-all active:scale-95 sm:w-auto"
        >
          <Plus className="h-3.5 w-3.5 shrink-0" />
          New Service
        </Button>
      </div>

      {!activeOrganizationId && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
          Select or create an active organization to manage services.
        </div>
      )}

      {/* Service Cards Grid */}
      <div className="grid gap-3.5 sm:gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard
            key={service._id}
            service={service}
            actionLoading={{
              status: cardAction === `status:${service._id}`,
            }}
            onToggleStatus={handleToggleStatus}
            onManageService={handleManageService}
          />
        ))}
      </div>

      {activeOrganizationId && services.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/50 px-4 py-12 text-center shadow-2xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-foreground">No Services Found</h3>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Get started by adding your first bookable consultation or offline service above.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={openCreate}
            className="mt-4 h-8 rounded-lg text-xs font-bold cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Service
          </Button>
        </div>
      )}

      {/* Creation Modal */}
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
    </div>
  );
}