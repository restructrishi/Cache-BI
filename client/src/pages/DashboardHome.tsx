import { useViewer } from "@/features/viewer/context/ViewerContext";
import { useAuth } from "@/features/auth/AuthContext";
import { DashboardStorageService } from "@/features/builder/services/DashboardStorageService";
import { RBACService } from "@/features/admin/services/RBACService";
import { DashboardCard } from "@/features/dashboard-list/components/DashboardCard";
import { ShieldAlert } from "lucide-react";

export function DashboardHome() {
    const { dateRange } = useViewer();
    const { user } = useAuth();

    // Get all Dashboards
    const allDashboards = DashboardStorageService.getAll();

    // Get User Access
    const accessibleIds = user ? RBACService.getUserDashboards(user.email) : [];

    // Filter Dashboards
    const userDashboards = allDashboards.filter(d => accessibleIds.includes(d.id));

    // Mock KPI data (in real app, this would aggregate from userDashboards)
    const kpiData = [
        { label: "Total Revenue", value: "$2.4M", change: "+12.5%", trend: "up" },
        { label: "Active Users", value: "8.5k", change: "+5.2%", trend: "up" },
        { label: "Sales Volume", value: "1,204", change: "-3.1%", trend: "down" },
        { label: "Avg. Order Value", value: "$302", change: "+8.4%", trend: "up" },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
                <p className="text-muted-foreground">Here is an overview of your assigned dashboards and performance metrics.</p>
                {dateRange?.from && dateRange?.to && (
                    <p className="text-xs text-muted-foreground">
                        Reporting Period: {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
                    </p>
                )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map((kpi, i) => (
                    <div key={i} className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                        <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                        <div className="flex items-baseline gap-2 mt-2">
                            <h3 className="text-2xl font-bold">{kpi.value}</h3>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${kpi.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {kpi.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Assigned Dashboards Grid */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">Your Dashboards</h2>

                {userDashboards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {userDashboards.map(dashboard => (
                            <DashboardCard
                                key={dashboard.id}
                                dashboard={dashboard}
                                // View-only mode for viewer
                                onClick={() => { }}
                                hideActions={true}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl bg-muted/5">
                        <div className="p-3 rounded-full bg-muted/20 mb-4">
                            <ShieldAlert className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">No Access Assigned</h3>
                        <p className="text-muted-foreground text-sm max-w-sm text-center mt-2">
                            Your account has not been assigned any dashboards yet. Please contact your administrator to request access.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
