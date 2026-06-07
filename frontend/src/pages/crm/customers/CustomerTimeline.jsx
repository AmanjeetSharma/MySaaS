import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock3, MessageSquareText, Sparkles, Tag } from 'lucide-react';
import { useCustomerStore } from '@/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const getEntityId = (entity) => {
  if (!entity) return null;
  if (typeof entity === 'string') return entity;
  return entity._id || entity.id || null;
};

const formatDateTime = (value) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const getTimelineTitle = (activity) => activity?.event || activity?.customType || activity?.type || 'Activity';

const CustomerTimeline = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { timeline, isTimelineLoading, getCustomerTimeline } = useCustomerStore();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const loadTimeline = async () => {
      try {
        const data = await getCustomerTimeline(customerId);
        setCustomer(data?.customer || null);
      } catch {
        navigate('/customers');
      }
    };

    loadTimeline();
  }, [customerId, getCustomerTimeline, navigate]);

  const summaryCards = useMemo(() => {
    const summary = timeline?.summary || {};

    return [
      { label: 'Total activities', value: summary.totalActivities || 0, icon: MessageSquareText },
      { label: 'Linked deals', value: summary.uniqueDealsCount || 0, icon: Tag },
      { label: 'Timeline pages', value: timeline?.pagination?.totalPages || 0, icon: Clock3 },
    ];
  }, [timeline]);

  if (isTimelineLoading && !customer) {
    return (
      <div className="space-y-4">
        <div className="h-40 animate-pulse rounded-3xl border border-border/70 bg-muted/30" />
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-3xl border border-border/70 bg-muted/30" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-3xl border border-border/70 bg-muted/30" />
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(`/customers/${customerId}`)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to details
        </button>

        <Button variant="outline" asChild>
          <Link to={`/customers/${customerId}`}>Customer details</Link>
        </Button>
      </div>

      <section className="rounded-3xl border border-border/70 bg-gradient-to-br from-background via-background to-muted/35 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="size-3.5" />
              Activity stream
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{customer.name}</h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Timeline entries are pulled directly from the customer activity API, so your notes, bookings, and deal events stay in one view.
            </p>
          </div>

          <Badge variant="outline" className="w-fit">
            {timeline?.activities?.length || 0} visible events
          </Badge>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {summaryCards.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <Icon className="size-3.5" />
                  {item.label}
                </div>
                <p className="mt-2 text-2xl font-semibold">{item.value}</p>
              </div>
            );
          })}
        </div>
      </section>

      <Card className="overflow-hidden border-border/70">
        <CardHeader className="border-b border-border/60">
          <CardTitle>Customer timeline</CardTitle>
          <CardDescription>Ordered activity log for the customer record.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0 pt-4">
          {timeline?.activities?.length > 0 ? (
            <div className="space-y-4">
              {timeline.activities.map((activity, index) => (
                <div key={getEntityId(activity) || `${activity?.createdAt || index}-${index}`} className="relative pl-6">
                  <span className="absolute left-0 top-1.5 size-3 rounded-full bg-primary" />
                  {index < timeline.activities.length - 1 ? (
                    <span className="absolute left-1.25 top-4 bottom-[-1rem] w-px bg-border" />
                  ) : null}

                  <div className="rounded-2xl border border-border/70 bg-muted/15 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold">{getTimelineTitle(activity)}</p>
                          <Badge variant="outline">{activity.type || 'note'}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {activity.description || 'No description provided.'}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDateTime(activity.createdAt)}</span>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                      <div className="rounded-xl bg-background/70 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Event</p>
                        <p className="mt-1 font-medium">{activity.event || 'Activity recorded'}</p>
                      </div>
                      <div className="rounded-xl bg-background/70 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Linked deal</p>
                        <p className="mt-1 font-medium">
                          {activity.deal?.title ? (
                            <Link to={`/deals/${getEntityId(activity.deal)}`} className="inline-flex items-center gap-1 hover:underline">
                              {activity.deal.title}
                              <CalendarDays className="size-3.5" />
                            </Link>
                          ) : 'No linked deal'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquareText className="size-10 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-semibold">No activity yet</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Timeline events will appear here when notes, bookings, or deal-related actions are logged.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerTimeline;
