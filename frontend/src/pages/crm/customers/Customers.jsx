import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import { Building2, Plus, Search, Users } from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
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
import { Skeleton } from "@/components/ui/skeleton";

import CustomerCard from "@/components/crm/customer/CustomerCard";
import CustomerCreateDialog from "@/components/crm/customer/CustomerCreateDialog";

import {
  useUserStore,
  useCustomerStore,
} from "@/stores";

const Customer = () => {
  const navigate = useNavigate();
  const { userProfile } = useUserStore();
  const { customers, pagination, getCustomers, isLoading, organization } = useCustomerStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const organizationId = userProfile?.activeOrganization || null;
  const totalCustomers = pagination?.total || 0;
  const organizationName = organization?.name || "Your Workspace";

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
      }, 500),
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

  const handleCustomerOpen = (customer) => {
    navigate(`/customers/${customer._id}`);
  };

  const handleTimelineOpen = (customer) => {
    navigate(`/customers/${customer._id}/timeline`);
  };

  const handleCreateDeal = (customer) => {
    navigate(`/customers/${customer._id}?action=create-deal`);
  };

  const renderPaginationItems = useMemo(() => {
    if (!pagination) return null;
    const { page, totalPages } = pagination;

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }).map((_, index) => {
        const pageNum = index + 1;
        return (
          <PaginationItem key={pageNum}>
            <PaginationLink
              href="#"
              className="h-8 w-8 text-xs"
              isActive={page === pageNum}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(pageNum);
              }}
            >
              {pageNum}
            </PaginationLink>
          </PaginationItem>
        );
      });
    }

    const items = [];

    items.push(1);

    let startPage = Math.max(2, page - 1);
    let endPage = Math.min(totalPages - 1, page + 1);

    if (page <= 3) {
      endPage = 4;
    } else if (page >= totalPages - 2) {
      startPage = totalPages - 3;
    }

    if (startPage > 2) {
      items.push("ellipsis-left");
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }

    if (endPage < totalPages - 1) {
      items.push("ellipsis-right");
    }

    items.push(totalPages);

    return items.map((item, idx) => {
      if (typeof item === "string") {
        return (
          <PaginationItem key={`ellipsis-${idx}`}>
            <PaginationEllipsis className="h-8 w-8 text-muted-foreground" />
          </PaginationItem>
        );
      }

      return (
        <PaginationItem key={item}>
          <PaginationLink
            href="#"
            className="h-8 w-8 text-xs"
            isActive={page === item}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(item);
            }}
          >
            {item}
          </PaginationLink>
        </PaginationItem>
      );
    });
  }, [pagination]);

  const startItem = (query.page - 1) * query.limit + 1;
  const endItem = Math.min(query.page * query.limit, totalCustomers);

  const isFirstPage = pagination?.page === 1;
  const isLastPage = pagination?.page === pagination?.totalPages;

  if (!organizationId) {
    return (
      <div className="flex min-h-55 max-w-screen-2xl mx-auto px-4 py-3 flex-col items-center justify-center rounded-lg border border-border bg-background text-center">
        <Building2 className="size-8 text-muted-foreground/70" />
        <h2 className="mt-3 text-sm font-medium text-foreground">No Organization Selected</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Select an organization before managing customers.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-3 space-y-3">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border pb-4">
        <div className="space-y-1 min-w-0">
          {/* Micro Category Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground select-none">
            <span className="truncate font-medium max-w-45" title={organizationName}>
              Organization: {organizationName}
            </span>
          </div>

          {/* Primary Page Action Title */}
          <h1 className="text-xl font-semibold tracking-tight text-foreground leading-none">
            Customers
          </h1>

          {/* Secondary Context Description */}
          <p className="text-xs text-muted-foreground font-normal max-w-md">
            Manage relationships and track active deals.
          </p>
        </div>

        {/* Primary Interaction Component Button */}
        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="h-8 gap-1.5 px-3 shrink-0 shadow-sm transition-all text-xs font-medium hover:bg-primary/80 cursor-pointer"
        >
          <Plus className="size-3.5 stroke-[2.5]" />
          <span>New Customer</span>
        </Button>
      </div>

      {/* Stats & Filters Control Bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border py-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-muted/20 p-1.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 text-muted-foreground">
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

          <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-2 justify-end w-full sm:w-auto">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                placeholder="Search customers..."
                className="h-8 w-full pl-8 text-xs placeholder:text-muted-foreground/60"
                onChange={handleSearch}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <Select onValueChange={handleSortChange} defaultValue="newest">
                <SelectTrigger className="h-8 w-32.5 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest" className="text-xs">Newest</SelectItem>
                  <SelectItem value="oldest" className="text-xs">Oldest</SelectItem>
                  <SelectItem value="nameAsc" className="text-xs">A-Z</SelectItem>
                  <SelectItem value="nameDesc" className="text-xs">Z-A</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] whitespace-nowrap text-muted-foreground">
                  Customers per page
                </span>
                <Select value={String(query.limit)} onValueChange={handleLimitChange}>
                  <SelectTrigger className="h-8 w-16 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10" className="text-xs">10</SelectItem>
                    <SelectItem value="20" className="text-xs">20</SelectItem>
                    <SelectItem value="50" className="text-xs">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Listing Area */}
      {isLoading ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: query.limit || 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg border border-border" />
          ))}
        </div>
      ) : customers.length > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {customers.map((customer) => (
              <div
                key={customer._id}
                className="transition-shadow duration-200 hover:shadow-sm border border-border rounded-lg"
              >
                <CustomerCard
                  customer={customer}
                  onOpen={handleCustomerOpen}
                  onTimeline={handleTimelineOpen}
                  onCreateDeal={handleCreateDeal}
                />
              </div>
            ))}
          </div>

          {pagination?.totalPages > 1 && (
            <div className="pt-2 border-t border-border/40 flex flex-col sm:flex-row gap-2 items-center justify-between">
              {/* Informative pagination meta row */}
              <div className="text-xs text-muted-foreground text-center sm:text-left">
                Showing <span className="font-medium text-foreground">{startItem}-{endItem}</span> of{" "}
                <span className="font-medium text-foreground">{totalCustomers}</span> customers
                <span className="mx-1.5 hidden sm:inline">•</span>
                <span className="block sm:inline mt-0.5 sm:mt-0">
                  Page <span className="font-medium text-foreground">{pagination.page}</span> of{" "}
                  <span className="font-medium text-foreground">{pagination.totalPages}</span>
                </span>
              </div>

              <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        className={`h-8 px-2.5 text-xs ${isFirstPage
                          ? "pointer-events-none opacity-40 select-none"
                          : ""
                          }`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (!isFirstPage) handlePageChange(pagination.page - 1);
                        }}
                      />
                    </PaginationItem>

                    {renderPaginationItems}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        className={`h-8 px-2.5 text-xs ${isLastPage
                          ? "pointer-events-none opacity-40 select-none"
                          : ""
                          }`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (!isLastPage) handlePageChange(pagination.page + 1);
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-h-55 flex-col items-center justify-center rounded-lg border border-border border-dashed p-6 text-center">
          <Users className="size-7 text-muted-foreground/40" />
          <h2 className="mt-2.5 text-sm font-medium text-foreground">No customers found</h2>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            Start expanding your workflow database by adding your primary customer contact.
          </p>
          <Button size="sm" variant="outline" onClick={() => setIsCreateOpen(true)} className="mt-3.5 h-8 gap-1">
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