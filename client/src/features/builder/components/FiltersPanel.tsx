import { useState, useMemo } from 'react';
import { Search, Filter, Calendar, MapPin, Check, Layout, RotateCcw, ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import * as Popover from "@radix-ui/react-popover";
import { useBuilder } from '../context/BuilderContext';
import { cn } from "@/lib/utils";
import type { FilterState, DateRange } from '../types';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Jammu & Kashmir"
];

export function FiltersPanel() {
    const {
        filters,
        setFilters,
        activeDataset,
        regionColumnId,
        setRegionColumnId
    } = useBuilder();

    const [searchQuery, setSearchQuery] = useState("");
    const [mapColumnOpen, setMapColumnOpen] = useState(false);


    // 1. Region Logic
    const regionColumn = useMemo(() => {
        if (!activeDataset) return null;
        if (regionColumnId) {
            return activeDataset.columns.find(c => c.id === regionColumnId);
        }
        return activeDataset.columns.find(c =>
            ['region', 'state', 'province', 'territory', 'country'].includes(c.name.toLowerCase()) ||
            ['region', 'state', 'province', 'territory', 'country'].includes(c.id.toLowerCase())
        );
    }, [activeDataset, regionColumnId]);

    const allRegions = useMemo(() => {
        return INDIAN_STATES;
    }, []);

    const filteredRegions = useMemo(() => {
        return allRegions.filter(r => r.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [allRegions, searchQuery]);

    // 2. Date Logic
    const dateColumn = useMemo(() => activeDataset?.columns.find(c => c.type === 'date'), [activeDataset]);

    const formatDateInput = (date: Date | undefined) => {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    };

    // Helper to render a group of filters (Date, Region)
    const renderFilterGroup = (
        currentFilters: Partial<FilterState> | undefined,
        onUpdate: (f: Partial<FilterState>) => void,
        context: 'page' | 'visual'
    ) => {
        const activeRegions = currentFilters?.selectedRegions || [];
        const activeDateRange = currentFilters?.dateRange;

        const updateRegions = (newRegions: string[]) => {
            onUpdate({
                ...(currentFilters || { selectedRegions: [], dateRange: undefined }),
                selectedRegions: newRegions
            });
        };

        const updateDateRange = (newRange: DateRange | undefined) => {
            onUpdate({
                ...(currentFilters || { selectedRegions: [], dateRange: undefined }),
                dateRange: newRange
            });
        };

        const toggleRegion = (region: string) => {
            const next = activeRegions.includes(region)
                ? activeRegions.filter(r => r !== region)
                : [...activeRegions, region];
            updateRegions(next);
        };

        const handleDateChange = (field: 'from' | 'to', value: string) => {
            const currentRange = activeDateRange || { from: undefined, to: undefined };
            const newDate = value ? new Date(value) : undefined;
            updateDateRange({
                ...currentRange,
                [field]: newDate
            });
        };

        const setDatePreset = (days?: number) => {
            const to = new Date();
            const from = new Date();
            if (days === 0) {
                updateDateRange({ from, to });
            } else if (days) {
                from.setDate(from.getDate() - days);
                updateDateRange({ from, to });
            } else {
                onUpdate({ ...(currentFilters || { selectedRegions: [], dateRange: undefined }), dateRange: undefined });
            }
        };

        return (
            <Accordion type="single" collapsible className="space-y-3">
                {/* Date Range Card */}
                <AccordionItem value="date" className={cn(
                    "border rounded-lg bg-card shadow-sm overflow-hidden",
                    context === 'visual' ? "border-blue-200 dark:border-blue-800" : ""
                )}>
                    <div className="flex items-center justify-between pr-3 bg-muted/30">
                        <AccordionTrigger className="px-3 py-2 hover:no-underline flex-1">
                            <div className="flex items-center gap-2 font-medium text-sm">
                                <Calendar className="h-4 w-4 text-indigo-500" />
                                <span>Date Range</span>
                                {dateColumn && <Badge variant="secondary" className="text-[10px] h-5 ml-2">{dateColumn.name}</Badge>}
                                {activeDateRange && (
                                    <span className="ml-2 text-[10px] text-muted-foreground">
                                        {formatDateInput(activeDateRange.from)}{activeDateRange.from ? ' → ' : ''}{formatDateInput(activeDateRange.to)}
                                    </span>
                                )}
                            </div>
                        </AccordionTrigger>
                        {activeDateRange && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDatePreset();
                                }}
                            >
                                <RotateCcw className="h-3 w-3 text-muted-foreground" />
                            </Button>
                        )}
                    </div>
                    <AccordionContent className="px-3 pb-3 pt-1">
                        {!dateColumn ? (
                            <div className="text-xs text-muted-foreground italic">
                                No date column detected in dataset.
                            </div>
                        ) : (
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-2">
                                    <Popover.Root>
                                        <Popover.Trigger asChild>
                                            <Button variant="outline" size="sm" className="h-7 text-[11px]">Quick Presets</Button>
                                        </Popover.Trigger>
                                        <Popover.Content className="rounded-md border bg-popover p-2 shadow-lg" sideOffset={8}>
                                            <div className="flex flex-col gap-1">
                                                <Button variant="ghost" size="sm" className="h-7 text-[11px] justify-start" onClick={() => setDatePreset(0)}>Today</Button>
                                                <Button variant="ghost" size="sm" className="h-7 text-[11px] justify-start" onClick={() => setDatePreset(7)}>Last 7 Days</Button>
                                                <Button variant="ghost" size="sm" className="h-7 text-[11px] justify-start" onClick={() => setDatePreset(30)}>Last 30 Days</Button>
                                            </div>
                                        </Popover.Content>
                                    </Popover.Root>
                                    <div className="grid grid-cols-2 gap-2 flex-1">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-muted-foreground">From</label>
                                            <input
                                                type="date"
                                                className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                                                value={formatDateInput(activeDateRange?.from)}
                                                onChange={(e) => handleDateChange('from', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-muted-foreground">To</label>
                                            <input
                                                type="date"
                                                className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                                                value={formatDateInput(activeDateRange?.to)}
                                                onChange={(e) => handleDateChange('to', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="default" size="sm" className="h-7 text-[11px]" onClick={() => updateDateRange(activeDateRange ? { from: activeDateRange.from, to: activeDateRange.to || new Date() } : undefined)}>Apply</Button>
                                    <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setDatePreset()}>Clear</Button>
                                </div>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>

                {/* Region Filter Card */}
                <AccordionItem value="region" className={cn(
                    "border rounded-lg bg-card shadow-sm overflow-hidden",
                    context === 'visual' ? "border-blue-200 dark:border-blue-800" : ""
                )}>
                    <div className="flex items-center justify-between pr-3 bg-muted/30">
                        <AccordionTrigger className="px-3 py-2 hover:no-underline flex-1">
                            <div className="flex items-center gap-2 font-medium text-sm">
                                <MapPin className="h-4 w-4 text-emerald-500" />
                                <span>Region / State</span>
                                {activeRegions.length > 0 && (
                                    <Badge className="text-[10px] h-5 ml-2">{activeRegions.length}</Badge>
                                )}
                            </div>
                        </AccordionTrigger>
                        {activeRegions.length > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateRegions([]);
                                }}
                            >
                                <RotateCcw className="h-3 w-3 text-muted-foreground" />
                            </Button>
                        )}
                    </div>
                    <AccordionContent className="px-3 pb-3 pt-1">
                        {!regionColumn ? (
                            <div className="text-xs text-muted-foreground italic pt-2">
                                No region/state column detected.
                                <Dialog open={mapColumnOpen} onOpenChange={setMapColumnOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="link" className="h-auto p-0 text-[10px] mt-1 block text-primary">
                                            Map a column manually
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Map Region Column</DialogTitle>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Select the column from your dataset that contains Region or State names.
                                            </p>
                                            <ScrollArea className="h-[300px] border rounded-md p-2">
                                                {activeDataset?.columns.map(col => (
                                                    <Button
                                                        key={col.id}
                                                        variant="ghost"
                                                        className="w-full justify-start text-sm h-8"
                                                        onClick={() => {
                                                            setRegionColumnId(col.id);
                                                            setMapColumnOpen(false);
                                                        }}
                                                    >
                                                        {col.name} <span className="ml-2 text-xs text-muted-foreground">({col.type})</span>
                                                    </Button>
                                                ))}
                                            </ScrollArea>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        ) : (
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center justify-between px-1">
                                    <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1 text-primary" onClick={() => updateRegions(allRegions)}>
                                        Select All
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1 text-muted-foreground" onClick={() => updateRegions([])}>
                                        Clear
                                    </Button>
                                </div>
                                <div className="max-h-[200px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                    {filteredRegions.length > 0 ? filteredRegions.map(region => {
                                        const isSelected = activeRegions.includes(region);
                                        return (
                                            <div
                                                key={region}
                                                onClick={() => toggleRegion(region)}
                                                className={cn(
                                                    "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-xs transition-colors",
                                                    isSelected ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-3.5 w-3.5 rounded border flex items-center justify-center transition-colors",
                                                    isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                                                )}>
                                                    {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                                                </div>
                                                <span className="truncate">{region}</span>
                                            </div>
                                        );
                                    }) : (
                                        <div className="text-center py-4 text-xs text-muted-foreground">
                                            No regions found matching "{searchQuery}"
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant="link"
                                    className="h-auto p-0 text-[10px] text-muted-foreground w-full text-center"
                                    onClick={() => setRegionColumnId(null)}
                                >
                                    Change mapped column
                                </Button>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        );
    };

    const [isMainExpanded, setIsMainExpanded] = useState(true);
    const [isPageFiltersExpanded, setIsPageFiltersExpanded] = useState(true);

    return (
        <div className="flex flex-col w-full h-full bg-muted/10">
            {/* Main Header */}
            <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <button
                    onClick={() => setIsMainExpanded(!isMainExpanded)}
                    className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors group"
                >
                    <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground flex items-center gap-2">
                        <Filter className="h-4 w-4 text-primary" /> Filters
                    </h3>
                    {isMainExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    )}
                </button>
            </div>

            {isMainExpanded && (
                <div className="flex-1 flex flex-col min-h-0 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search values..."
                                className="pl-9 h-9 bg-background/50 border-muted focus:bg-background transition-colors"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <ScrollArea className="flex-1 px-4 py-2">
                        <div className="space-y-4 pb-8">
                            {/* Filters on this page Section */}
                            <div className="border-0">
                                <button
                                    onClick={() => setIsPageFiltersExpanded(!isPageFiltersExpanded)}
                                    className="w-full flex items-center justify-between py-2 hover:bg-accent/30 rounded-md px-1 group transition-colors"
                                >
                                    <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
                                        <Layout className="h-3.5 w-3.5 text-muted-foreground" />
                                        Filters on this page
                                    </div>
                                    {isPageFiltersExpanded ? (
                                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                    ) : (
                                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                    )}
                                </button>
                                
                                {isPageFiltersExpanded && (
                                    <div className="pt-2 animate-in slide-in-from-top-1 duration-200">
                                        {renderFilterGroup(filters, setFilters, 'page')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
