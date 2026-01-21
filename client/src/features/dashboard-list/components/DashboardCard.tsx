import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Calendar, BarChart3 } from "lucide-react";
import type { Dashboard } from "@/features/builder/services/DashboardStorageService";
import { formatDistanceToNow } from "date-fns";

interface DashboardCardProps {
    dashboard: Dashboard;
    onClick: () => void;
    hideActions?: boolean;
}

export function DashboardCard({ dashboard, onClick, hideActions }: DashboardCardProps) {
    return (
        <Card
            className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/20 cursor-pointer"
            onClick={onClick}
        >
            <div className="aspect-[16/9] bg-muted/30 flex items-center justify-center p-6 border-b group-hover:bg-muted/50 transition-colors">
                {/* Placeholder thumbnail - in real app, we'd generate a screenshot */}
                <div className="w-full h-full rounded-md border-2 border-dashed border-muted-foreground/10 flex flex-col items-center justify-center gap-2">
                    <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
                </div>
            </div>

            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                        <h3 className="font-semibold leading-none tracking-tight group-hover:text-primary transition-colors">
                            {dashboard.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                            {dashboard.widgets.length} visuals • {dashboard.datasetId ? 'Connected Data' : 'Draft'}
                        </p>
                    </div>
                    {!hideActions && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 -m-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="mt-4 flex items-center text-xs text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span>Edited {formatDistanceToNow(new Date(dashboard.updatedAt), { addSuffix: true })}</span>
                </div>
            </div>
        </Card>
    );
}
