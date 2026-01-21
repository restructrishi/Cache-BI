import type { Widget } from '../types';

export interface Dashboard {
    id: string;
    title: string;
    widgets: Widget[];
    layout?: any[]; // For RGL layout persistence
    datasetId?: string;
    createdAt: string;
    updatedAt: string;
}

const STORAGE_KEY = 'cache_bi_dashboards';

export const DashboardStorageService = {
    getAll: (): Dashboard[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to load dashboards", e);
            return [];
        }
    },

    getById: (id: string): Dashboard | undefined => {
        const dashboards = DashboardStorageService.getAll();
        return dashboards.find(d => d.id === id);
    },

    save: (dashboard: Dashboard): void => {
        try {
            const dashboards = DashboardStorageService.getAll();
            const index = dashboards.findIndex(d => d.id === dashboard.id);
            if (index >= 0) {
                dashboards[index] = { ...dashboard, updatedAt: new Date().toISOString() };
            } else {
                dashboards.push({ ...dashboard, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
        } catch (e) {
            console.error("Failed to save dashboard", e);
        }
    },

    delete: (id: string): void => {
        try {
            const dashboards = DashboardStorageService.getAll();
            const filtered = dashboards.filter(d => d.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        } catch (e) {
            console.error("Failed to delete dashboard", e);
        }
    }
};
