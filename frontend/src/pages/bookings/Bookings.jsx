import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import {
  CalendarCheck,
  Search,
  Building2,
  ArrowRight,
  RefreshCw,
  X,
  ArrowUpDown,
  CornerDownLeft,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

import { useUserStore, useBookingStore } from "@/stores";
import BookingRow from "@/components/booking/BookingRow";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "CONFIRMED", label: "Confirmed" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
  { id: "NO_SHOW", label: "No Show" },
  { id: "EXPIRED", label: "Expired" },
];

const Bookings = () => {
  const navigate = useNavigate();
  const { userProfile } = useUserStore();
  const {
    bookings,
    pagination,
    isLoadingBookings,
    getOrganizationBookings,
  } = useBookingStore();

  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [pageInput, setPageInput] = useState(String(query.page));

  const organizationId = userProfile?.activeOrganization || null;
  const totalBookings = pagination?.total || 0;
  const overallTotal = pagination?.overallTotal || 0;
  const totalPages = pagination?.totalPages || 1;
  const isFiltered =
    query.search.trim() !== "" ||
    (query.status !== "" && query.status !== "all");

  const fetchBookings = useCallback(async () => {
    if (!organizationId) return;
    try {
      await getOrganizationBookings({ orgId: organizationId, ...query });
    } catch (error) {
      console.error(error);
    }
  }, [organizationId, query, getOrganizationBookings]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

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

  const handleClearSearch = () => {
    const searchInput = document.getElementById("booking-search-input");
    if (searchInput) searchInput.value = "";
    setQuery((prev) => ({ ...prev, search: "", page: 1 }));
  };

  const handleSortChange = (value) => {
    const sortConfig = {
      newest: { sortBy: "createdAt", sortOrder: "desc" },
      oldest: { sortBy: "createdAt", sortOrder: "asc" },
      startAsc: { sortBy: "startTime", sortOrder: "asc" },
      startDesc: { sortBy: "startTime", sortOrder: "desc" },
    };

    if (sortConfig[value]) {
      setQuery((prev) => ({ ...prev, ...sortConfig[value], page: 1 }));
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
    setQuery((prev) => ({ ...prev, page: 1, limit: Number(value) }));
  };

  const handlePageChange = useCallback((page) => {
    setQuery((prev) => ({ ...prev, page }));
  }, []);

  const handleBookingOpen = useCallback(
    (booking) => {
      navigate(`/bookings/${booking._id}`);
    },
    [navigate]
  );

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

  const resetFilters = () => {
    setQuery((prev) => ({
      ...prev,
      page: 1,
      search: "",
      status: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    }));
    const searchInput = document.getElementById("booking-search-input");
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
              className={`h-8 w-8 text-xs font-semibold rounded-lg select-none transition-all cursor-pointer ${
                page === pageNum
                  ? "bg-foreground text-background shadow-xs font-bold"
                  : "bg-surface text-subtle-foreground hover:bg-hover hover:text-foreground border border-border-subtle"
              }`}
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
            <PaginationEllipsis className="h-8 w-8 text-subtle-foreground" />
          </PaginationItem>
        );
      }

      return (
        <PaginationItem key={item}>
          <PaginationLink
            href="#"
            className={`h-8 w-8 text-xs font-semibold rounded-lg select-none transition-all cursor-pointer ${
              page === item
                ? "bg-foreground text-background shadow-xs font-bold"
                : "bg-surface text-subtle-foreground hover:bg-hover hover:text-foreground border border-border-subtle"
            }`}
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
  const endItem = Math.min(query.page * query.limit, totalBookings);
  const isFirstPage = pagination?.page === 1;
  const isLastPage = pagination?.page === pagination?.totalPages;

  if (!organizationId && !isLoadingBookings) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 py-3">
        <Card className="max-w-md mx-auto my-8 border border-border-strong border-dashed bg-surface-elevated/40 shadow-xs animate-in fade-in-50 duration-200 rounded-2xl">
          <CardContent className="p-6">
            <Empty>
              <EmptyHeader className="space-y-1.5">
                <EmptyMedia
                  variant="icon"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface border border-border-subtle text-subtle-foreground shadow-xs mx-auto mb-2 select-none"
                >
                  <Building2 className="size-5 stroke-[1.75]" />
                </EmptyMedia>

                <EmptyTitle className="font-heading text-sm font-semibold tracking-tight text-foreground text-center">
                  No Active Organization
                </EmptyTitle>

                <EmptyDescription className="text-xs text-subtle-foreground leading-normal font-normal text-center max-w-xs mx-auto">
                  Please create or switch to an active workspace to access and manage your bookings.
                </EmptyDescription>
              </EmptyHeader>

              <EmptyContent className="mt-5 flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  onClick={() => navigate("/organizations")}
                  className="h-8 text-xs font-bold uppercase tracking-wider px-4 rounded-xl shadow-md shadow-accent/20 bg-primary text-primary-foreground hover:opacity-90 group transition-all cursor-pointer active:scale-95"
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
    <div className="max-w-screen-2xl mx-auto px-4 py-3 space-y-3 bg-background text-foreground">
      {/* 1. Header Section: Clear Identity & Real-time Metrics */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border-subtle pb-3">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-none">
              Bookings
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-surface border border-border-subtle text-subtle-foreground select-none">
              <CalendarCheck className="size-3 text-accent shrink-0" />
              <span className="font-semibold text-foreground">{totalBookings}</span>
              <span>{isFiltered ? `of ${overallTotal}` : "total"}</span>
            </span>
          </div>
          <p className="text-xs text-subtle-foreground font-normal">
            Manage appointments and monitor schedule workflows.
          </p>
        </div>
      </div>

      {/* 2. Workspace State: Zero Record Database */}
      {!isLoadingBookings && overallTotal === 0 ? (
        <Card className="border border-border-strong border-dashed bg-surface-elevated/40 max-w-xl mx-auto mt-8 shadow-xs rounded-2xl animate-in fade-in-50 duration-200">
          <CardContent className="p-8 text-center">
            <Empty>
              <EmptyHeader className="space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent border border-accent/20 shadow-xs mb-1">
                  <CalendarCheck className="size-5" />
                </div>
                <EmptyTitle className="font-heading text-base font-bold tracking-tight text-foreground">
                  No Bookings Yet
                </EmptyTitle>
                <EmptyDescription className="text-xs text-subtle-foreground leading-relaxed max-w-xs mx-auto">
                  Your organization has not received any bookings yet. Appointments will appear here once scheduled.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 3. Sticky Toolbar: Primary Triage Navigation & Scoped Filters */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border-subtle py-2 space-y-2">
            {/* Row A: Primary Status Triage Strip */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none py-0.5">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-surface border border-border-subtle shrink-0">
                {STATUS_TABS.map((tab) => {
                  const isActive =
                    (query.status === "" && tab.id === "all") ||
                    query.status === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleStatusChange(tab.id)}
                      className={`h-7 px-3 text-xs rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap select-none ${
                        isActive
                          ? "bg-foreground text-background font-semibold shadow-xs"
                          : "text-subtle-foreground hover:text-foreground hover:bg-hover"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {isFiltered && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-7 text-xs text-subtle-foreground hover:text-foreground hover:bg-hover gap-1.5 px-2.5 shrink-0 cursor-pointer rounded-lg border border-border-subtle"
                >
                  <RefreshCw className="size-3" />
                  <span>Clear filters</span>
                </Button>
              )}
            </div>

            {/* Row B: Search (Primary Query) & Refinements (Secondary Sort + Limit) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-subtle-foreground pointer-events-none" />
                <Input
                  id="booking-search-input"
                  placeholder="Search customer name, email, phone..."
                  className="h-8 w-full pl-8 pr-8 text-xs bg-surface border-border text-foreground placeholder:text-subtle-foreground/60 rounded-lg focus-visible:ring-1 focus-visible:ring-ring"
                  onChange={handleSearch}
                />
                {query.search && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-subtle-foreground hover:text-foreground rounded cursor-pointer"
                    aria-label="Clear search text"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>

              {/* Utility Controls Group: Sort & Page Density */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="size-3 text-subtle-foreground shrink-0 hidden sm:block" />
                  <span className="text-[11px] whitespace-nowrap text-subtle-foreground font-medium">
                    Sort:
                  </span>
                  <Select
                    onValueChange={handleSortChange}
                    value={
                      query.sortBy === "startTime"
                        ? query.sortOrder === "asc"
                          ? "startAsc"
                          : "startDesc"
                        : query.sortOrder === "asc"
                          ? "oldest"
                          : "newest"
                    }
                  >
                    <SelectTrigger className="h-8 w-36 text-xs rounded-lg border-border bg-surface text-foreground cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground border-border">
                      <SelectItem value="newest" className="text-xs hover:bg-hover hover:text-hover-foreground cursor-pointer">
                        Newly Created
                      </SelectItem>
                      <SelectItem value="oldest" className="text-xs hover:bg-hover hover:text-hover-foreground cursor-pointer">
                        Oldest Created
                      </SelectItem>
                      <SelectItem value="startAsc" className="text-xs hover:bg-hover hover:text-hover-foreground cursor-pointer">
                        Upcoming First
                      </SelectItem>
                      <SelectItem value="startDesc" className="text-xs hover:bg-hover hover:text-hover-foreground cursor-pointer">
                        Furthest Ahead
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="h-4 w-px bg-border-subtle" />

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] whitespace-nowrap text-subtle-foreground font-medium">
                    Rows:
                  </span>
                  <Select
                    value={String(query.limit)}
                    onValueChange={handleLimitChange}
                  >
                    <SelectTrigger className="h-8 w-18 text-xs rounded-lg border-border bg-surface text-foreground cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground border-border">
                      <SelectItem value="10" className="text-xs hover:bg-hover hover:text-hover-foreground cursor-pointer">
                        10
                      </SelectItem>
                      <SelectItem value="20" className="text-xs hover:bg-hover hover:text-hover-foreground cursor-pointer">
                        20
                      </SelectItem>
                      <SelectItem value="50" className="text-xs hover:bg-hover hover:text-hover-foreground cursor-pointer">
                        50
                      </SelectItem>
                      <SelectItem value="100" className="text-xs hover:bg-hover hover:text-hover-foreground cursor-pointer">
                        100
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Bookings Stream / States */}
          {isLoadingBookings ? (
            <div className="space-y-2.5 pt-1">
              {Array.from({ length: query.limit || 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3.5 p-3.5 rounded-xl border border-border-subtle bg-surface-elevated"
                >
                  <Skeleton className="size-16 sm:w-20 sm:h-16 rounded-lg bg-surface shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <Skeleton className="h-4 w-1/3 rounded bg-surface" />
                    <Skeleton className="h-3 w-1/2 rounded bg-surface" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full bg-surface shrink-0" />
                </div>
              ))}
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2 sm:gap-2.5">
                {bookings.map((booking) => (
                  <BookingRow
                    key={booking._id}
                    booking={booking}
                    onOpen={handleBookingOpen}
                  />
                ))}
              </div>

              {/* 5. Pagination & Counter Footer */}
              {totalPages > 1 && (
                <div className="pt-2 flex flex-col md:flex-row gap-3.5 items-center justify-between border-t border-border-subtle">
                  <div className="text-xs text-subtle-foreground text-center md:text-left">
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {startItem}–{endItem}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-foreground">
                      {totalBookings}
                    </span>{" "}
                    bookings
                    {isFiltered && (
                      <span className="text-subtle-foreground/80 ml-1">
                        (filtered from {overallTotal})
                      </span>
                    )}
                    <span className="mx-1.5 hidden sm:inline">•</span>
                    <span className="block sm:inline mt-0.5 sm:mt-0">
                      Page{" "}
                      <span className="font-semibold text-foreground">
                        {pagination.page}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-foreground">
                        {totalPages}
                      </span>
                    </span>
                  </div>

                  <div className="w-full md:w-auto flex flex-col sm:flex-row items-center justify-center md:justify-end gap-3">
                    {/* Quiet, low-weight page jumper */}
                    <form
                      onSubmit={handlePageSubmit}
                      className="flex items-center gap-1.5 text-xs text-subtle-foreground"
                    >
                      <label
                        htmlFor="page-jumper"
                        className="whitespace-nowrap select-none text-[11px]"
                      >
                        Go to:
                      </label>
                      <Input
                        id="page-jumper"
                        type="number"
                        min="1"
                        max={totalPages}
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                        className="h-7 w-12 text-center text-xs p-0 font-mono bg-surface border-border text-foreground rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-1.5 text-subtle-foreground hover:text-foreground cursor-pointer rounded-md"
                        aria-label="Jump to page"
                      >
                        <CornerDownLeft className="size-3" />
                      </Button>
                    </form>

                    <div className="h-4 w-px bg-border-subtle hidden sm:block" />

                    {/* Primary page navigation links */}
                    <Pagination className="w-auto mx-0">
                      <PaginationContent className="gap-1">
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            className={`h-8 px-2.5 text-xs rounded-lg border border-border-subtle bg-surface text-subtle-foreground hover:bg-hover hover:text-foreground transition-all cursor-pointer ${
                              isFirstPage
                                ? "pointer-events-none opacity-40 select-none"
                                : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isFirstPage)
                                handlePageChange(pagination.page - 1);
                            }}
                          />
                        </PaginationItem>

                        {renderPaginationItems}

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            className={`h-8 px-2.5 text-xs rounded-lg border border-border-subtle bg-surface text-subtle-foreground hover:bg-hover hover:text-foreground transition-all cursor-pointer ${
                              isLastPage
                                ? "pointer-events-none opacity-40 select-none"
                                : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isLastPage)
                                handlePageChange(pagination.page + 1);
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
            /* System State: Search/Filter Empty Container */
            <Card className="border border-border-strong border-dashed bg-surface-elevated/40 shadow-xs animate-in fade-in-50 duration-200 rounded-2xl">
              <CardContent className="p-8 text-center">
                <Empty>
                  <EmptyHeader className="space-y-1.5">
                    <EmptyMedia
                      variant="icon"
                      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface border border-border-subtle text-subtle-foreground shadow-xs mx-auto mb-2 select-none"
                    >
                      <Search className="size-5 stroke-[1.75]" />
                    </EmptyMedia>
                    <EmptyTitle className="font-heading text-sm font-semibold tracking-tight text-foreground">
                      No Matches Found
                    </EmptyTitle>
                    <EmptyDescription className="text-xs text-subtle-foreground max-w-xs mx-auto">
                      We couldn't find any bookings matching your active search or filters. (Total in workspace: {overallTotal})
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent className="mt-5 flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={resetFilters}
                      className="h-8 text-xs font-semibold px-4 shadow-xs gap-1.5 rounded-xl bg-secondary text-secondary-foreground border-border-subtle hover:bg-hover hover:text-hover-foreground cursor-pointer transition-all active:scale-95"
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

export default Bookings;