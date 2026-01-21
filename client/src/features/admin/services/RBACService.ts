export interface AccessRule {
    email: string;
    permission: 'view' | 'edit';
    grantedAt: string;
}

export interface RBACStore {
    [dashboardId: string]: {
        [email: string]: AccessRule;
    };
}

const STORAGE_KEY = 'cache_bi_rbac';

export const RBACService = {
    getAll: (): RBACStore => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error("Failed to load RBAC store", e);
            return {};
        }
    },

    getDashboardAccess: (dashboardId: string): AccessRule[] => {
        const store = RBACService.getAll();
        const dashboardRules = store[dashboardId] || {};
        return Object.values(dashboardRules);
    },

    grantAccess: (dashboardId: string, email: string, permission: 'view' | 'edit' = 'view'): void => {
        const store = RBACService.getAll();

        if (!store[dashboardId]) {
            store[dashboardId] = {};
        }

        store[dashboardId][email] = {
            email,
            permission,
            grantedAt: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    },

    revokeAccess: (dashboardId: string, email: string): void => {
        const store = RBACService.getAll();
        if (store[dashboardId] && store[dashboardId][email]) {
            delete store[dashboardId][email];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
        }
    },

    getUserDashboards: (email: string): string[] => {
        const store = RBACService.getAll();
        const accessibleDashboardIds: string[] = [];

        Object.keys(store).forEach(dashboardId => {
            if (store[dashboardId][email]) {
                accessibleDashboardIds.push(dashboardId);
            }
        });

        return accessibleDashboardIds;
    },

    hasAccess: (dashboardId: string, email: string): boolean => {
        const store = RBACService.getAll();
        return !!(store[dashboardId] && store[dashboardId][email]);
    }
};
