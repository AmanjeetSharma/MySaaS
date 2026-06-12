import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import { Building2, Plus, Search, Users, ArrowRight, SkipForward  } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
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

import CustomerRow from "@/components/crm/customer/CustomerRow";
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

  // Dynamic local state for the manual page input jumper
  const [pageInput, setPageInput] = useState(String(query.page));

  const organizationId = userProfile?.activeOrganization || null;
  const totalCustomers = pagination?.total || 0;
  const organizationName = organization?.name || "Your Workspace";
  const totalPages = pagination?.totalPages || 1;

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

  // Keep manual page input field synchronized if page changes via arrows or clicks
  useEffect(() => {
    setPageInput(String(query.page));
  }, [query.page]);

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

  const handlePageChange = useCallback((page) => {
    setQuery((prev) => ({ ...prev, page }));
  }, []);

  const handleLimitChange = (value) => {
    setQuery((prev) => ({ ...prev, page: 1, limit: Number(value) }));
  };

  const handleCustomerOpen = useCallback((customer) => {
    navigate(`/customers/${customer._id}`);
  }, [navigate]);

  // Logic to process manual typed page submission
  const handlePageSubmit = (e) => {
    e.preventDefault();
    const targetPage = Math.max(1, window.parseInt(pageInput, 10));

    if (!isNaN(targetPage)) {
      const validPage = Math.min(targetPage, totalPages);
      handlePageChange(validPage);
      setPageInput(String(validPage));
    } else {
      setPageInput(String(query.page));
    }
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
              className="h-8 w-8 text-xs font-medium select-none"
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
            className="h-8 w-8 text-xs font-medium select-none"
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
  }, [pagination, handlePageChange]);

  const startItem = (query.page - 1) * query.limit + 1;
  const endItem = Math.min(query.page * query.limit, totalCustomers);

  const isFirstPage = pagination?.page === 1;
  const isLastPage = pagination?.page === pagination?.totalPages;

  if (!organizationId && !isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 py-3">
        <Card className="max-w-md mx-auto my-8 border border-border border-dashed bg-muted/10 shadow-sm animate-in fade-in-50 duration-200">
          <CardContent className="p-6">
            <Empty>
              <EmptyHeader className="space-y-1.5">
                <EmptyMedia
                  variant="icon"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-background border border-border text-muted-foreground/80 shadow-inner mx-auto mb-2 select-none"
                >
                  <Building2 className="size-5 stroke-[1.75]" />
                </EmptyMedia>

                <EmptyTitle className="text-sm font-semibold tracking-tight text-foreground text-center">
                  No Active Organization
                </EmptyTitle>

                <EmptyDescription className="text-xs text-muted-foreground leading-normal font-normal text-center max-w-xs mx-auto">
                  Please create or switch to an active workspace to access and manage your customers.
                </EmptyDescription>
              </EmptyHeader>

              <EmptyContent className="mt-5 flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => navigate("/organizations")}
                  className="h-8 text-xs font-medium px-4 shadow-sm group transition-all cursor-pointer hover:bg-primary/80"
                >
                  <span>Go to Organizations</span>
                  <ArrowRight className="ml-1.5 size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                </Button>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-3 space-y-3">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border pb-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground select-none">
            <span className="truncate font-medium max-w-45" title={organizationName}>
              Organization: {organizationName}
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground leading-none">
            Customers
          </h1>
          <p className="text-xs text-muted-foreground font-normal max-w-md">
            Manage relationships and track customer data parameters.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="h-8 gap-1.5 px-3 shrink-0 shadow-sm transition-all text-xs font-medium hover:bg-primary/80 cursor-pointer"
        >
          <Plus className="size-3.5 stroke-[2.5]" />
          <span>New Customer</span>
        </Button>
      </div>

      {/* Control Utility Filter Bar */}
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
              <span className="text-[11px] whitespace-nowrap text-muted-foreground">
                Filter by:
              </span>
              <Select onValueChange={handleSortChange} defaultValue="newest">
                <SelectTrigger className="h-8 w-32.5 text-xs cursor-pointer">
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
                  Rows per page:
                </span>
                <Select value={String(query.limit)} onValueChange={handleLimitChange}>
                  <SelectTrigger className="h-8 w-16 text-xs cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10" className="text-xs">10</SelectItem>
                    <SelectItem value="20" className="text-xs">20</SelectItem>
                    <SelectItem value="50" className="text-xs">50</SelectItem>
                    <SelectItem value="100" className="text-xs">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CRM Database Listing Structure */}
      {isLoading ? (
        <div className="space-y-2 pt-1">
          {Array.from({ length: query.limit || 8 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-md border border-border/40" />
          ))}
        </div>
      ) : customers.length > 0 ? (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-lg border border-border/60 bg-background shadow-none">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-[11px] font-medium text-muted-foreground select-none uppercase tracking-wider">
                  <th className="py-2 pl-4 pr-3 font-medium">Customer</th>
                  <th className="py-2 px-3 font-medium">Email</th>
                  <th className="py-2 px-3 font-medium hidden sm:table-cell">Phone</th>
                  <th className="py-2 px-3 font-medium hidden md:table-cell">Latest Interaction</th>
                  <th className="py-2 px-3 font-medium hidden lg:table-cell">Created</th>
                  <th className="py-2 pl-3 pr-4 text-right font-medium w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {customers.map((customer) => (
                  <CustomerRow
                    key={customer._id}
                    customer={customer}
                    onOpen={handleCustomerOpen}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Bottom Control Pagination Footer */}
          {totalPages > 1 && (
            <div className="pt-1 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="text-xs text-muted-foreground text-center md:text-left">
                Showing <span className="font-medium text-foreground">{startItem}-{endItem}</span> of{" "}
                <span className="font-medium text-foreground">{totalCustomers}</span> customers
                <span className="mx-1.5 hidden sm:inline">•</span>
                <span className="block sm:inline mt-0.5 sm:mt-0">
                  Page <span className="font-medium text-foreground">{pagination.page}</span> of{" "}
                  <span className="font-medium text-foreground">{totalPages}</span>
                </span>
              </div>

              {/* Integrated Manual Input Page Jumper and Controls Container */}
              <div className="w-full md:w-auto flex flex-col sm:flex-row items-center justify-center md:justify-end gap-3.5">
                <form onSubmit={handlePageSubmit} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <label htmlFor="page-jumper" className="whitespace-nowrap select-none text-[11px]">Go to page</label>
                  <div className="flex items-center gap-1">
                    <Input
                      id="page-jumper"
                      type="number"
                      min="1"
                      max={totalPages}
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      className="h-7 w-12 text-center text-xs p-0 font-medium font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="outline"
                      className="group/btn h-7 gap-1 px-2 text-[10px] font-medium text-muted-foreground/80 hover:text-foreground hover:bg-muted/50 border-border/60 hover:border-border cursor-pointer shadow-sm transition-all duration-150 rounded-md"
                    >
                      <SkipForward className="size-3 text-muted-foreground/60 transition-transform duration-150 group-hover/btn:translate-x-0.5 group-hover/btn:text-foreground" />
                      <span>Jump</span>
                    </Button>
                  </div>
                </form>

                <div className="h-4 w-px bg-border/60 hidden sm:block" />

                <Pagination className="w-auto mx-0">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        className={`h-8 px-2.5 text-xs ${isFirstPage ? "pointer-events-none opacity-40 select-none" : ""}`}
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
                        className={`h-8 px-2.5 text-xs ${isLastPage ? "pointer-events-none opacity-40 select-none" : ""}`}
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
        <Card className="border border-border border-dashed bg-muted/10 shadow-sm animate-in fade-in-50 duration-200">
          <CardContent className="p-6">
            <Empty>
              <EmptyHeader className="space-y-1.5">
                <EmptyMedia
                  variant="icon"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-background border border-border text-muted-foreground/40 shadow-inner mx-auto mb-2 select-none"
                >
                  <Users className="size-5 stroke-[1.75]" />
                </EmptyMedia>

                <EmptyTitle className="text-sm font-semibold tracking-tight text-foreground text-center">
                  No Customers Found
                </EmptyTitle>

                <EmptyDescription className="text-xs text-muted-foreground leading-normal font-normal text-center max-w-xs mx-auto">
                  It looks like you haven't added any customers yet. Start building your customer base by adding a new customer profile.
                </EmptyDescription>
              </EmptyHeader>

              <EmptyContent className="mt-5 flex items-center justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCreateOpen(true)}
                  className="h-8 text-xs font-medium px-4 shadow-sm border-border bg-background hover:bg-muted gap-1.5 group cursor-pointer transition-all"
                >
                  <Plus className="size-3.5 stroke-[2.5]" />
                  <span>Create Customer</span>
                </Button>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      )}

      <CustomerCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        organizationId={organizationId}
      />
    </div>
  );
};

export default Customer;