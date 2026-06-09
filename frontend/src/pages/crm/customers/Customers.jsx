import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useCustomerStore, useOrganizationStore, useUserStore } from '@/stores';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { debounce } from 'lodash';

const getEntityId = (entity) => {
  if (!entity) return null;
  if (typeof entity === 'string') return entity;
  return entity._id || entity.id || null;
};

const getInitials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'C';

const formatDate = (value) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

function CustomerCreateDialog({ open, onOpenChange, organizationId, onCreated }) {
  const { createCustomer, isUpdating } = useCustomerStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setForm({ name: '', email: '', phone: '' });
      setError(null);
    }
  }, [open]);

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('Customer name is required');
      return;
    }

    try {
      const created = await createCustomer({
        orgId: organizationId,
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
      });

      const createdCustomer = created?.customer || created;
      const customerId = getEntityId(createdCustomer);
      onCreated(customerId);
      onOpenChange(false);
    } catch (err) {
      setError(err?.message || 'Failed to create customer');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New customer</DialogTitle>
          <DialogDescription>
            Capture a new customer in the active organization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer-name">Name *</Label>
            <Input
              id="customer-name"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="Jane Cooper"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-email">Email</Label>
            <Input
              id="customer-email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="jane@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-phone">Phone</Label>
            <Input
              id="customer-phone"
              value={form.phone}
              onChange={handleChange('phone')}
              placeholder="+1 555 123 4567"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isUpdating} className="w-full sm:w-auto">
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Create customer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CustomerCard({ customer }) {
  const navigate = useNavigate();
  const customerId = getEntityId(customer);

  const handleNewDeal = () => {
    navigate(`/customers/${customerId}/new-deal`);
  };

  return (
    <Card className="overflow-hidden border-border/70 transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-lg">
      <CardHeader className="space-y-3 border-b border-border/60 bg-gradient-to-br from-background to-muted/25">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-11 shrink-0">
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                {getInitials(customer?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="truncate text-base">
                {customer?.name || 'Unnamed customer'}
              </CardTitle>
              <CardDescription className="truncate">
                {customer?.email || 'No email saved'}
              </CardDescription>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate(`/customers/${customerId}`)}>
                Customer details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/customers/${customerId}/timeline`)}>
                Timeline
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleNewDeal}>New deal</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-background/70">
            {customer?.source || 'manual'}
          </Badge>
          {customer?.latestInteractionAt && (
            <Badge variant="outline" className="bg-background/70">
              Recent activity
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <Mail className="size-3.5" />
              Email
            </div>
            <p className="mt-2 truncate text-sm font-medium">
              {customer?.email || 'Not set'}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <Phone className="size-3.5" />
              Phone
            </div>
            <p className="mt-2 truncate text-sm font-medium">
              {customer?.phone || 'Not set'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4" />
            Added {formatDate(customer?.createdAt)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => navigate(`/customers/${customerId}`)}
          >
            Open
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const Customers = () => {
  const navigate = useNavigate();
  const { userProfile } = useUserStore();
  const { currentOrganization } = useOrganizationStore();
  const {
    customers,
    getCustomers,
    isLoading,
    pagination,
    currentOrganizationId,
  } = useCustomerStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy] = useState('createdAt');
  const [sortOrder] = useState('desc');

  const organizationId = getEntityId(
    userProfile?.activeOrganization || currentOrganization
  );

  // Debounced search to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce((orgId, page, search, sort, order) => {
      if (orgId) {
        getCustomers(orgId, {
          page,
          limit: 10,
          search: search || undefined,
          sortBy: sort,
          sortOrder: order,
        }).catch(() => undefined);
      }
    }, 500),
    [getCustomers]
  );

  // Fetch customers when organization, page, or search changes
  useEffect(() => {
    if (!organizationId) return;

    const searchTerm = searchValue.trim() || undefined;

    getCustomers(organizationId, {
      page: currentPage,
      limit: 10,
      search: searchTerm,
      sortBy,
      sortOrder,
    }).catch(() => undefined);
  }, [organizationId, currentPage, searchValue, sortBy, sortOrder, getCustomers]);

  // Reset page when search changes (debounced)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue]);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleCreated = (customerId) => {
    if (customerId) {
      // Refresh the current page to show new customer
      getCustomers(organizationId, {
        page: currentPage,
        limit: 10,
        search: searchValue.trim() || undefined,
        sortBy,
        sortOrder,
      }).catch(() => undefined);
      navigate(`/customers/${customerId}`);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { page, totalPages } = pagination;
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) handlePageChange(page - 1);
              }}
              className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>

          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink href="#" onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(1);
                }}>
                  1
                </PaginationLink>
              </PaginationItem>
              {startPage > 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </>
          )}

          {pages.map((p) => (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(p);
                }}
                isActive={p === page}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(totalPages);
                  }}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPages) handlePageChange(page + 1);
              }}
              className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // Show loading skeleton
  if (isLoading && customers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-48 animate-pulse rounded-3xl border border-border/70 bg-muted/30" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-3xl border border-border/70 bg-muted/30"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/70 bg-gradient-to-br from-background via-background to-muted/35 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Customers
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                View every customer in the active workspace, open their timeline,
                edit their profile, or create a new deal from the same place.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Search customers by name, email, or phone"
                className="pl-9"
              />
            </div>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="size-4" />
              New customer
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total customers
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {pagination?.total ?? customers.length}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Current page
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {customers.length}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Active organization
            </p>
            <p className="mt-2 truncate text-sm font-medium">
              {currentOrganization?.name ||
                userProfile?.activeOrganization?.name ||
                'Organization selected'}
            </p>
          </div>
        </div>
      </section>

      <Separator />

      {customers.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {customers.map((customer) => (
              <CustomerCard key={getEntityId(customer)} customer={customer} />
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            {renderPagination()}
          </div>
        </>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="size-10 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">
              {searchValue ? 'No matching customers found' : 'No customers yet'}
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {searchValue
                ? `No customers match "${searchValue}". Try a different search term or clear the search.`
                : 'Create the first customer in this organization to start tracking timelines and deals.'}
            </p>
            {!searchValue && (
              <Button
                className="mt-6 gap-2"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="size-4" />
                Add customer
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <CustomerCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        organizationId={organizationId}
        onCreated={handleCreated}
      />
    </div>
  );
};

export default Customers;