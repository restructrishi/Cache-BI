import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Widget, WidgetType, FilterState } from '../types';
import type ReactGridLayout from 'react-grid-layout';
import { DatasetService, type Dataset } from '../services/DatasetService';

interface BuilderContextType {
    widgets: Widget[];
    selectedWidgetId: string | null;
    addWidget: (type: WidgetType, position?: { x: number, y: number }) => void;
    removeWidget: (id: string) => void;
    updateWidgetLayout: (layout: ReactGridLayout.Layout[]) => void;
    selectWidget: (id: string | null) => void;
    updateWidgetConfig: (id: string, config: Partial<Widget['config']>) => void;
    updateWidgetFilters: (id: string, filters: Partial<FilterState> | undefined) => void;
    dashboardTitle: string;
    setDashboardTitle: (title: string) => void;
    activeDataset: Dataset | null;
    loadDataset: (dataset: Dataset) => void;
    
    // Region Mapping
    regionColumnId: string | null;
    setRegionColumnId: (colId: string | null) => void;
    
    // Undo/Redo
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;

    // Filters
    filters: FilterState;
    setFilters: (filters: Partial<FilterState>) => void;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export function BuilderProvider({ children }: { children: React.ReactNode }) {
    // State
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
    const [dashboardTitle, setDashboardTitle] = useState("New Dashboard");
    const [activeDataset, setActiveDataset] = useState<Dataset | null>(() => DatasetService.getSampleDataset());
    const [regionColumnId, setRegionColumnId] = useState<string | null>(null);
    
    // Filters State
    const [filters, setFiltersState] = useState<FilterState>({
        dateRange: undefined,
        selectedRegions: []
    });

    // History State
    const [past, setPast] = useState<Widget[][]>([]);
    const [future, setFuture] = useState<Widget[][]>([]);

    // Helper to push to history
    const pushToHistory = useCallback((currentWidgets: Widget[]) => {
        setPast(prev => [...prev, currentWidgets]);
        setFuture([]);
    }, []);

    // Action Wrappers with History
    const addWidget = (type: WidgetType) => {
        pushToHistory(widgets);
        const id = uuidv4();
        const newWidget: Widget = {
            id,
            type,
            layout: { w: 6, h: 4, x: 0, y: 0, i: id },
            config: {
                title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Chart`
            }
        };
        setWidgets(prev => [...prev, newWidget]);
        setSelectedWidgetId(id);
    };

    const removeWidget = (id: string) => {
        pushToHistory(widgets);
        setWidgets(prev => prev.filter(w => w.id !== id));
        if (selectedWidgetId === id) setSelectedWidgetId(null);
    };

    const updateWidgetLayout = (layouts: ReactGridLayout.Layout[]) => {
        // Only push to history if layout actually changed significantly
        // For now, we push on every update which might be noisy during drag, 
        // but react-grid-layout usually calls this on drag stop.
        // We'll assume 'layouts' comes from onLayoutChange which fires on drag stop.
        
        // Check if layout is different to avoid duplicate history
        const hasChanges = widgets.some(w => {
            const l = layouts.find(layout => layout.i === w.id);
            return l && (l.x !== w.layout.x || l.y !== w.layout.y || l.w !== w.layout.w || l.h !== w.layout.h);
        });

        if (hasChanges) {
            pushToHistory(widgets);
            setWidgets(prev => prev.map(w => {
                const l = layouts.find(layout => layout.i === w.id);
                if (l) return { ...w, layout: { ...w.layout, x: l.x, y: l.y, w: l.w, h: l.h } };
                return w;
            }));
        }
    };

    const updateWidgetConfig = (id: string, config: Partial<Widget['config']>) => {
        pushToHistory(widgets);
        setWidgets(prev => prev.map(w => w.id === id ? { ...w, config: { ...w.config, ...config } } : w));
    };

    const undo = () => {
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        
        setFuture(prev => [widgets, ...prev]);
        setWidgets(previous);
        setPast(newPast);
    };

    const redo = () => {
        if (future.length === 0) return;
        const next = future[0];
        const newFuture = future.slice(1);

        setPast(prev => [...prev, widgets]);
        setWidgets(next);
        setFuture(newFuture);
    };

    const selectWidget = (id: string | null) => setSelectedWidgetId(id);

    const loadDataset = (dataset: Dataset) => {
        setActiveDataset(dataset);
    };

    const updateFilters = (newFilters: Partial<FilterState>) => {
        setFiltersState(prev => ({ ...prev, ...newFilters }));
    };

    // Keyboard Shortcuts for Undo/Redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
                e.preventDefault();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                redo();
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [widgets, past, future]); // Dependencies needed for closures

    return (
        <BuilderContext.Provider value={{
            widgets,
            addWidget,
            removeWidget,
            updateWidgetLayout,
            updateWidgetConfig,
            selectedWidgetId,
            selectWidget,
            dashboardTitle,
            setDashboardTitle,
            activeDataset,
            loadDataset,
            regionColumnId,
            setRegionColumnId,
            undo,
            redo,
            canUndo: past.length > 0,
            canRedo: future.length > 0,
            filters,
            setFilters: updateFilters
        }}>
            {children}
        </BuilderContext.Provider>
    );
}

export function useBuilder() {
    const context = useContext(BuilderContext);
    if (!context) throw new Error('useBuilder must be used within BuilderProvider');
    return context;
}
