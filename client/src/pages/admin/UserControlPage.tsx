import { useState } from 'react';
import { DashboardStorageService, type Dashboard } from '@/features/builder/services/DashboardStorageService';
import { AccessControlModal } from './components/AccessControlModal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users, ShieldCheck, LayoutDashboard, Calendar } from "lucide-react";
import { RBACService } from '@/features/admin/services/RBACService';

export function UserControlPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Load fresh data on each render/interaction is fine for now
    const dashboards = DashboardStorageService.getAll();
    const rbacStore = RBACService.getAll();

    const filteredDashboards = dashboards.filter(d =>
        d.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleManageAccess = (dashboard: Dashboard) => {
        setSelectedDashboard(dashboard);
        setIsModalOpen(true);
    };

    const getAccessCount = (dashboardId: string) => {
        return Object.keys(rbacStore[dashboardId] || {}).length;
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">User Access Control</h1>
                <p className="text-muted-foreground">Manage dashboard permissions and viewer access assignment.</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search dashboards..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDashboards.map(dashboard => {
                    const userCount = getAccessCount(dashboard.id);

                    return (
                        <Card key={dashboard.id} className="group hover:shadow-lg transition-all border-muted">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <LayoutDashboard className="h-5 w-5" />
                                    </div>
                                    <Badge variant={(dashboard as any).status === 'Published' ? "default" : "secondary"}>
                                        {(dashboard as any).status || 'Draft'}
                                    </Badge>
                                </div>
                                <CardTitle className="mt-4 truncate">{dashboard.title}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(dashboard.updatedAt).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm py-2 px-3 bg-muted/30 rounded-md border border-dashed">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Users className="h-4 w-4" /> Assigned Users
                                        </span>
                                        <Badge variant="secondary" className="font-mono">{userCount}</Badge>
                                    </div>

                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        onClick={() => handleManageAccess(dashboard)}
                                    >
                                        <ShieldCheck className="mr-2 h-4 w-4" /> Manage Access
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {filteredDashboards.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/5">
                        <p>No dashboards found matching your search.</p>
                    </div>
                )}
            </div>

            <AccessControlModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                dashboard={selectedDashboard}
            />
        </div>
    );
}
