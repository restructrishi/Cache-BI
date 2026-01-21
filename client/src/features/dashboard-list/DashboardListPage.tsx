import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardCard } from './components/DashboardCard';
import { NewProjectWizard } from './components/NewProjectWizard';
import { DashboardStorageService } from '@/features/builder/services/DashboardStorageService';
import { useBuilder } from '@/features/builder/context/BuilderContext';
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid } from "lucide-react";
import type { Dataset } from '@/features/builder/services/DatasetService';

export function DashboardListPage() {
    const navigate = useNavigate();
    const { loadDataset, setDashboardTitle } = useBuilder();
    const dashboards = DashboardStorageService.getAll();
    const [wizardOpen, setWizardOpen] = useState(false);

    const handleCreateProject = ({ title, dataset }: { title: string, dataset: Dataset }) => {
        // 1. Set context data
        setDashboardTitle(title);
        loadDataset(dataset);

        // 2. Navigate to builder
        navigate(`/dashboards/new`);

        // Note: Actual saving happens in builder on "Save", 
        // but we might want to auto-save an empty draft? 
        // For MVP, passing via context is fine. 
        // Ideally we pass state via location state or create a draft record immediately.
        // Let's rely on Context for the session.
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboards</h1>
                    <p className="text-muted-foreground mt-1">Manage your analysis projects and reports.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setWizardOpen(true)} className="shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-4 w-4" /> New Project
                    </Button>
                </div>
            </div>

            {/* List */}
            {dashboards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl bg-muted/10">
                    <div className="p-4 rounded-full bg-muted/30 mb-4">
                        <LayoutGrid className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No dashboards yet</h3>
                    <p className="text-muted-foreground text-sm max-w-sm text-center mt-2 mb-6">
                        Create your first dashboard by importing data or using a template.
                    </p>
                    <Button onClick={() => setWizardOpen(true)}>Create Dashboard</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {dashboards.map(dashboard => (
                        <DashboardCard
                            key={dashboard.id}
                            dashboard={dashboard}
                            onClick={() => navigate(`/dashboards/${dashboard.id}/edit`)}
                        />
                    ))}
                </div>
            )}

            <NewProjectWizard
                open={wizardOpen}
                onOpenChange={setWizardOpen}
                onComplete={handleCreateProject}
            />
        </div>
    );
}
