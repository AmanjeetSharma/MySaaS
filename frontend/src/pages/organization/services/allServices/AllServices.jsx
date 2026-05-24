import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useServiceStore, useUserStore } from '@/stores';
import ServiceCard from './ServiceCard';
import ServiceModal from './ServiceModal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const getEntityId = (entity) => {
  if (!entity) return null;
  if (typeof entity === 'string') return entity;
  return entity._id || entity.id || null;
};

const copyToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

export default function AllServices() {
  const {
    services,
    getOrganizationServices,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    toggleAutoGenerateMeetingLink,
    getPublicServiceUrl,
    syncServiceSlug,
    clearServices,
    isLoading,
  } = useServiceStore();

  const { userProfile, getUserProfile } = useUserStore();
  const [modalMode, setModalMode] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [cardAction, setCardAction] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const activeOrganizationId = getEntityId(userProfile?.activeOrganization);
  const isModalOpen = modalMode === 'create' || modalMode === 'edit';

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

    setSelectedService(null);
    setModalMode('create');
  };

  const openEdit = (service) => {
    setSelectedService(service);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedService(null);
  };

  const handleSave = async (payload) => {
    setSaveLoading(true);

    try {
      if (modalMode === 'edit' && selectedService?._id) {
        await updateService(selectedService._id, payload);
        toast.success('Service updated');
      } else {
        await createService(payload);
        toast.success('Service created');
      }

      closeModal();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to save service');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?._id) return;

    setDeleteLoading(true);

    try {
      await deleteService(deleteTarget._id);
      setDeleteTarget(null);
      toast.success('Service deleted');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Delete failed');
    } finally {
      setDeleteLoading(false);
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

  const handleToggleMeetingLink = async (service) => {
    setCardAction(`meeting:${service._id}`);

    try {
      const result = await toggleAutoGenerateMeetingLink(service._id);
      toast.success(result?.message || 'Meeting link setting updated');
      return result;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Meeting link update failed');
      throw error;
    } finally {
      setCardAction(null);
    }
  };

  const handleCopyUrl = async (service) => {
    setCardAction(`copy:${service._id}`);

    try {
      const publicUrl = await getPublicServiceUrl(service._id);

      await copyToClipboard(publicUrl);
      toast.success('Public URL copied');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to copy URL');
    } finally {
      setCardAction(null);
    }
  };

  const handleSyncSlug = async (service) => {
    setCardAction(`sync:${service._id}`);

    try {
      await syncServiceSlug(service._id);
      toast.success('Service URL synced');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'URL sync failed');
    } finally {
      setCardAction(null);
    }
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

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <ServiceCard
            key={service._id}
            service={service}
            actionLoading={{
              status: cardAction === `status:${service._id}`,
              copy: cardAction === `copy:${service._id}`,
              sync: cardAction === `sync:${service._id}`,
            }}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onToggleStatus={handleToggleStatus}
            onCopyUrl={handleCopyUrl}
            onSyncSlug={handleSyncSlug}
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

      {activeOrganizationId && (
        <ServiceModal
          key={`${modalMode}-${selectedService?._id || 'new'}`}
          open={isModalOpen}
          mode={modalMode}
          service={selectedService}
          organizationId={activeOrganizationId}
          isUpdating={saveLoading}
          isMeetingLinkUpdating={cardAction === `meeting:${selectedService?._id}`}
          onOpenChange={(open) => {
            if (!open) closeModal();
          }}
          onSubmit={handleSave}
          onToggleMeetingLink={handleToggleMeetingLink}
        />
      )}

      {deleteTarget && (
        <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent className="rounded-xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-black uppercase tracking-tight text-destructive">
                Delete Service
              </DialogTitle>
              <DialogDescription className="font-medium">
                Are you sure you want to delete <span className="font-bold text-foreground">{deleteTarget.name}</span>? This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-3 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                className="h-11 flex-1 cursor-pointer rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="h-11 flex-1 cursor-pointer rounded-xl font-bold"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
