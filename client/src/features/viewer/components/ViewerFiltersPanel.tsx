import { useState, useMemo } from 'react';
import { Calendar, MapPin, Search, Check, RotateCcw, Filter, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { useViewer } from "../context/ViewerContext";
import { subDays, format } from "date-fns";

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Jammu & Kashmir"
];

export function ViewerFiltersPanel() {
    const {
        dateRange,
        setDateRange,
        selectedRegions,
        setSelectedRegions
    } = useViewer();

    const [regionSearch, setRegionSearch] = useState("");

    // --- Date Logic ---
    const presets = [
        { label: "Today", days: 0 },
        { label: "Last 7 Days", days: 7 },
        { label: "Last 30 Days", days: 30 },
    ];

    const applyPreset = (days: number) => {
        const to = new Date();
        const from = days === 0 ? new Date() : subDays(new Date(), days);
        setDateRange({ from, to });
    };

    const handleDateInput = (type: 'from' | 'to', value: string) => {
        if (!value) return;
        const date = new Date(value);
        const current = dateRange || { from: undefined, to: undefined };

        if (type === 'from') {
            // If to is undefined, set it to today default
            setDateRange({ from: date, to: current.to || new Date() });
        } else {
            setDateRange({ from: current.from, to: date });
        }
    };

    const formatDateForInput = (date: Date | undefined) => {
        return date ? format(date, "yyyy-MM-dd") : "";
    };

    // --- Region Logic ---
    const filteredStates = useMemo(() => {
        return INDIAN_STATES.filter(state =>
            state.toLowerCase().includes(regionSearch.toLowerCase())
        );
    }, [regionSearch]);

    const toggleRegion = (state: string) => {
        if (selectedRegions.includes(state)) {
            setSelectedRegions(selectedRegions.filter(r => r !== state));
        } else {
            setSelectedRegions([...selectedRegions, state]);
        }
    };

    return (
        <div className="h-full flex flex-col bg-card/30">
            <div className="p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm">
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary" />
                    Filters
                </h2>
            </div>

            <ScrollArea className="flex-1 px-3 py-4">
                <div className="space-y-4">

                    {/* Date Range Filter */}
                    <div className="space-y-3 p-3 rounded-lg border bg-card/50 hover:shadow-sm transition-all duration-300 group">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-indigo-500" /> Date Range
                            </label>
                            {dateRange && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => setDateRange(undefined)}
                                >
                                    <RotateCcw className="h-3 w-3" />
                                </Button>
                            )}
                        </div>

                        {/* Presets Popover */}
                        <Popover.Root>
                            <Popover.Trigger asChild>
                                <Button variant="outline" size="sm" className="w-full text-xs justify-between font-normal h-8">
                                    {dateRange?.from ? (
                                        <span>{format(dateRange.from, "MMM d")} - {dateRange.to ? format(dateRange.to, "MMM d") : "..."}</span>
                                    ) : (
                                        <span className="text-muted-foreground">Select date range...</span>
                                    )}
                                    <ChevronRight className="h-3 w-3 opacity-50" />
                                </Button>
                            </Popover.Trigger>
                            <Popover.Content className="w-[280px] p-3 mx-2 bg-popover border border-border rounded-lg shadow-xl z-50">
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <h4 className="font-medium leading-none text-xs text-muted-foreground mb-2">Presets</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {presets.map(preset => (
                                                <Button
                                                    key={preset.label}
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-[10px] px-1"
                                                    onClick={() => applyPreset(preset.days)}
                                                >
                                                    {preset.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2 pt-2 border-t">
                                        <h4 className="font-medium leading-none text-xs text-muted-foreground">Custom Range</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-muted-foreground">From</span>
                                                <input
                                                    type="date"
                                                    className="w-full h-8 px-2 text-xs border rounded bg-background"
                                                    value={formatDateForInput(dateRange?.from)}
                                                    onChange={(e) => handleDateInput('from', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-muted-foreground">To</span>
                                                <input
                                                    type="date"
                                                    className="w-full h-8 px-2 text-xs border rounded bg-background"
                                                    value={formatDateForInput(dateRange?.to)}
                                                    onChange={(e) => handleDateInput('to', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Popover.Content>
                        </Popover.Root>
                    </div>

                    {/* Region Filter */}
                    <div className="space-y-3 p-3 rounded-lg border bg-card/50 hover:shadow-sm transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-emerald-500" /> Region / State
                            </label>
                            {selectedRegions.length > 0 && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 h-5">
                                    {selectedRegions.length}
                                </Badge>
                            )}
                        </div>

                        <div className="relative">
                            <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search states..."
                                className="h-8 pl-8 text-xs bg-background/50"
                                value={regionSearch}
                                onChange={(e) => setRegionSearch(e.target.value)}
                            />
                        </div>

                        <ScrollArea className="h-[200px] pr-2">
                            <div className="space-y-1">
                                {filteredStates.map(state => {
                                    const isSelected = selectedRegions.includes(state);
                                    return (
                                        <div
                                            key={state}
                                            onClick={() => toggleRegion(state)}
                                            className={cn(
                                                "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-xs transition-colors",
                                                isSelected ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-3.5 w-3.5 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                                                isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                                            )}>
                                                {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                                            </div>
                                            <span className="truncate">{state}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </ScrollArea>

                        <div className="flex items-center gap-2 pt-1 border-t">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[10px] w-1/2"
                                onClick={() => setSelectedRegions(INDIAN_STATES)}
                            >
                                Select All
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[10px] w-1/2 text-muted-foreground hover:text-destructive"
                                onClick={() => setSelectedRegions([])}
                            >
                                Clear
                            </Button>
                        </div>
                    </div>

                </div>
            </ScrollArea>
        </div>
    );
}
