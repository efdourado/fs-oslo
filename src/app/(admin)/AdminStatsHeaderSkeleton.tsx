import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function KPICardSkeleton() {
  return (
    <Card>
      <CardHeader className="px-6 pt-0">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-40 mt-1.5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3 text-center space-y-6">
        <Skeleton className="h-8 w-16 mx-auto" />
        <Skeleton className="h-2 w-full rounded-full" />
      </CardContent>
    </Card>
); }

export default function AdminStatsHeaderSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <KPICardSkeleton />
      <KPICardSkeleton />
      <KPICardSkeleton />
    </div>
); }