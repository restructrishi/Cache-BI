import { useNavigate, useParams } from 'react-router-dom';
import { DashboardStorageService, type Dashboard } from '../services/DashboardStorageService';
import { useBuilder } from '../context/BuilderContext';
import { VisualsPanel } from './VisualsPanel';
import { FieldsPanel } from './FieldsPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { CanvasGrid } from './CanvasGrid';
import { FiltersPanel } from './FiltersPanel';
import { TemplateLibrary } from './TemplateLibrary';
import { DataViewModal } from './DataViewModal';
import { Button } from "@/components/ui/button";
import { Save, Eye, Undo2, Redo2, Share2, LayoutTemplate } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from 'react';

function BuilderHeader() {
    const { dashboardTitle, setDashboardTitle, widgets, undo, redo, canUndo, canRedo } = useBuilder();
    const { id } = useParams();
    const navigate = useNavigate();
    const [isViewOpen, setIsViewOpen] = useState(false);

    const handleSave = (isDraft: boolean = true) => {
        const dashboard: Dashboard = {
            id: id || crypto.randomUUID(),
            title: dashboardTitle,
            widgets: widgets,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        DashboardStorageService.save(dashboard);
        console.log("Saved dashboard:", dashboard);
        if (!id) {
            navigate(`/dashboards/${dashboard.id}/edit`);
        }
        alert(isDraft ? "Dashboard saved as draft!" : "Dashboard published!");
    }

    return (
        <header className="h-14 border-b px-4 flex items-center justify-between bg-card z-20 shadow-sm">
            <div className="flex items-center gap-4 flex-1">
                <Button variant="ghost" size="icon" className="mr-2" onClick={() => navigate('/dashboards')}>
                    <LayoutTemplate className="h-5 w-5" />
                </Button>
                <div className="flex flex-col">
                    <Input
                        value={dashboardTitle}
                        onChange={(e) => setDashboardTitle(e.target.value)}
                        className="h-8 w-64 border-transparent hover:border-border focus:border-primary font-semibold text-lg px-2 -ml-2 bg-transparent"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center bg-muted/30 rounded-lg p-1 mr-4 border">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={undo}
                        disabled={!canUndo}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={redo}
                        disabled={!canRedo}
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo2 className="h-4 w-4" />
                    </Button>
                </div>

                <Button variant="ghost" size="sm" onClick={() => setIsViewOpen(true)}>
                    <Eye className="mr-2 h-4 w-4" /> View Data
                </Button>
                <DataViewModal open={isViewOpen} onOpenChange={setIsViewOpen} />

                <div className="h-6 w-px bg-border mx-2" />

                <Button variant="outline" size="sm" onClick={() => handleSave(true)}>
                    <Save className="mr-2 h-4 w-4" /> Save Draft
                </Button>
                <Button size="sm" onClick={() => handleSave(false)}>
                    <Share2 className="mr-2 h-4 w-4" /> Publish
                </Button>
            </div>
        </header>
    );
}

function BuilderLayoutContent() {
    return (
        <div className="flex flex-col h-screen w-full bg-background overflow-hidden font-sans text-foreground">
            <BuilderHeader />

            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - Visuals & Filters */}
                <div className="w-80 border-r bg-card flex flex-col h-full transition-all duration-300 ease-in-out shadow-xl z-20">
                    {/* Visualizations - Dynamic Height (Auto-collapsing) */}
                    <div className="flex-none flex flex-col border-b relative z-10 bg-card transition-all duration-300">
                        <VisualsPanel />
                    </div>

                    {/* Filters - Takes Remaining Space & Shifts Up */}
                    <div className="flex-1 min-h-0 flex flex-col relative z-0 overflow-hidden bg-card transition-all duration-300">
                        <FiltersPanel />
                    </div>
                </div>

                {/* Center Canvas */}
                <div className="flex-1 overflow-hidden relative shadow-inner bg-slate-50 dark:bg-slate-900">
                    <CanvasGrid />
                </div>

                {/* Right Panel - Fields & Properties */}
                <div className="w-72 border-l bg-card flex flex-col">
                    <div className="flex-1 border-b p-4 overflow-auto">
                        <FieldsPanel />
                    </div>
                    <div className="flex-1 p-4 overflow-auto bg-muted/10">
                        <PropertiesPanel />
                    </div>
                </div>
            </div>
        </div >
    );
}

export function DashboardBuilderLayout() {
    return (
        <DashboardLoader />
    )
}

function DashboardLoader() {
    return <BuilderLayoutContent />;
}
