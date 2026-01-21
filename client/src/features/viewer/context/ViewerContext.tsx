import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { addDays, subDays, isWithinInterval, parseISO } from "date-fns";

// --- Types ---

export type DateRange = {
    from: Date | undefined;
    to: Date | undefined;
};

export interface ViewerContextType {
    // State
    dateRange: DateRange | undefined;
    selectedRegions: string[];

    // Actions
    setDateRange: (range: DateRange | undefined) => void;
    setSelectedRegions: (regions: string[]) => void;

    // Data (Mocked but reactive)
    kpiData: {
        revenue: string;
        revenueChange: string;
        users: string;
        usersChange: string;
        bounceRate: string;
        bounceRateChange: string;
        avgSession: string;
        avgSessionChange: string;
    };
    recentActivity: {
        user: string;
        action: string;
        time: string;
    }[];
}

// --- Context ---

const ViewerContext = createContext<ViewerContextType | undefined>(undefined);

export function useViewer() {
    const context = useContext(ViewerContext);
    if (!context) {
        throw new Error("useViewer must be used within a ViewerProvider");
    }
    return context;
}

// --- Provider ---

export function ViewerProvider({ children }: { children: ReactNode }) {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

    // Mock Data State
    const [kpiData, setKpiData] = useState({
        revenue: "$1,204,500",
        revenueChange: "+12.5%",
        users: "34,200",
        usersChange: "+5.1%",
        bounceRate: "42.3%",
        bounceRateChange: "-2.1%",
        avgSession: "4m 32s",
        avgSessionChange: "+0.8%"
    });

    // Reactive Logic (Simulating data fetching based on filters)
    useEffect(() => {
        // This is a simulation of data changing based on filters
        // In a real app, this would trigger an API call

        // 1. Regions Effect
        const regionFactor = selectedRegions.length > 0 ? (selectedRegions.length / 29) : 1;

        // 2. Date Factor
        let dateFactor = 1;
        if (dateRange?.from && dateRange?.to) {
            const days = (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24);
            // Normalize assuming ~30 days is baseline
            dateFactor = Math.max(0.1, days / 30);
        }

        // Apply factors to base numbers
        const baseRevenue = 1204500;
        const baseUsers = 34200;

        const adjRevenue = Math.floor(baseRevenue * regionFactor * dateFactor);
        const adjUsers = Math.floor(baseUsers * regionFactor * dateFactor);

        setKpiData({
            revenue: `$${adjRevenue.toLocaleString()}`,
            revenueChange: regionFactor < 1 ? "-5.2%" : "+12.5%", // Dummy logic
            users: adjUsers.toLocaleString(),
            usersChange: regionFactor < 1 ? "-1.2%" : "+5.1%",
            bounceRate: "42.3%",
            bounceRateChange: "-2.1%",
            avgSession: "4m 32s",
            avgSessionChange: "+0.8%"
        });

    }, [selectedRegions, dateRange]);

    return (
        <ViewerContext.Provider value={{
            dateRange,
            selectedRegions,
            setDateRange,
            setSelectedRegions,
            kpiData,
            recentActivity: [
                { user: "US", action: "User updated Q3 Report", time: "2 hours ago" },
                { user: "AK", action: "Admin approved budget", time: "4 hours ago" },
                { user: "JS", action: "New dataset uploaded", time: "5 hours ago" },
                { user: "MR", action: "Dashboard shared", time: "1 day ago" },
                { user: "PD", action: "Weekly goals updated", time: "1 day ago" },
            ]
        }}>
            {children}
        </ViewerContext.Provider>
    );
}
