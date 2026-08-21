import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { debounce } from "lodash";
import {
  Search,
  ArrowLeft,
  Building2,
  Plus,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Trophy,
  Briefcase,
  RefreshCw,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useCustomerStore } from "@/stores";
import CustomerDetailsCard from "@/components/crm/customer/CustomerDetailsCard";
import CustomerEditDialog from "@/components/crm/customer/CustomerEditDialog";
import DealCreateDialog from "@/components/crm/customer/DealCreateDialog";
import DealRow from "@/components/crm/customer/DealRow";

const CustomerDetails = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();

  const {
    currentCustomer,
    customerDeals,
    getCustomer,
    getCustomerDeals,
    deleteCustomer,
    isLoading,
    isUpdating,
    isCustomerDealsLoading,
  } = useCustomerStore();

  const [editOpen, setEditOpen] = useState(false);
  const [createDealOpen, setCreateDealOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const fetchCustomer = useCallback(async () => {
    if (!customerId) return;
    try {
      await getCustomer(customerId);
    } catch (error) {
      console.error(error);
    }
  }, [customerId, getCustomer]);

  const fetchDeals = useCallback(async () => {
    if (!customerId) return;
    try {
      await getCustomerDeals(customerId, query);
    } catch (error) {
      console.error(error);
    }
  }, [customerId, query, getCustomerDeals]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

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
    const sortMap = {
      newest: { sortBy: "createdAt", sortOrder: "desc" },
      oldest: { sortBy: "createdAt", sortOrder: "asc" },
      titleAsc: { sortBy: "title", sortOrder: "asc" },
      titleDesc: { sortBy: "title", sortOrder: "desc" },
    };

    setQuery((prev) => ({
      ...prev,
      ...sortMap[value],
      page: 1,
    }));
  };

  const handleDeleteCustomer = async () => {
    try {
      await deleteCustomer(customerId);
      navigate("/customers");
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = (status) => {
    setQuery((prev) => ({
      ...prev,
      page: 1,
      status: status === "all" ? "" : status,
    }));
  };

  const handleLimitChange = (value) => {
    setQuery((prev) => ({
      ...prev,
      page: 1,
      limit: parseInt(value, 10),
    }));
  };

  const handlePageChange = (page) => {
    setQuery((prev) => ({
      ...prev,
      page,
    }));
  };

  const resetFilters = () => {
    setQuery({
      page: 1,
      limit: query.limit,
      search: "",
      status: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    const searchInput = document.getElementById("deal-search-input");
    if (searchInput) searchInput.value = "";
  };

  if (isLoading && !currentCustomer) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" aria-busy="true" aria-live="polite">
        <Skeleton className="h-10 w-52 rounded-xl bg-surface-sunken" />
        <Skeleton className="h-48 rounded-2xl bg-surface-sunken" />
        <Skeleton className="h-96 rounded-2xl bg-surface-sunken" />
      </div>
    );
  }

  if (!currentCustomer) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Card className="border-border-strong border-dashed bg-surface-elevated/40 rounded-2xl">
          <CardContent className="flex min-h-75 flex-col items-center justify-center gap-3 p-6 text-center">
            <Building2 className="size-8 text-subtle-foreground/60" />
            <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">Customer Not Found</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/customers")}
              className="rounded-xl border-border bg-surface text-subtle-foreground hover:bg-surface-sunken hover:text-foreground active:scale-95 transition-all cursor-pointer text-xs font-semibold"
            >
              Back to Customers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { deals = [], statistics, pagination } = customerDeals || {};
  const totalDeals = pagination?.total || 0;
  const overallTotal = pagination?.overallTotal || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 bg-background text-foreground">
      {/* Action Header Line */}
      <div>
        <Button
          variant="ghost"
          className="gap-2 px-2 text-subtle-foreground hover:text-foreground hover:bg-hover transition-colors rounded-xl cursor-pointer"
          onClick={() => navigate("/customers")}
        >
          <ArrowLeft className="size-4" />
          <span className="text-sm font-medium">Back to Customers</span>
        </Button>
      </div>

      {/* Customer Master Details Card */}
      <CustomerDetailsCard
        customer={currentCustomer}
        onEdit={() => setEditOpen(true)}
        onCreateDeal={() => setCreateDealOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      />

      {/* Scoreboard Metrics */}
      {statistics && (
        <section className="bg-transparent border border-border-subtle rounded-2xl p-3 shadow-xs" aria-labelledby="metrics-summary-heading">
          <h2 id="metrics-summary-heading" className="sr-only">Customer Deal Performance Metrics</h2>
          <div className="grid grid-cols-2 divide-x divide-y-0 sm:grid-cols-4 divide-border-subtle">
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-subtle-foreground">Active</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-heading text-2xl font-bold tracking-tight text-accent">{statistics.active || 0}</span>
                  <TrendingUp className="size-3.5 text-accent/70" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-subtle-foreground">Won</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-heading text-2xl font-bold tracking-tight text-success">{statistics.won || 0}</span>
                  <Trophy className="size-3.5 text-success/70" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-subtle-foreground">Lost</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-heading text-2xl font-bold tracking-tight text-destructive">{statistics.lost || 0}</span>
                  <TrendingDown className="size-3.5 text-destructive/70" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-subtle-foreground">Total</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-heading text-2xl font-bold tracking-tight text-foreground">{statistics.total || 0}</span>
                  <BarChart3 className="size-3.5 text-subtle-foreground/70" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Deals Datatable Wrapper Component */}
      <Card className="border-border-subtle bg-surface-elevated text-surface-elevated-foreground shadow-xs rounded-2xl">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border-subtle pb-4">
            <div>
              <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">Deal Management</h2>
              <p className="text-xs text-subtle-foreground">Monitor and lifecycle track your deals</p>
            </div>

            {/* Render filter controls only if the customer has ever had deals created */}
            {(!isCustomerDealsLoading && overallTotal > 0) && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground" />
                  <Input
                    id="deal-search-input"
                    placeholder="Search by title..."
                    className="pl-9 h-9 text-xs bg-surface border-border text-foreground placeholder:text-subtle-foreground/60 rounded-xl focus-visible:ring-1 focus-visible:ring-ring"
                    onChange={handleSearch}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
                  <span className="hidden sm:inline-flex text-xs text-subtle-foreground font-medium whitespace-nowrap">Status:</span>
                  <Select onValueChange={handleStatusChange} value={query.status || "all"}>
                    <SelectTrigger className="h-9 w-full sm:w-32 text-xs rounded-xl border-border bg-surface text-foreground cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground border-border">
                      <SelectItem value="all" className="text-xs hover:bg-hover hover:text-hover-foreground">All</SelectItem>
                      <SelectItem value="active" className="text-xs hover:bg-hover hover:text-hover-foreground">Active</SelectItem>
                      <SelectItem value="won" className="text-xs hover:bg-hover hover:text-hover-foreground">Won</SelectItem>
                      <SelectItem value="lost" className="text-xs hover:bg-hover hover:text-hover-foreground">Lost</SelectItem>
                    </SelectContent>
                  </Select>

                  <span className="hidden sm:inline-flex text-xs text-subtle-foreground font-medium whitespace-nowrap">Filter by:</span>
                  <Select onValueChange={handleSortChange} value={query.sortBy === "title" ? (query.sortOrder === "asc" ? "titleAsc" : "titleDesc") : (query.sortOrder === "asc" ? "oldest" : "newest")}>
                    <SelectTrigger className="h-9 w-full sm:w-36 text-xs rounded-xl border-border bg-surface text-foreground cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground border-border">
                      <SelectItem value="newest" className="text-xs hover:bg-hover hover:text-hover-foreground">Newest</SelectItem>
                      <SelectItem value="oldest" className="text-xs hover:bg-hover hover:text-hover-foreground">Oldest</SelectItem>
                      <SelectItem value="titleAsc" className="text-xs hover:bg-hover hover:text-hover-foreground">A-Z</SelectItem>
                      <SelectItem value="titleDesc" className="text-xs hover:bg-hover hover:text-hover-foreground">Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-end gap-2 text-xs text-subtle-foreground font-medium whitespace-nowrap min-w-fit">
                  <span>Rows:</span>
                  <Select onValueChange={handleLimitChange} value={String(query.limit)}>
                    <SelectTrigger className="h-9 w-20 text-xs rounded-xl border-border bg-surface text-foreground cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground border-border">
                      <SelectItem value="10" className="text-xs hover:bg-hover hover:text-hover-foreground">10</SelectItem>
                      <SelectItem value="20" className="text-xs hover:bg-hover hover:text-hover-foreground">20</SelectItem>
                      <SelectItem value="50" className="text-xs hover:bg-hover hover:text-hover-foreground">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Content Stream */}
          {isCustomerDealsLoading ? (
            <div className="space-y-3" aria-busy="true">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-16 rounded-xl bg-surface-sunken border border-border-subtle" />
              ))}
            </div>
          ) : deals.length > 0 ? (
            <>
              {/* Filter Subheading Match Count */}
              <div className="text-xs font-semibold text-subtle-foreground select-none pb-1">
                Found {totalDeals} {totalDeals === 1 ? 'matching deal' : 'matching deals'}
              </div>

              <div className="space-y-2">
                {deals.map((deal) => (
                  <DealRow key={deal._id} deal={deal} />
                ))}
              </div>

              {pagination?.totalPages > 1 && (
                <div className="pt-2 flex justify-center sm:justify-end">
                  <Pagination className="w-auto mx-0">
                    <PaginationContent className="gap-1">
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          className={`h-8 px-2.5 text-xs rounded-lg border border-border-subtle bg-surface text-subtle-foreground hover:bg-hover hover:text-hover-foreground transition-all ${pagination.page === 1 ? "pointer-events-none opacity-40 select-none" : ""
                            }`}
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
                            className={`h-8 w-8 text-xs font-semibold rounded-lg select-none transition-all ${pagination.page === index + 1
                                ? "bg-accent text-accent-foreground shadow-xs"
                                : "bg-surface text-subtle-foreground hover:bg-hover hover:text-hover-foreground"
                              }`}
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
                          className={`h-8 px-2.5 text-xs rounded-lg border border-border-subtle bg-surface text-subtle-foreground hover:bg-hover hover:text-hover-foreground transition-all ${pagination.page === pagination.totalPages ? "pointer-events-none opacity-40 select-none" : ""
                            }`}
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
          ) : overallTotal === 0 ? (
            /* WORKSPACE STATE: ZERO DEALS EXIST AT ALL */
            <div className="flex min-h-60 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border-strong p-8 bg-surface-elevated/40 max-w-md mx-auto text-center shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent border border-accent/20 shadow-xs">
                <Briefcase className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading text-sm font-bold tracking-tight text-foreground">No Deals Registered</h3>
                <p className="text-xs text-subtle-foreground leading-normal max-w-xs">
                  It looks like you haven't created any deals for this customer yet. Click the button below to create your first deal and start tracking your sales!
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setCreateDealOpen(true)}
                className="h-9 min-h-[36px] gap-1.5 px-4 text-xs font-bold uppercase tracking-wider rounded-xl bg-accent text-accent-foreground shadow-md shadow-accent/20 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="size-3.5 stroke-[2.5]" />
                <span>Create New Deal</span>
              </Button>
            </div>
          ) : (
            /* WORKSPACE STATE: ACTIVE FILTERS MATCHED ZERO ROWS */
            <div className="flex min-h-60 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border-strong p-8 bg-surface-elevated/40 max-w-md mx-auto text-center shadow-xs animate-in fade-in-50">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface border border-border-subtle text-subtle-foreground shadow-xs">
                <Search className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading text-sm font-bold tracking-tight text-foreground">No Matches Found</h3>
                <p className="text-xs text-subtle-foreground leading-normal max-w-xs">
                  We couldn't find any deals matching the applied filters. Try adjusting or clearing your filters to get results.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="h-8 gap-1.5 text-xs font-semibold px-4 rounded-xl bg-secondary text-secondary-foreground border-border-subtle hover:bg-hover hover:text-hover-foreground cursor-pointer transition-all active:scale-95 shadow-xs"
              >
                <RefreshCw className="size-3.5" />
                <span>Clear Active Filters</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Context Engines */}
      <CustomerEditDialog open={editOpen} onOpenChange={setEditOpen} customer={currentCustomer} onSaveSuccess={fetchCustomer} />
      <DealCreateDialog open={createDealOpen} onOpenChange={setCreateDealOpen} customer={currentCustomer} onSuccess={fetchDeals} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="sm:max-w-md rounded-2xl border border-border-strong bg-surface-elevated text-surface-elevated-foreground shadow-2xl p-6">
          <AlertDialogHeader className="space-y-1.5">
            <AlertDialogTitle className="font-heading text-destructive font-bold text-base sm:text-lg">
              Are you sure you want to delete this?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm text-subtle-foreground leading-relaxed">
              This action cannot be undone. This will permanently delete the customer and all associated deals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3 flex gap-2 sm:space-x-0">
            <AlertDialogCancel className="rounded-xl border-border bg-surface text-subtle-foreground hover:bg-surface-sunken hover:text-foreground text-xs font-semibold cursor-pointer active:scale-95 transition-all">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-xs"
              disabled={isUpdating}
              onClick={handleDeleteCustomer}
            >
              {isUpdating ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomerDetails;