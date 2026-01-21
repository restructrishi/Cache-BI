import { useState, useEffect, useMemo } from "react";
import { useBuilder } from "../context/BuilderContext";
import {
    BarChartBig,
    LineChart,
    PieChart,
    ScatterChart,
    Table2,
    Activity,
    LayoutTemplate,
    Search,
    Star,
    Plus,
    AreaChart,
    Grid,
    MoreHorizontal,
    ChevronDown,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { WidgetType } from "../types";

type Category = "Basic" | "Comparison" | "Trends" | "Tables & KPIs" | "Advanced";

interface VisualOption {
    type: WidgetType;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    category: Category;
    description: string;
}

const allVisuals: VisualOption[] = [
    { type: 'bar', icon: BarChartBig, label: 'Bar Chart', category: 'Basic', description: 'Compare values across categories' },
    { type: 'line', icon: LineChart, label: 'Line Chart', category: 'Trends', description: 'Show trends over time' },
    { type: 'pie', icon: PieChart, label: 'Pie Chart', category: 'Basic', description: 'Show proportions of a whole' },
    { type: 'scatter', icon: ScatterChart, label: 'Scatter Plot', category: 'Advanced', description: 'Identify relationships between values' },
    { type: 'kpi', icon: Activity, label: 'KPI Card', category: 'Tables & KPIs', description: 'Display key performance indicators' },
    { type: 'table', icon: Table2, label: 'Table', category: 'Tables & KPIs', description: 'Detailed data in rows and columns' },
    { type: 'combo', icon: LayoutTemplate, label: 'Combo Chart', category: 'Comparison', description: 'Combine bar and line charts' },
    { type: 'area', icon: AreaChart, label: 'Area Chart', category: 'Trends', description: 'Visualize volume over time' },
    { type: 'heatmap', icon: Grid, label: 'Heatmap', category: 'Advanced', description: 'Visualize density or intensity' },
];

const QUICK_ADD_TYPES: WidgetType[] = ['bar', 'line', 'kpi', 'table'];

export function VisualsPanel() {
    const { addWidget } = useBuilder();
    const [searchQuery, setSearchQuery] = useState("");
    const [favorites, setFavorites] = useState<WidgetType[]>(() => {
        try {
            const saved = localStorage.getItem("dashboard_favorites");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("dashboard_favorites", JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = (type: WidgetType, e: React.MouseEvent) => {
        e.stopPropagation();
        setFavorites(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const filteredVisuals = useMemo(() => {
        return allVisuals.filter(v =>
            v.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const groupedVisuals = useMemo(() => {
        const groups: Record<string, VisualOption[]> = {};
        filteredVisuals.forEach(v => {
            if (!groups[v.category]) groups[v.category] = [];
            groups[v.category].push(v);
        });
        return groups;
    }, [filteredVisuals]);

    const renderVisualCard = (viz: VisualOption, isCompact = false) => {
        const isFav = favorites.includes(viz.type);

        return (
            <TooltipProvider key={`${viz.type}-${viz.label}-${isCompact ? 'compact' : 'full'}`}>
                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                        <div
                            className={cn(
                                "group relative flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card p-3 transition-all duration-200 hover:border-primary/50 hover:shadow-md cursor-grab active:cursor-grabbing",
                                isCompact ? "h-20 w-full" : "aspect-square w-full"
                            )}
                            onClick={() => addWidget(viz.type)}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData('widgetType', viz.type);
                            }}
                        >
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 text-muted-foreground hover:text-yellow-500 hover:bg-transparent"
                                    onClick={(e) => toggleFavorite(viz.type, e)}
                                >
                                    <Star className={cn("h-3 w-3", isFav && "fill-yellow-500 text-yellow-500")} />
                                </Button>
                            </div>

                            <div className={cn(
                                "mb-2 rounded-lg bg-primary/5 p-2 text-primary group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-200",
                                isCompact && "mb-1 p-1.5"
                            )}>
                                <viz.icon className={cn("h-6 w-6", isCompact && "h-5 w-5")} />
                            </div>
                            <span className="text-xs font-medium text-center leading-tight text-muted-foreground group-hover:text-foreground transition-colors">
                                {viz.label}
                            </span>

                            {/* Drag Indicator Overlay */}
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-active:opacity-100 rounded-xl transition-opacity pointer-events-none border-2 border-primary" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="flex flex-col gap-1">
                        <p className="font-semibold">Add {viz.label}</p>
                        <p className="text-xs text-muted-foreground">{viz.description}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    };

    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="flex flex-col w-full h-full bg-muted/10">
            {/* Main Header */}
            <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-20">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors group"
                >
                    <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-foreground flex items-center gap-2">
                        <LayoutTemplate className="h-4 w-4 text-primary" />
                        Visualizations
                    </h3>
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    )}
                </button>
            </div>

            {isExpanded && (
                <div className="flex-1 flex flex-col min-h-0 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 pt-4">
                        <div className="relative mb-2">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search charts..."
                                className="pl-9 h-9 bg-background/50 border-muted focus:bg-background transition-colors"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <ScrollArea className="flex-1 px-4 py-2">
                        {searchQuery ? (
                            <div className="space-y-6 pb-8">
                                {/* Search Results - Flat List */}
                                {Object.entries(groupedVisuals).map(([category, items]) => (
                                    <div key={category} className="space-y-3">
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">
                                            {category}
                                        </h4>
                                        <div className="grid grid-cols-3 gap-3">
                                            {items.map(viz => renderVisualCard(viz))}
                                        </div>
                                    </div>
                                ))}
                                {Object.keys(groupedVisuals).length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground text-sm">
                                        No visuals found
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Accordion type="multiple" defaultValue={['quick-add', 'Basic']} className="w-full pb-8">
                                {/* Quick Add */}
                                <AccordionItem value="quick-add" className="border-b-0">
                                    <AccordionTrigger className="py-3 hover:no-underline text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Quick Add
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-1 pb-4 overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                                        <div className="grid grid-cols-4 gap-2">
                                            {QUICK_ADD_TYPES.map(type => {
                                                const viz = allVisuals.find(v => v.type === type);
                                                return viz ? (
                                                    <TooltipProvider key={`quick-${type}`}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    className="h-10 w-full p-0 border-dashed hover:border-solid hover:border-primary hover:bg-primary/5 transition-all"
                                                                    onClick={() => addWidget(type)}
                                                                    draggable
                                                                    onDragStart={(e) => e.dataTransfer.setData('widgetType', type)}
                                                                >
                                                                    <Plus className="h-4 w-4 mr-1 text-primary" />
                                                                    <viz.icon className="h-4 w-4 text-muted-foreground" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Quick add {viz?.label}</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : null;
                                            })}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Favorites */}
                                {favorites.length > 0 && (
                                    <AccordionItem value="favorites" className="border-b-0">
                                        <AccordionTrigger className="py-3 hover:no-underline text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /> Favorites
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-1 pb-4 overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                                            <div className="grid grid-cols-3 gap-3">
                                                {favorites.map(type => {
                                                    const viz = allVisuals.find(v => v.type === type);
                                                    return viz ? renderVisualCard(viz, true) : null;
                                                })}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {/* Categories */}
                                {Object.entries(groupedVisuals).map(([category, items]) => (
                                    <AccordionItem value={category} key={category} className="border-b-0">
                                        <AccordionTrigger className="py-3 hover:no-underline text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            {category}
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-1 pb-4 overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                                            <div className="grid grid-cols-3 gap-3">
                                                {items.map(viz => renderVisualCard(viz))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
