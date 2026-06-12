import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { debounce } from "lodash";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMemo } from "react";
import {
  ArrowLeft,
  Building2,
  Plus,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Button,
} from "@/components/ui/button";

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

import {
  Skeleton,
} from "@/components/ui/skeleton";

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

import {
  useCustomerStore,
} from "@/stores";

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

  console.log("Current Customer:", currentCustomer);
  const [editOpen, setEditOpen] =
    useState(false);

  const [createDealOpen, setCreateDealOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const fetchCustomer =
    useCallback(async () => {
      if (!customerId) return;

      try {
        await getCustomer(customerId);
      } catch (error) {
        console.error(error);
      }
    }, [customerId, getCustomer]);

  const fetchDeals =
    useCallback(async () => {
      if (!customerId) return;

      try {
        await getCustomerDeals(
          customerId,
          query
        );
      } catch (error) {
        console.error(error);
      }
    }, [
      customerId,
      query,
      getCustomerDeals,
    ]);

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
      newest: {
        sortBy: "createdAt",
        sortOrder: "desc",
      },

      oldest: {
        sortBy: "createdAt",
        sortOrder: "asc",
      },

      titleAsc: {
        sortBy: "title",
        sortOrder: "asc",
      },

      titleDesc: {
        sortBy: "title",
        sortOrder: "desc",
      },
    };

    setQuery((prev) => ({
      ...prev,
      ...sortMap[value],
      page: 1,
    }));
  };

  const handleDeleteCustomer =
    async () => {
      try {
        await deleteCustomer(customerId);

        navigate("/customers");
      } catch (error) {
        console.error(error);
      }
    };

  const handleStatusChange = (
    status
  ) => {
    setQuery((prev) => ({
      ...prev,
      page: 1,
      status:
        status === "all"
          ? ""
          : status,
    }));
  };

  const handlePageChange = (
    page
  ) => {
    setQuery((prev) => ({
      ...prev,
      page,
    }));
  };

  if (
    isLoading &&
    !currentCustomer
  ) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-52" />
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!currentCustomer) {
    return (
      <Card>
        <CardContent className="flex min-h-[300px] flex-col items-center justify-center gap-3">
          <Building2 className="size-8 text-muted-foreground" />

          <h2 className="text-lg font-medium">
            Customer Not Found
          </h2>

          <Button
            onClick={() =>
              navigate("/customers")
            }
          >
            Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  const {
    deals,
    statistics,
    pagination,
  } = customerDeals;

  return (
    <div className="space-y-6">
      {/* Back */}

      <Button
        variant="ghost"
        className="gap-2 px-0"
        onClick={() =>
          navigate("/customers")
        }
      >
        <ArrowLeft className="size-4" />
        Back to Customers
      </Button>

      {/* Customer Card */}

      <CustomerDetailsCard
        customer={currentCustomer}
        onEdit={() =>
          setEditOpen(true)
        }
        onCreateDeal={() =>
          setCreateDealOpen(true)
        }
        onDelete={() =>
          setDeleteOpen(true)
        }
      />

      {/* Statistics */}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              Active
            </p>

            <h3 className="text-2xl font-bold">
              {statistics.active}
            </h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              Won
            </p>

            <h3 className="text-2xl font-bold">
              {statistics.won}
            </h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              Lost
            </p>

            <h3 className="text-2xl font-bold">
              {statistics.lost}
            </h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              Total
            </p>

            <h3 className="text-2xl font-bold">
              {statistics.total}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Deals */}

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            <h2 className="text-lg font-semibold">
              Deals
            </h2>

            <div className="flex flex-wrap gap-2">

              {/* Search */}

              <div className="relative w-62.5">
                <Search
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />

                <Input
                  placeholder="Search by title..."
                  className="pl-9"
                  onChange={handleSearch}
                />
              </div>

              {/* Status */}

              <Select
                onValueChange={handleStatusChange}
                defaultValue="all"
              >
                <SelectTrigger className="w-37.5 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">
                    All Status
                  </SelectItem>

                  <SelectItem value="active">
                    Active
                  </SelectItem>

                  <SelectItem value="won">
                    Won
                  </SelectItem>

                  <SelectItem value="lost">
                    Lost
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}

              <Select
                onValueChange={handleSortChange}
                defaultValue="newest"
              >
                <SelectTrigger className="w-45 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="newest">
                    Newest
                  </SelectItem>

                  <SelectItem value="oldest">
                    Oldest
                  </SelectItem>

                  <SelectItem value="titleAsc">
                    A-Z
                  </SelectItem>

                  <SelectItem value="titleDesc">
                    Z-A
                  </SelectItem>

                </SelectContent>
              </Select>

            </div>

          </div>

          {isCustomerDealsLoading ? (
            <div className="space-y-3">
              {Array.from({
                length: 5,
              }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-24 rounded-lg"
                />
              ))}
            </div>
          ) : deals?.length > 0 ? (
            <>
              <div className="space-y-3">
                {deals.map((deal) => (
                  <DealRow
                    key={deal._id}
                    deal={deal}
                  />
                ))}
              </div>

              {pagination?.totalPages >
                1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();

                            if (
                              pagination.page >
                              1
                            ) {
                              handlePageChange(
                                pagination.page -
                                1
                              );
                            }
                          }}
                        />
                      </PaginationItem>

                      {Array.from({
                        length:
                          pagination.totalPages,
                      }).map(
                        (_, index) => (
                          <PaginationItem
                            key={index}
                          >
                            <PaginationLink
                              href="#"
                              isActive={
                                pagination.page ===
                                index + 1
                              }
                              onClick={(
                                e
                              ) => {
                                e.preventDefault();

                                handlePageChange(
                                  index + 1
                                );
                              }}
                            >
                              {index + 1}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();

                            if (
                              pagination.page <
                              pagination.totalPages
                            ) {
                              handlePageChange(
                                pagination.page +
                                1
                              );
                            }
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
            </>
          ) : (
            <div className="flex min-h-[180px] flex-col items-center justify-center gap-3">
              <p className="text-sm text-muted-foreground">
                No deals found
              </p>

              <Button
                size="sm"
                onClick={() =>
                  setCreateDealOpen(true)
                }
              >
                <Plus className="mr-2 size-4" />
                Create Deal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}

      <CustomerEditDialog
        open={editOpen}
        onOpenChange={
          setEditOpen
        }
        customer={currentCustomer}
      />

      <DealCreateDialog
        open={createDealOpen}
        onOpenChange={
          setCreateDealOpen
        }
        customer={currentCustomer}
      />

      <AlertDialog
        open={deleteOpen}
        onOpenChange={
          setDeleteOpen
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Customer
            </AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={
                isUpdating
              }
              onClick={
                handleDeleteCustomer
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomerDetails;