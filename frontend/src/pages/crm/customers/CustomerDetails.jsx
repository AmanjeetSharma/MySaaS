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

  if (isLoading && !currentCustomer) {
    return (
      <div className="space-y-4" aria-busy="true" aria-live="polite">
        <Skeleton className="h-10 w-52" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!currentCustomer) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex min-h-[300px] flex-col items-center justify-center gap-3">
          <Building2 className="size-8 text-muted-foreground opacity-60" />
          <h2 className="text-lg font-medium tracking-tight">Customer Not Found</h2>
          <Button variant="outline" size="sm" onClick={() => navigate("/customers")}>
            Back to Directory
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { deals, statistics, pagination } = customerDeals;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Action Header Line */}
      <div>
        <Button
          variant="ghost"
          className="gap-2 px-2 text-muted-foreground hover:text-foreground transition-colors"
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

      {/* Compact High-Density Scoreboard */}
      {statistics && (
        <section
          className="bg-background border border-border rounded-xl p-3 shadow-sm"
          aria-labelledby="metrics-summary-heading"
        >
          <h2 id="metrics-summary-heading" className="sr-only">Customer Deal Performance Metrics</h2>
          <div className="grid grid-cols-2 divide-x divide-y-0 sm:grid-cols-4 divide-border">

            {/* Active Deals Metric */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Active
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                    {statistics.active || 0}
                  </span>
                  <TrendingUp className="size-3.5 text-blue-600/70 dark:text-blue-400/70" />
                </div>
              </div>
            </div>

            {/* Won Deals Metric */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Won
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                    {statistics.won || 0}
                  </span>
                  <Trophy className="size-3.5 text-emerald-600/70 dark:text-emerald-400/70" />
                </div>
              </div>
            </div>

            {/* Lost Deals Metric */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Lost
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-destructive">
                    {statistics.lost || 0}
                  </span>
                  <TrendingDown className="size-3.5 text-destructive/70" />
                </div>
              </div>
            </div>

            {/* Total Deals Metric */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Total
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-foreground">
                    {statistics.total || 0}
                  </span>
                  <BarChart3 className="size-3.5 text-muted-foreground/70" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Deals Datatable Wrapper Component */}
      <Card className="border-border shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border/40 pb-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Deal Management</h2>
              <p className="text-xs text-muted-foreground">Monitor and lifecycle track your deals</p>
            </div>

            {/* Realigned Sequence Grid from Left to Right */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* 1. Search Element */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                <Input
                  placeholder="Search by title..."
                  className="pl-9 h-9 text-sm"
                  onChange={handleSearch}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
                <span className="hidden sm:inline-flex text-sm text-muted-foreground whitespace-nowrap">Status:</span>
                {/* 2. Status Control */}
                <Select onValueChange={handleStatusChange} defaultValue="all">
                  <SelectTrigger className="h-9 w-full sm:w-32 text-sm cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>

                {/* 3. Sort Control */}
                <span className="hidden sm:inline-flex text-sm text-muted-foreground whitespace-nowrap">Filter by:</span>
                <Select onValueChange={handleSortChange} defaultValue="newest">
                  <SelectTrigger className="h-9 w-full sm:w-40 text-sm cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">New</SelectItem>
                    <SelectItem value="oldest">Old</SelectItem>
                    <SelectItem value="titleAsc">A-Z</SelectItem>
                    <SelectItem value="titleDesc">Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 4. Rows per page Control */}
              <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground whitespace-nowrap min-w-fit">
                <span>Rows per page:</span>
                <Select onValueChange={handleLimitChange} defaultValue="10">
                  <SelectTrigger className="h-9 w-20 text-sm cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Deals Content Stream */}
          {isCustomerDealsLoading ? (
            <div className="space-y-3" aria-busy="true">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : deals?.length > 0 ? (
            <>
              <div className="divide-y divide-border/40 border rounded-lg overflow-hidden bg-muted/10">
                {deals.map((deal) => (
                  <div key={deal._id} className="p-1 bg-background hover:bg-muted/30 transition-colors">
                    <DealRow deal={deal} />
                  </div>
                ))}
              </div>

              {pagination?.totalPages > 1 && (
                <div className="pt-2">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
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
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6">
              <p className="text-sm text-muted-foreground">No active deals match current parameters</p>
              <Button size="sm" variant="secondary" onClick={() => setCreateDealOpen(true)}>
                <Plus className="mr-1.5 size-4" />
                Initialize First Deal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Context Engines */}
      <CustomerEditDialog open={editOpen} onOpenChange={setEditOpen} customer={currentCustomer} />
      <DealCreateDialog open={createDealOpen} onOpenChange={setCreateDealOpen} customer={currentCustomer} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer and all associated deals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer"
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