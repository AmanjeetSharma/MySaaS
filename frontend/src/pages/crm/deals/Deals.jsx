import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
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

import DealRow from "@/components/crm/customer/DealRow";
import { useDealStore, useUserStore } from "@/stores";

const getEntityId = (entity) => {
  if (!entity) return null;
  if (typeof entity === "string") return entity;
  return entity._id || entity.id || null;
};

const Deals = () => {
  const navigate = useNavigate();
  const { userProfile } = useUserStore();
  const {
    deals,
    statistics,
    pagination,
    getOrganizationDeals,
    isLoading,
  } = useDealStore();

  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    sortBy: "latestInteractionAt",
    sortOrder: "desc",
  });
  const [pageInput, setPageInput] = useState(String(query.page));

  const organizationId = getEntityId(userProfile?.activeOrganization);
  const organizationName =
    userProfile?.activeOrganization?.name ||
    userProfile?.activeOrganizationName ||
    "Your Workspace";
  const totalDeals = pagination?.total || 0;
  const overallTotal = pagination?.overallTotal || statistics?.total || 0;
  const totalPages = pagination?.totalPages || 1;

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
        setQuery((prev) => ({
          ...prev,
          search: value,
          page: 1,
        }));
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
    setQuery((prev) => ({
      ...prev,
      status: value === "all" ? "" : value,
      page: 1,
    }));
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
    setQuery((prev) => ({
      ...prev,
      page: 1,
      search: "",
      status: "",
      sortBy: "latestInteractionAt",
      sortOrder: "desc",
    }));
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
                  Please create or switch to an active workspace to access and manage your deals.
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border pb-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground select-none">
            <span className="truncate font-medium max-w-45" title={organizationName}>
              Organization: {organizationName}
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground leading-none">
            Deals
          </h1>
          <p className="text-xs text-muted-foreground font-normal max-w-md">
            Search, filter, and lifecycle track organization deals.
          </p>
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
                <EmptyTitle className="text-base font-semibold tracking-tight text-foreground">
                  No Deals Registered
                </EmptyTitle>
                <EmptyDescription className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  There are currently no deals assigned to <strong>{organizationName}</strong>. Create deals from a customer profile to start tracking opportunities.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="mt-6">
                <Button
                  size="sm"
                  onClick={() => navigate("/customers")}
                  className="h-9 text-xs font-medium px-5 gap-2 shadow-sm cursor-pointer transition-all"
                >
                  <ArrowRight className="size-4 stroke-[2.5]" />
                  <span>Go to Customers</span>
                </Button>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="bg-background border border-border rounded-lg p-3 shadow-sm" aria-labelledby="deal-metrics-heading">
            <h2 id="deal-metrics-heading" className="sr-only">
              Deal Performance Metrics
            </h2>
            <div className="grid grid-cols-2 divide-x divide-y sm:grid-cols-4 sm:divide-y-0 divide-border">
              <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Active</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">{statistics?.active || 0}</span>
                    <TrendingUp className="size-3.5 text-blue-600/70 dark:text-blue-400/70" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Won</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{statistics?.won || 0}</span>
                    <Trophy className="size-3.5 text-emerald-600/70 dark:text-emerald-400/70" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Lost</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-destructive">{statistics?.lost || 0}</span>
                    <TrendingDown className="size-3.5 text-destructive/70" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Total</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-foreground">{statistics?.total || overallTotal}</span>
                    <BarChart3 className="size-3.5 text-muted-foreground/70" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border py-2">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between rounded-lg border border-border bg-muted/20 p-1.5">
              <div className="flex items-center gap-1.5 px-2 py-0.5 text-muted-foreground">
                <Briefcase className="size-3.5" />
                <span className="text-xs font-medium text-foreground">
                  {totalDeals}
                </span>
                <span className="text-xs text-muted-foreground/80">
                  {totalDeals === 1 ? "deal found" : "deals found"}
                </span>
              </div>

              <div className="flex flex-col md:flex-row flex-1 items-stretch md:items-center gap-2 justify-end w-full lg:w-auto">
                <div className="relative w-full md:max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/70" />
                  <Input
                    id="deal-search-input"
                    placeholder="Search deals..."
                    className="h-8 w-full pl-8 text-xs placeholder:text-muted-foreground/60"
                    onChange={handleSearch}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                  <span className="text-[11px] whitespace-nowrap text-muted-foreground">
                    Status:
                  </span>
                  <Select value={query.status || "all"} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-8 w-24 text-xs cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">All</SelectItem>
                      <SelectItem value="active" className="text-xs">Active</SelectItem>
                      <SelectItem value="won" className="text-xs">Won</SelectItem>
                      <SelectItem value="lost" className="text-xs">Lost</SelectItem>
                    </SelectContent>
                  </Select>

                  <span className="text-[11px] whitespace-nowrap text-muted-foreground">
                    Filter by:
                  </span>
                  <Select onValueChange={handleSortChange} defaultValue="recentActivity">
                    <SelectTrigger className="h-8 w-36 text-xs cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recentActivity" className="text-xs">Recent Activity</SelectItem>
                      <SelectItem value="newest" className="text-xs">Newest</SelectItem>
                      <SelectItem value="oldest" className="text-xs">Oldest</SelectItem>
                      <SelectItem value="titleAsc" className="text-xs">A-Z</SelectItem>
                      <SelectItem value="titleDesc" className="text-xs">Z-A</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] whitespace-nowrap text-muted-foreground">
                      Rows:
                    </span>
                    <Select value={String(query.limit)} onValueChange={handleLimitChange}>
                      <SelectTrigger className="h-8 w-16 text-xs cursor-pointer">
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

          {isLoading ? (
            <div className="space-y-2 pt-1">
              {Array.from({ length: Math.min(query.limit || 8, 10) }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full rounded-lg border border-border/40" />
              ))}
            </div>
          ) : deals.length > 0 ? (
            <div className="space-y-4">
              <div className="divide-y divide-border/40 overflow-hidden rounded-lg border border-border/60 bg-background shadow-none">
                {deals.map((deal) => (
                  <div key={deal._id} className="p-1 bg-background hover:bg-muted/30 transition-colors">
                    <DealRow deal={deal} />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pt-1 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="text-xs text-muted-foreground text-center md:text-left">
                    Showing <span className="font-medium text-foreground">{startItem}-{endItem}</span> of{" "}
                    <span className="font-medium text-foreground">{totalDeals}</span> deals
                    <span className="mx-1.5 hidden sm:inline">•</span>
                    <span className="block sm:inline mt-0.5 sm:mt-0">
                      Page <span className="font-medium text-foreground">{pagination.page}</span> of{" "}
                      <span className="font-medium text-foreground">{totalPages}</span>
                    </span>
                  </div>

                  <div className="w-full md:w-auto flex flex-col sm:flex-row items-center justify-center md:justify-end gap-3.5">
                    <form onSubmit={handlePageSubmit} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <label htmlFor="deal-page-jumper" className="whitespace-nowrap select-none text-[11px]">Go to page</label>
                      <div className="flex items-center gap-1">
                        <Input
                          id="deal-page-jumper"
                          type="number"
                          min="1"
                          max={totalPages}
                          value={pageInput}
                          onChange={(event) => setPageInput(event.target.value)}
                          className="h-7 w-12 text-center text-xs p-0 font-medium font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <Button
                          type="submit"
                          size="sm"
                          variant="outline"
                          className="group/btn h-7 gap-1 px-2 text-[10px] font-semibold text-foreground border-border hover:text-foreground/70 hover:border-border/70 cursor-pointer shadow-sm transition-all duration-200 rounded-md"
                        >
                          <SkipForward className="size-3 text-foreground transition-all duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:text-foreground/70" />
                          <span className="transition-all duration-200">Jump</span>
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
                            onClick={(event) => {
                              event.preventDefault();
                              if (!isFirstPage) handlePageChange(pagination.page - 1);
                            }}
                          />
                        </PaginationItem>

                        {renderPaginationItems}

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            className={`h-8 px-2.5 text-xs ${isLastPage ? "pointer-events-none opacity-40 select-none" : ""}`}
                            onClick={(event) => {
                              event.preventDefault();
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
              <CardContent className="p-8 text-center">
                <Empty>
                  <EmptyHeader className="space-y-1.5">
                    <EmptyMedia
                      variant="icon"
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-background border border-border text-muted-foreground/40 shadow-inner mx-auto mb-2 select-none"
                    >
                      <Search className="size-5 stroke-[1.75]" />
                    </EmptyMedia>
                    <EmptyTitle className="text-sm font-semibold tracking-tight text-foreground">
                      No Matches Found
                    </EmptyTitle>
                    <EmptyDescription className="text-xs text-muted-foreground max-w-xs mx-auto">
                      We couldn't find any deals matching the active filters. Try adjusting your search, status, or sort parameters.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent className="mt-5 flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={resetFilters}
                      className="h-8 text-xs font-medium px-4 shadow-sm gap-1.5 cursor-pointer transition-all"
                    >
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
