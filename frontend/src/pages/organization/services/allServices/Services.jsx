import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
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
      <div className="flex h-screen items-center justify-center font-black uppercase tracking-widest text-muted-foreground/50">
        Synchronizing Workspace...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 px-3 py-7 sm:px-4 sm:py-10 md:space-y-10 md:py-16">
      {/* Top Page Header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-black uppercase tracking-tighter sm:text-4xl md:text-6xl">
            Services
          </h1>
          <p className="max-w-2xl text-sm font-medium text-muted-foreground sm:text-base md:text-lg">
            Manage the services customers can book from your active organization.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreate}
          className="h-11 cursor-pointer rounded-xl px-4 text-xs font-black uppercase tracking-widest shadow-sm sm:h-12 sm:px-5 sm:text-sm"
        >
          <Plus className="h-4 w-4" />
          New Service
        </Button>
      </div>

      {!activeOrganizationId && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm font-medium text-amber-700 shadow-sm">
          Choose an active organization before creating services.
        </div>
      )}

      {/* Service Cards Grid */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
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
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center shadow-sm">
          <h3 className="text-lg font-black uppercase tracking-tight">No Services Yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium text-muted-foreground">
            Create your first bookable service from the button above.
          </p>
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