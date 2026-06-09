import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import { Building2, Plus, Search, Users } from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import CustomerCard from "@/components/crm/customer/CustomerCard";
import CustomerCreateDialog from "@/components/crm/customer/CustomerCreateDialog";

import {
  useUserStore,
  useCustomerStore,
  useOrganizationStore,
} from "@/stores";

const Customer = () => {
  const navigate = useNavigate();
  const { userProfile } = useUserStore();
  const { customers, pagination, getCustomers, isLoading } = useCustomerStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { currentOrganization } = useOrganizationStore();
  const organizationId = currentOrganization?._id || userProfile?.activeOrganization || null;
  const organizationName = currentOrganization?.name || "Organization";
  const totalCustomers = pagination?.total || 0;

  const fetchCustomers = useCallback(async () => {
    if (!organizationId) return;
    try {
      await getCustomers(organizationId, query);
    } catch (error) {
      console.error(error);
    }
  }, [organizationId, query, getCustomers]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setQuery((prev) => ({
          ...prev,
          search: value,
          page: 1,
        }));
      }, 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearch = (event) => {
    debouncedSearch(event.target.value);
  };

  const handleSortChange = (value) => {
    const sortConfig = {
      newest: { sortBy: "createdAt", sortOrder: "desc" },
      oldest: { sortBy: "createdAt", sortOrder: "asc" },
      nameAsc: { sortBy: "name", sortOrder: "asc" },
      nameDesc: { sortBy: "name", sortOrder: "desc" },
    };

    if (sortConfig[value]) {
      setQuery((prev) => ({ ...prev, ...sortConfig[value], page: 1 }));
    }
  };

  const handlePageChange = (page) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (value) => {
    setQuery((prev) => ({ ...prev, page: 1, limit: Number(value) }));
  };

  // Missing Navigation Action Handlers
  const handleCustomerOpen = (customer) => {
    navigate(`/customers/${customer._id}`);
  };

  const handleTimelineOpen = (customer) => {
    navigate(`/customers/${customer._id}/timeline`);
  };

  const handleCreateDeal = (customer) => {
    navigate(`/customers/${customer._id}?action=create-deal`);
  };

  if (!organizationId) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-border bg-background p-8 text-center">
        <Building2 className="size-8 text-muted-foreground/70" />
        <h2 className="mt-3 text-sm font-medium">No Organization Selected</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Select an organization before managing customers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Customers</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage relationships and track active deals.
          </p>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)} className="h-8 gap-1.5 px-3">
          <Plus className="size-3.5" />
          <span className="text-xs">New Customer</span>
        </Button>
      </div>

      {/* Stats & Filters Control Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-muted/20 p-2">
        <div className="flex items-center gap-2 px-2 py-1 text-muted-foreground">
          <Users className="size-3.5" />

          <span className="text-xs font-medium text-foreground">
            {totalCustomers === 0 ? "" : totalCustomers}
          </span>

          <span className="text-xs text-muted-foreground/80">
            {totalCustomers === 0
              ? "No customers"
              : totalCustomers === 1
                ? "customer"
                : "customers"}
          </span>
        </div>

        <div className="flex flex-1 items-center gap-2 sm:justify-end">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              placeholder="Search customers..."
              className="h-8 w-full pl-8 text-xs placeholder:text-muted-foreground/60"
              onChange={handleSearch}
            />
          </div>

          <Select onValueChange={handleSortChange} defaultValue="newest">
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest" className="text-xs">Newest</SelectItem>
              <SelectItem value="oldest" className="text-xs">Oldest</SelectItem>
              <SelectItem value="nameAsc" className="text-xs">A-Z</SelectItem>
              <SelectItem value="nameDesc" className="text-xs">Z-A</SelectItem>
            </SelectContent>
          </Select>

          <Select value={String(query.limit)} onValueChange={handleLimitChange}>
            <SelectTrigger className="h-8 w-[70px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10" className="text-xs">10</SelectItem>
              <SelectItem value="25" className="text-xs">25</SelectItem>
              <SelectItem value="50" className="text-xs">50</SelectItem>
              <SelectItem value="100" className="text-xs">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content Listing Area */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[180px] rounded-lg border border-border" />
          ))}
        </div>
      ) : customers.length > 0 ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {customers.map((customer) => (
              <CustomerCard
                key={customer._id}
                customer={customer}
                onOpen={handleCustomerOpen}
                onTimeline={handleTimelineOpen}
                onCreateDeal={handleCreateDeal}
              />
            ))}
          </div>

          {pagination?.totalPages > 1 && (
            <div className="pt-2">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      className="h-8 text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.page > 1) handlePageChange(pagination.page - 1);
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: pagination.totalPages }).map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        href="#"
                        className="h-8 w-8 text-xs"
                        isActive={pagination.page === index + 1}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(index + 1);
                        }}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      className="h-8 text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.page < pagination.totalPages) handlePageChange(pagination.page + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-lg border border-border border-dashed p-8 text-center">
          <Users className="size-8 text-muted-foreground/50" />
          <h2 className="mt-3 text-sm font-medium">No customers found</h2>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            Start expanding your workflow database by adding your primary customer contact.
          </p>
          <Button size="sm" variant="outline" onClick={() => setIsCreateOpen(true)} className="mt-4 h-8 gap-1">
            <Plus className="size-3.5" />
            Create Customer
          </Button>
        </div>
      )}

      <CustomerCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        organizationId={organizationId}
        onCreated={(customer) => {
          navigate(`/customers/${customer._id}`);
        }}
      />
    </div>
  );
};

export default Customer;