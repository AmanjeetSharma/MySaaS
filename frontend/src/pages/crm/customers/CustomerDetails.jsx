import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Edit3,
  ExternalLink,
  Mail,
  Phone,
  Plus,
  Trash2,
  User,
  Building2,
} from 'lucide-react';
import { useCustomerStore, useDealStore, useOrganizationStore, useUserStore } from '@/stores';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const getEntityId = (entity) => {
  if (!entity) return null;
  if (typeof entity === 'string') return entity;
  return entity._id || entity.id || null;
};

const getInitials = (name = '') => name
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map(part => part[0]?.toUpperCase())
  .join('') || 'C';

const formatDate = (value) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const formatDateOnly = (value) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const customerFields = [
  { label: 'Name', key: 'name', icon: User, required: true },
  { label: 'Email', key: 'email', icon: Mail, type: 'email' },
  { label: 'Phone', key: 'phone', icon: Phone },
];

function DealCreationDialog({ open, onOpenChange, customer, organizationId, onCreated }) {
  const { createDeal, isUpdating } = useDealStore();
  const [title, setTitle] = useState('New Deal');

  useEffect(() => {
    if (!open) {
      setTitle('New Deal');
    }
  }, [open]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const deal = await createDeal({
      orgId: organizationId,
      customerId: getEntityId(customer),
      title,
    });

    onCreated(deal);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a deal</DialogTitle>
          <DialogDescription>
            Add a new deal for {customer?.name || 'this customer'} and jump straight to the deal page after creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deal-title">Deal title</Label>
            <Input
              id="deal-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Website redesign"
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isUpdating} className="w-full sm:w-auto">
              {isUpdating ? 'Creating...' : 'Create deal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const CustomerDetails = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useUserStore();
  const { currentOrganization } = useOrganizationStore();
  const { currentCustomer, getCustomer, updateCustomer, removeCustomer, isLoading, isUpdating, customerDeals, getCustomerDeals } = useCustomerStore();
  const [customer, setCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDealDialogOpen, setIsDealDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const organizationId = getEntityId(customer?.organization || currentOrganization || userProfile?.activeOrganization);

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const data = await getCustomer(customerId);
        setCustomer(data);
        setForm({
          name: data?.name || '',
          email: data?.email || '',
          phone: data?.phone || '',
        });
      } catch {
        navigate('/customers');
      }
    };

    loadCustomer();
  }, [customerId, getCustomer, navigate]);

  useEffect(() => {
    if (!customerId) return;
    getCustomerDeals(customerId).catch(() => undefined);
  }, [customerId, getCustomerDeals]);

  useEffect(() => {
    if (currentCustomer && getEntityId(currentCustomer) === customerId) {
      setCustomer(currentCustomer);
    }
  }, [currentCustomer, customerId]);

  const dealSummary = useMemo(() => {
    const statistics = customerDeals?.statistics || {};
    return [
      { label: 'Active', value: statistics.active || 0 },
      { label: 'Won', value: statistics.won || 0 },
      { label: 'Lost', value: statistics.lost || 0 },
      { label: 'Total', value: statistics.total || 0 },
    ];
  }, [customerDeals?.statistics]);

  const handleFieldChange = (field) => (event) => {
    setForm(current => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleUpdate = async () => {
    const updated = await updateCustomer(customerId, form);
    const updatedCustomer = updated?.customer || updated;
    setCustomer(current => ({
      ...current,
      ...updatedCustomer,
    }));
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this customer? This cannot be undone.');
    if (!confirmed) return;

    await removeCustomer(customerId);
    navigate('/customers');
  };

  const handleDealCreated = (deal) => {
    const dealId = getEntityId(deal);
    if (dealId) {
      navigate(`/deals/${dealId}`);
    }
  };

  if (isLoading && !customer) {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.9fr)]">
        <div className="space-y-4">
          <div className="h-40 animate-pulse rounded-3xl border border-border/70 bg-muted/30" />
          <div className="h-72 animate-pulse rounded-3xl border border-border/70 bg-muted/30" />
        </div>
        <div className="h-[34rem] animate-pulse rounded-3xl border border-border/70 bg-muted/30" />
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate('/customers')}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to customers
        </button>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={() => navigate(`/customers/${customerId}/timeline`)}>
            <Clock3 className="size-4" />
            Timeline
          </Button>
          <Button className="gap-2" onClick={() => setIsDealDialogOpen(true)}>
            <Plus className="size-4" />
            New deal
          </Button>
        </div>
      </div>

      <section className="rounded-3xl border border-border/70 bg-gradient-to-br from-background via-background to-muted/35 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="size-14 shrink-0">
              <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">{getInitials(customer.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{customer.name}</h1>
                <Badge variant="outline">{customer.source || 'manual'}</Badge>
              </div>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                Update the customer profile, remove the record, and manage the connected deals from the side panel.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="gap-2" onClick={() => setIsEditing((current) => !current)}>
              <Edit3 className="size-4" />
              {isEditing ? 'Close editor' : 'Edit customer'}
            </Button>
            <Button variant="destructive" className="gap-2" onClick={handleDelete} disabled={isUpdating}>
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Created</p>
            <p className="mt-2 text-sm font-medium">{formatDateOnly(customer.createdAt)}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Last updated</p>
            <p className="mt-2 text-sm font-medium">{formatDateOnly(customer.updatedAt)}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Latest interaction</p>
            <p className="mt-2 text-sm font-medium">{formatDateOnly(customer.latestInteractionAt)}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Organization</p>
            <p className="mt-2 truncate text-sm font-medium">{customer.organization?.name || currentOrganization?.name || 'Selected organization'}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.95fr)]">
        <div className="space-y-6">
          <Card className="overflow-hidden border-border/70">
            <CardHeader className="border-b border-border/60">
              <CardTitle>Customer profile</CardTitle>
              <CardDescription>Update the core contact details for this customer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {isEditing ? (
                <div className="space-y-4">
                  {customerFields.map((field) => {
                    const Icon = field.icon;

                    return (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={`customer-${field.key}`} className="flex items-center gap-2">
                          <Icon className="size-4 text-muted-foreground" />
                          {field.label}
                        </Label>
                        <Input
                          id={`customer-${field.key}`}
                          type={field.type || 'text'}
                          value={form[field.key]}
                          onChange={handleFieldChange(field.key)}
                          required={field.required}
                        />
                      </div>
                    );
                  })}

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button onClick={handleUpdate} disabled={isUpdating}>
                      {isUpdating ? 'Saving...' : 'Save changes'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setForm({
                        name: customer?.name || '',
                        email: customer?.email || '',
                        phone: customer?.phone || '',
                      });
                      setIsEditing(false);
                    }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                      <User className="size-3.5" />
                      Name
                    </div>
                    <p className="mt-2 text-sm font-medium">{customer.name}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                      <Mail className="size-3.5" />
                      Email
                    </div>
                    <p className="mt-2 text-sm font-medium">{customer.email || 'Not set'}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                      <Phone className="size-3.5" />
                      Phone
                    </div>
                    <p className="mt-2 text-sm font-medium">{customer.phone || 'Not set'}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                      <Building2 className="size-3.5" />
                      Source
                    </div>
                    <p className="mt-2 text-sm font-medium capitalize">{customer.source || 'manual'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/70">
            <CardHeader className="border-b border-border/60">
              <CardTitle>Quick links</CardTitle>
              <CardDescription>Jump into the customer timeline or create a deal.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 pt-4 sm:grid-cols-2">
              <Link to={`/customers/${customerId}/timeline`} className="rounded-2xl border border-border/70 bg-muted/20 p-4 transition-colors hover:border-border hover:bg-muted/35">
                <p className="text-sm font-medium">Timeline</p>
                <p className="mt-1 text-sm text-muted-foreground">See the event history and activities.</p>
              </Link>
              <button
                type="button"
                onClick={() => setIsDealDialogOpen(true)}
                className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-left transition-colors hover:border-border hover:bg-muted/35"
              >
                <p className="text-sm font-medium">New deal</p>
                <p className="mt-1 text-sm text-muted-foreground">Create a linked deal and continue to its details page.</p>
              </button>
            </CardContent>
          </Card>
        </div>

        <aside className="rounded-3xl border border-border/70 bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 p-4 sm:p-5">
            <div>
              <h2 className="text-base font-semibold">Connected deals</h2>
              <p className="text-sm text-muted-foreground">A live side panel for the customer pipeline.</p>
            </div>
            <Badge variant="outline">{customerDeals?.deals?.length || 0}</Badge>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
            {dealSummary.map((item) => (
              <div key={item.label} className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>

          <Separator />

          <ScrollArea className="h-[34rem]">
            <div className="space-y-3 p-4 sm:p-5">
              {customerDeals?.deals?.length > 0 ? (
                customerDeals.deals.map((deal) => {
                  const dealId = getEntityId(deal);

                  return (
                    <Link
                      key={dealId}
                      to={`/deals/${dealId}`}
                      className="group block rounded-2xl border border-border/70 bg-background/80 p-4 transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{deal.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {deal.latestActivitySummary || 'No deal notes yet'}
                          </p>
                        </div>
                        <Badge variant={deal.status === 'won' ? 'default' : deal.status === 'lost' ? 'destructive' : 'outline'}>
                          {deal.status || 'active'}
                        </Badge>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="size-3.5" />
                          {formatDateOnly(deal.latestInteractionAt || deal.createdAt)}
                        </span>
                        <span className="inline-flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          Open
                          <ExternalLink className="size-3.5" />
                        </span>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground">
                  No deals are linked yet. Create the first one from this page.
                </div>
              )}
            </div>
          </ScrollArea>
        </aside>
      </div>

      <DealCreationDialog
        open={isDealDialogOpen}
        onOpenChange={setIsDealDialogOpen}
        customer={customer}
        organizationId={organizationId}
        onCreated={handleDealCreated}
      />
    </div>
  );
};

export default CustomerDetails;
