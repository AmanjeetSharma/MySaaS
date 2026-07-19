import React, { useCallback, useEffect, useMemo, useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import { useShallow } from "zustand/react/shallow";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  CircleDot,
  Clock3,
  RefreshCw,
  Search,
  SkipForward,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
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

import OrgDealsRow from "@/components/crm/deal/OrgDealsRow";
import { cn } from "@/lib/utils";
import { useDealStore, useUserStore } from "@/stores";

const getEntityId = (entity) => {
  if (!entity) return null;
  if (typeof entity === "string") return entity;
  return entity._id || entity.id || null;
};

const statCards = [
  { key: "active", label: "Active", description: "Open deals needing momentum", icon: TrendingUp, className: "text-sky-600 bg-sky-500/10 border-sky-500/20" },
  { key: "won", label: "Won", description: "Closed revenue", icon: Trophy, className: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" },
  { key: "lost", label: "Lost", description: "Closed lost opportunities", icon: TrendingDown, className: "text-rose-600 bg-rose-500/10 border-rose-500/20" },
  { key: "total", label: "Total", description: "All tracked deals", icon: BarChart3, className: "text-foreground bg-muted/60 border-border" },
];

const quickFilters = [
  { value: "all", label: "All" },
  { value: "noActivity", label: "No Activity" },
  { value: "recentlyCreated", label: "Recently Created" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "active", label: "Active" },
];

const getSortValue = (query) => {
  if (query.sortBy === "latestInteractionAt") return "recentActivity";
  if (query.sortBy === "title") return query.sortOrder === "asc" ? "titleAsc" : "titleDesc";
  if (query.sortBy === "createdAt") return query.sortOrder === "asc" ? "oldest" : "newest";
  return "recentActivity";
};

const DealStatCard = memo(({ card, value, isActive, onClick }) => {
  const Icon = card.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group rounded-lg border bg-background p-4 text-left shadow-xs transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive && "border-primary/40 bg-primary/5 shadow-sm"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{card.label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value || 0}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{card.description}</p>
        </div>
        <span className={cn("rounded-md border p-2 transition-transform duration-200 group-hover:scale-105", card.className)}>
          <Icon className="size-4" />
        </span>
      </div>
    </button>
  );
});
DealStatCard.displayName = "DealStatCard";

const DealRowSkeleton = memo(() => (
  <div className="rounded-lg border border-border/70 bg-background p-4">
    <div className="grid gap-4 lg:grid-cols-[minmax(260px,1.5fr)_minmax(220px,1fr)_minmax(220px,1.1fr)_150px_32px] lg:items-center">
      <div className="space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-56 max-w-full" />
          <Skeleton className="h-4 w-44 max-w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-18" />
        <Skeleton className="h-4 w-44 max-w-full" />
        <Skeleton className="h-4 w-32 max-w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-28" />
      </div>
      <div className="space-y-2 lg:text-right">
        <Skeleton className="h-3 w-16 lg:ml-auto" />
        <Skeleton className="h-5 w-24 lg:ml-auto" />
        <Skeleton className="h-3 w-20 lg:ml-auto" />
      </div>
    </div>
  </div>
));
DealRowSkeleton.displayName = "DealRowSkeleton";

const Deals = () => {
  const navigate = useNavigate();

  // Optimized: Using granular selectors with useShallow to target slice variants accurately
  const userProfile = useUserStore(useShallow((state) => state.userProfile));
  const { organization, deals, statistics, pagination, getOrganizationDeals, isLoading } = useDealStore(
    useShallow((state) => ({
      organization: state.organization,
      deals: state.deals,
      statistics: state.statistics,
      pagination: state.pagination,
      getOrganizationDeals: state.getOrganizationDeals,
      isLoading: state.isLoading,
    }))
  );


  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    sortBy: "latestInteractionAt",
    sortOrder: "desc",
  });
  const [pageInput, setPageInput] = useState(String(query.page));
  const [activeQuickFilter, setActiveQuickFilter] = useState("all");

  const organizationId = getEntityId(userProfile?.activeOrganization);
  const organizationName = organization?.name || "Your Workspace";
  const totalDeals = pagination?.total || 0;
  const overallTotal = pagination?.overallTotal || statistics?.total || 0;
  const totalPages = pagination?.totalPages || 1;
  const sortValue = getSortValue(query);

  const visibleDeals = useMemo(() => {
    if (activeQuickFilter !== "noActivity") return deals;
    return deals.filter((deal) => !deal?.latestInteractionAt && !deal?.latestActivitySummary);
  }, [activeQuickFilter, deals]);

  const fetchDeals = useCallback(async () => {
    if (!organizationId) return;
    try {
      await getOrganizationDeals(organizationId, query);
    } catch (error) {
      console.error(error);
    }
  }, [organizationId, query, getOrganizationDeals]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setQuery((prev) => ({ ...prev, search: value, page: 1 }));
        setPageInput("1");
      }, 400),
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

  const handleStatusChange = (value) => {
    setQuery((prev) => ({ ...prev, status: value === "all" ? "" : value, page: 1 }));
    setActiveQuickFilter(value === "all" ? "all" : value);
    setPageInput("1");
  };

  const handleSortChange = (value) => {
    const sortConfig = {
      recentActivity: { sortBy: "latestInteractionAt", sortOrder: "desc" },
      newest: { sortBy: "createdAt", sortOrder: "desc" },
      oldest: { sortBy: "createdAt", sortOrder: "asc" },
      titleAsc: { sortBy: "title", sortOrder: "asc" },
      titleDesc: { sortBy: "title", sortOrder: "desc" },
    };

    if (sortConfig[value]) {
      setQuery((prev) => ({ ...prev, ...sortConfig[value], page: 1 }));
      setActiveQuickFilter(value === "newest" ? "recentlyCreated" : "all");
      setPageInput("1");
    }
  };

  const handlePageChange = useCallback((page) => {
    setQuery((prev) => ({ ...prev, page }));
    setPageInput(String(page));
  }, []);

  const handleLimitChange = (value) => {
    setQuery((prev) => ({ ...prev, page: 1, limit: Number(value) }));
    setPageInput("1");
  };

  const applyQuickFilter = useCallback((value) => {
    setActiveQuickFilter(value);
    setPageInput("1");

    if (value === "all") {
      setQuery((prev) => ({ ...prev, page: 1, status: "", sortBy: "latestInteractionAt", sortOrder: "desc" }));
      return;
    }
    if (value === "recentlyCreated") {
      setQuery((prev) => ({ ...prev, page: 1, status: "", sortBy: "createdAt", sortOrder: "desc" }));
      return;
    }
    if (value === "noActivity") {
      setQuery((prev) => ({ ...prev, page: 1, status: "", sortBy: "latestInteractionAt", sortOrder: "asc" }));
      return;
    }
    setQuery((prev) => ({ ...prev, page: 1, status: value }));
  }, []);

  const handleStatFilter = useCallback((status) => {
    applyQuickFilter(status === "total" ? "all" : status);
  }, [applyQuickFilter]);

  const handleDealOpen = useCallback((deal) => {
    navigate(`/deals/${deal._id}`);
  }, [navigate]);

  const handlePageSubmit = (event) => {
    event.preventDefault();
    const targetPage = Math.max(1, window.parseInt(pageInput, 10));

    if (!Number.isNaN(targetPage)) {
      const validPage = Math.min(targetPage, totalPages);
      handlePageChange(validPage);
      setPageInput(String(validPage));
    } else {
      setPageInput(String(query.page));
    }
  };

  const resetFilters = () => {
    setQuery((prev) => ({ ...prev, page: 1, search: "", status: "", sortBy: "latestInteractionAt", sortOrder: "desc" }));
    setActiveQuickFilter("all");
    setPageInput("1");

    const searchInput = document.getElementById("deal-search-input");
    if (searchInput) searchInput.value = "";
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
              onClick={(event) => {
                event.preventDefault();
                handlePageChange(pageNum);
              }}
            >
              {pageNum}
            </PaginationLink>
          </PaginationItem>
        );
      });
    }

    const items = [1];
    let startPage = Math.max(2, page - 1);
    let endPage = Math.min(totalPages - 1, page + 1);

    if (page <= 3) {
      endPage = 4;
    } else if (page >= totalPages - 2) {
      startPage = totalPages - 3;
    }

    if (startPage > 2) items.push("ellipsis-left");
    for (let pageNum = startPage; pageNum <= endPage; pageNum += 1) {
      items.push(pageNum);
    }
    if (endPage < totalPages - 1) items.push("ellipsis-right");
    items.push(totalPages);

    return items.map((item, index) => {
      if (typeof item === "string") {
        return (
          <PaginationItem key={`ellipsis-${index}`}>
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
            onClick={(event) => {
              event.preventDefault();
              handlePageChange(item);
            }}
          >
            {item}
          </PaginationLink>
        </PaginationItem>
      );
    });
  }, [pagination, handlePageChange]);

  const startItem = totalDeals === 0 ? 0 : (query.page - 1) * query.limit + 1;
  const endItem = Math.min(query.page * query.limit, totalDeals);
  const isFirstPage = pagination?.page === 1;
  const isLastPage = pagination?.page === pagination?.totalPages;

  if (!organizationId && !isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 py-3">
        <Card className="max-w-md mx-auto my-8 border border-border border-dashed bg-muted/10 shadow-sm animate-in fade-in-50 duration-200">
          <CardContent className="p-6">
            <Empty>
              <EmptyHeader className="space-y-1.5">
                <EmptyMedia variant="icon" className="flex h-12 w-12 items-center justify-center rounded-full bg-background border border-border text-muted-foreground/80 shadow-inner mx-auto mb-2 select-none">
                  <Building2 className="size-5 stroke-[1.75]" />
                </EmptyMedia>
                <EmptyTitle className="text-sm font-semibold tracking-tight text-foreground text-center">No Active Organization</EmptyTitle>
                <EmptyDescription className="text-xs text-muted-foreground leading-normal font-normal text-center max-w-xs mx-auto">
                  Please create or switch to an active workspace to access and manage your deals.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="mt-5 flex items-center justify-center gap-2">
                <Button size="sm" variant="default" onClick={() => navigate("/organizations")} className="h-8 text-xs font-medium px-4 shadow-sm group transition-all cursor-pointer hover:bg-primary/80">
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border pb-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground select-none">
            <span className="truncate font-medium max-w-45" title={organizationName}>Organization: {organizationName}</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground leading-none">Deals</h1>
        </div>
      </div>

      {!isLoading && overallTotal === 0 ? (
        <Card className="border border-border border-dashed bg-muted/5 max-w-xl mx-auto mt-8 shadow-none animate-in fade-in-50 duration-200">
          <CardContent className="p-8 text-center">
            <Empty>
              <EmptyHeader className="space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 shadow-xs mb-1">
                  <Briefcase className="size-5" />
                </div>
                <EmptyTitle className="text-base font-semibold tracking-tight text-foreground">No Deals Registered</EmptyTitle>
                <EmptyDescription className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  Your pipeline is ready, but no opportunities have been created for <strong>{organizationName}</strong> yet. Start from a customer profile so every deal has an owner and contact context.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="mt-6">
                <Button size="sm" onClick={() => navigate("/customers")} className="h-9 text-xs font-medium px-5 gap-2 shadow-sm cursor-pointer transition-all">
                  <ArrowRight className="size-4 stroke-[2.5]" />
                  <span>Go to Customers</span>
                </Button>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <>
          <section aria-labelledby="deal-metrics-heading">
            <h2 id="deal-metrics-heading" className="sr-only">Deal Performance Metrics</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => (
                <DealStatCard
                  key={card.key}
                  card={card}
                  value={card.key === "total" ? statistics?.total || overallTotal : statistics?.[card.key]}
                  isActive={card.key === "total" ? activeQuickFilter === "all" && !query.status : query.status === card.key}
                  onClick={() => handleStatFilter(card.key)}
                />
              ))}
            </div>
          </section>

          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border py-2">
            <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-1.5">
              {/* Changed xl:flex-row to lg:flex-row and added items-stretch/center adjustments */}
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center">

                {/* UPDATED: Removed xl:max-w-sm and added flex-1 to make the search input stretch */}
                <div className="relative w-full flex-1">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/70" />
                  <Input
                    id="deal-search-input"
                    placeholder="Search deal title, customer name, or customer email..."
                    className="h-8 w-full pl-8 text-xs placeholder:text-muted-foreground/60"
                    onChange={handleSearch}
                  />
                </div>

                {/* Changed xl:ml-auto to lg:ml-0 to cooperate with the flexing input wrapper */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] whitespace-nowrap text-muted-foreground">Status:</span>
                  <Select value={query.status || "all"} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-8 w-24 text-xs cursor-pointer"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">All</SelectItem>
                      <SelectItem value="active" className="text-xs">Active</SelectItem>
                      <SelectItem value="won" className="text-xs">Won</SelectItem>
                      <SelectItem value="lost" className="text-xs">Lost</SelectItem>
                    </SelectContent>
                  </Select>

                  <span className="text-[11px] whitespace-nowrap text-muted-foreground">Sort:</span>
                  <Select onValueChange={handleSortChange} value={sortValue}>
                    <SelectTrigger className="h-8 w-36 text-xs cursor-pointer"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recentActivity" className="text-xs">Recent Activity</SelectItem>
                      <SelectItem value="newest" className="text-xs">Newest</SelectItem>
                      <SelectItem value="oldest" className="text-xs">Oldest</SelectItem>
                      <SelectItem value="titleAsc" className="text-xs">A-Z</SelectItem>
                      <SelectItem value="titleDesc" className="text-xs">Z-A</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] whitespace-nowrap text-muted-foreground">Rows:</span>
                    <Select value={String(query.limit)} onValueChange={handleLimitChange}>
                      <SelectTrigger className="h-8 w-16 text-xs cursor-pointer"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10" className="text-xs">10</SelectItem>
                        <SelectItem value="20" className="text-xs">20</SelectItem>
                        <SelectItem value="50" className="text-xs">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-md border border-border/70 bg-background px-2 py-1 text-muted-foreground">
                    <Briefcase className="size-3.5" />
                    <span className="text-xs font-semibold text-foreground">{activeQuickFilter === "noActivity" ? visibleDeals.length : totalDeals}</span>
                    <span className="text-xs text-muted-foreground/80">{totalDeals === 1 ? "deal found" : "deals found"}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-2">
                <span className="mr-1 text-[11px] font-medium text-muted-foreground">Quick filters</span>
                {quickFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => applyQuickFilter(filter.value)}
                    className={cn(
                      "inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-[11px] font-medium transition-all",
                      "hover:border-primary/30 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                      activeQuickFilter === filter.value ? "border-primary/40 bg-background text-foreground shadow-xs" : "border-border/70 bg-transparent text-muted-foreground"
                    )}
                  >
                    {filter.value === "noActivity" && <AlertCircle className="size-3" />}
                    {filter.value === "recentlyCreated" && <Clock3 className="size-3" />}
                    {["active", "won", "lost"].includes(filter.value) && <CircleDot className="size-3" />}
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2 pt-1" aria-busy="true" aria-live="polite">
              {Array.from({ length: Math.min(query.limit || 8, 10) }).map((_, index) => <DealRowSkeleton key={index} />)}
            </div>
          ) : visibleDeals.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                {visibleDeals.map((deal) => (
                  <OrgDealsRow key={deal._id} deal={deal} onOpen={handleDealOpen} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pt-1 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="text-xs text-muted-foreground text-center md:text-left">
                    Showing <span className="font-medium text-foreground">{startItem}-{endItem}</span> of <span className="font-medium text-foreground">{totalDeals}</span> deals
                    <span className="mx-1.5 hidden sm:inline">•</span>
                    <span className="block sm:inline mt-0.5 sm:mt-0">Page <span className="font-medium text-foreground">{pagination.page}</span> of <span className="font-medium text-foreground">{totalPages}</span></span>
                  </div>

                  <div className="w-full md:w-auto flex flex-col sm:flex-row items-center justify-center md:justify-end gap-3.5">
                    <form onSubmit={handlePageSubmit} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <label htmlFor="deal-page-jumper" className="whitespace-nowrap select-none text-[11px]">Go to page</label>
                      <div className="flex items-center gap-1">
                        <Input id="deal-page-jumper" type="number" min="1" max={totalPages} value={pageInput} onChange={(event) => setPageInput(event.target.value)} className="h-7 w-12 text-center text-xs p-0 font-medium font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        <Button type="submit" size="sm" variant="outline" className="group/btn h-7 gap-1 px-2 text-[10px] font-semibold text-foreground border-border hover:text-foreground/70 hover:border-border/70 cursor-pointer shadow-sm transition-all duration-200 rounded-md">
                          <SkipForward className="size-3 text-foreground transition-all duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:text-foreground/70" />
                          <span className="transition-all duration-200">Jump</span>
                        </Button>
                      </div>
                    </form>

                    <div className="h-4 w-px bg-border/60 hidden sm:block" />

                    <Pagination className="w-auto mx-0">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious href="#" className={`h-8 px-2.5 text-xs ${isFirstPage ? "pointer-events-none opacity-40 select-none" : ""}`} onClick={(event) => { event.preventDefault(); if (!isFirstPage) handlePageChange(pagination.page - 1); }} />
                        </PaginationItem>
                        {renderPaginationItems}
                        <PaginationItem>
                          <PaginationNext href="#" className={`h-8 px-2.5 text-xs ${isLastPage ? "pointer-events-none opacity-40 select-none" : ""}`} onClick={(event) => { event.preventDefault(); if (!isLastPage) handlePageChange(pagination.page + 1); }} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card className="border border-border border-dashed bg-muted/10 shadow-sm animate-in fade-in-50 duration-200">
              <CardContent className="p-8 text-center">
                <Empty>
                  <EmptyHeader className="space-y-1.5">
                    <EmptyMedia variant="icon" className="flex h-12 w-12 items-center justify-center rounded-full bg-background border border-border text-muted-foreground/40 shadow-inner mx-auto mb-2 select-none">
                      <Search className="size-5 stroke-[1.75]" />
                    </EmptyMedia>
                    <EmptyTitle className="text-sm font-semibold tracking-tight text-foreground">No Deals Match This View</EmptyTitle>
                    <EmptyDescription className="text-xs text-muted-foreground max-w-xs mx-auto">This filter is useful when the pipeline is busy, but there are no deals in it right now. Clear the filters to return to the full pipeline.</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent className="mt-5 flex items-center justify-center">
                    <Button size="sm" variant="outline" onClick={resetFilters} className="h-8 text-xs font-medium px-4 shadow-sm gap-1.5 cursor-pointer transition-all">
                      <RefreshCw className="size-3.5" />
                      <span>Clear Active Filters</span>
                    </Button>
                  </EmptyContent>
                </Empty>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Deals;