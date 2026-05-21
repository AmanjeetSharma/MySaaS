import { useEffect, useState } from 'react';
import {
  CalendarClock,
  Copy,
  Edit3,
  IndianRupee,
  Link2,
  MapPin,
  Plus,
  RefreshCw,
  Trash2,
  Video,
  WalletCards,
} from 'lucide-react';
import { toast } from 'sonner';
import { useServiceStore, useUserStore } from '@/stores';
import ServiceModal from './ServiceModal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const getEntityId = (entity) => {
  if (!entity) return null;
  if (typeof entity === 'string') return entity;
  return entity._id || entity.id || null;
};

const formatPrice = (service) => {
  const amount = Number(service?.price || 0);

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: service?.currency || 'INR',
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${service?.currency || 'INR'} ${amount}`;
  }
};

const formatAddress = (address) => {
  if (!address) return 'No address added';

  return [
    address.street,
    address.city,
    address.state,
    address.country,
    address.zipCode,
  ].filter(Boolean).join(', ') || 'No address added';
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

const ServiceCard = ({
  service,
  actionLoading,
  onEdit,
  onDelete,
  onToggleStatus,
  onCopyUrl,
  onSyncSlug,
}) => {
  const isOffline = service.mode === 'OFFLINE';

  return (
    <div className={`group relative flex flex-col rounded-2xl border bg-card p-4 transition-all duration-300 hover:shadow-2xl sm:rounded-[1.5rem] sm:p-6 ${service.isActive ? 'border-primary/40 shadow-primary/5' : 'border-border/70'}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/10 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
          {isOffline ? <MapPin className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
          {service.mode}
        </span>

        <div className="flex shrink-0 items-center pt-0.5">
          <Switch
            checked={!!service.isActive}
            onCheckedChange={() => onToggleStatus(service)}
            disabled={actionLoading.status}
            className="cursor-pointer"
          />
        </div>
      </div>

      <div className="mt-5 flex-1 sm:mt-7">
        <h3 className="wrap-break-word text-lg font-black uppercase tracking-tight sm:text-2xl">{service.name}</h3>
        <p className="mt-2 min-h-10 text-xs font-medium leading-relaxed text-muted-foreground line-clamp-2 sm:mt-3 sm:min-h-12 sm:text-sm sm:line-clamp-3">
          {service.description || 'No description added yet.'}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3">
          <div className="rounded-xl bg-muted/50 p-3 sm:rounded-2xl">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              Duration
            </div>
            <div className="mt-1 text-sm font-black">{service.durationInMinutes} min</div>
          </div>

          <div className="rounded-xl bg-muted/50 p-3 sm:rounded-2xl">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {service.currency === 'INR' ? <IndianRupee className="h-3.5 w-3.5" /> : <WalletCards className="h-3.5 w-3.5" />}
              Price
            </div>
            <div className="mt-1 text-sm font-black">{formatPrice(service)}</div>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-border/60 p-3 sm:mt-4 sm:rounded-2xl">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {isOffline ? <MapPin className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
            {isOffline ? 'Address' : 'Meeting'}
          </div>
          <p className="mt-1 wrap-break-word text-sm font-medium text-foreground/90">
            {isOffline ? formatAddress(service.address) : service.autoGenerateMeetingLink ? 'Auto Google Meet link enabled' : 'Meeting link will not be auto-generated'}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-border/60 px-3 py-2">
          <span className="min-w-0 truncate text-xs font-bold text-muted-foreground">
            /{service.slug}
          </span>
          {service.isSlugStale && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSyncSlug(service)}
              disabled={actionLoading.sync}
              className="h-8 shrink-0 cursor-pointer rounded-lg text-[10px] font-black uppercase tracking-widest"
            >
              <RefreshCw className="h-3 w-3" />
              {actionLoading.sync ? 'Syncing' : 'Sync Url'}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-[1fr_1fr_44px]">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onEdit(service)}
          className="h-10 cursor-pointer rounded-xl text-xs font-black uppercase tracking-widest sm:h-11"
        >
          <Edit3 className="h-4 w-4" />
          Edit
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onCopyUrl(service)}
          disabled={actionLoading.copy}
          className="h-10 cursor-pointer rounded-xl text-xs font-black tracking-widest sm:h-11"
        >
          <Copy className="h-4 w-4" />
          {actionLoading.copy ? 'Copying' : 'Copy public URL'}
        </Button> 
        <Button
          type="button"
          variant="destructive"
          onClick={() => onDelete(service)}
          className="col-span-2 h-10 cursor-pointer rounded-xl sm:col-span-1 sm:h-11"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
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
        Loading Services...
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
          className="h-11 cursor-pointer rounded-xl px-4 text-xs font-black uppercase tracking-widest sm:h-12 sm:px-5 sm:text-sm"
        >
          <Plus className="h-4 w-4" />
          New Service
        </Button>
      </div>

      {!activeOrganizationId && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm font-medium text-amber-700">
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
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
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
          <DialogContent className="rounded-[1rem] sm:max-w-md">
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
