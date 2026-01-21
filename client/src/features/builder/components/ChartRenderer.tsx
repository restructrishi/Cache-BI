import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { Widget } from '../types';
import { useBuilder } from '../context/BuilderContext';
import { useTheme } from '@/features/theme/ThemeContext';

export function ChartRenderer({ widget }: { widget: Widget }) {
    const { activeDataset, updateWidgetConfig, filters, regionColumnId } = useBuilder();
    const { theme } = useTheme();

    // Determine if widget is configured (has at least one metric/dimension)
    const isConfigured = useMemo(() => {
        const { config } = widget;
        if (widget.type === 'kpi') return !!config.yAxis?.[0];
        if (widget.type === 'pie') return !!config.yAxis?.[0];
        return !!config.yAxis?.[0] || !!config.xAxis?.[0];
    }, [widget]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const fieldName = e.dataTransfer.getData('fieldName');
        const fieldType = e.dataTransfer.getData('fieldType');
        
        if (!fieldName) return;
        
        if (fieldType === 'number') {
             updateWidgetConfig(widget.id, {
                yAxis: [{
                    id: fieldName,
                    name: fieldName,
                    type: 'number',
                    aggregation: 'sum'
                }]
             });
        } else {
             updateWidgetConfig(widget.id, {
                xAxis: [{
                    id: fieldName,
                    name: fieldName,
                    type: fieldType as any || 'string'
                }]
             });
        }
    };

    // Effective Filters (Visual > Page/Global)
    const effectiveFilters = useMemo(() => {
        const globalDate = filters.dateRange;
        const visualDate = widget.filters?.dateRange;
        
        const globalRegions = filters.selectedRegions;
        const visualRegions = widget.filters?.selectedRegions;
        
        return {
            dateRange: visualDate !== undefined ? visualDate : globalDate,
            selectedRegions: visualRegions !== undefined ? visualRegions : globalRegions
        };
    }, [filters, widget.filters]);

    // Filtered Dataset
    const filteredDataset = useMemo(() => {
        if (!activeDataset) return [];
        let rows = activeDataset.data;
        
        // 1. Apply Date Range
        if (effectiveFilters.dateRange?.from || effectiveFilters.dateRange?.to) {
             const dateCol = activeDataset.columns.find(c => c.type === 'date');
             if (dateCol) {
                 const from = effectiveFilters.dateRange.from ? new Date(effectiveFilters.dateRange.from).getTime() : -Infinity;
                 const to = effectiveFilters.dateRange.to ? new Date(effectiveFilters.dateRange.to).getTime() : Infinity;
                 
                 rows = rows.filter(r => {
                     const val = r[dateCol.id];
                     if (!val) return false;
                     const d = new Date(val).getTime();
                     return d >= from && d <= to;
                 });
             }
        }

        // 2. Apply Regions
        if (effectiveFilters.selectedRegions.length > 0) {
            let regionCol = regionColumnId
                ? activeDataset.columns.find(c => c.id === regionColumnId)
                : activeDataset.columns.find(c =>
                    ['region', 'state', 'province', 'territory', 'country', 'location', 'area']
                        .includes(c.name.toLowerCase()) ||
                    ['region', 'state', 'province', 'territory', 'country', 'location', 'area']
                        .includes(c.id.toLowerCase())
                );
            if (regionCol) {
                rows = rows.filter(r => effectiveFilters.selectedRegions.includes(r[regionCol.id]));
            }
        }
        return rows;
    }, [activeDataset, effectiveFilters]);

    // Data Generator (Real or Mock)
    const data = useMemo(() => {
        if (!isConfigured) return [];

        const xField = widget.config.xAxis?.[0];
        const yField = widget.config.yAxis?.[0];

        // 1. KPI Logic (Single Value)
        if (widget.type === 'kpi' && yField && activeDataset) {
            const total = filteredDataset.reduce((sum, row) => sum + (Number(row[yField.id]) || 0), 0);
            return [{ value: total }];
        }

        // 2. Cartesian/Pie Logic (Aggregation)
        if (xField && yField && activeDataset) {
             const map = new Map<string, number>();
             filteredDataset.forEach(row => {
                 const key = String(row[xField.id] || 'Unknown');
                 const val = Number(row[yField.id]) || 0;
                 map.set(key, (map.get(key) || 0) + val);
             });
             
             // Sort by value desc for better viz
             return Array.from(map.entries())
                .map(([category, value]) => ({ category, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 20); // Limit to top 20 for perf
        }
        
        // 3. Fallback Mock Data (if no dataset or no mapping)
        const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        return categories.map(cat => ({
            category: cat,
            value: Math.floor(Math.random() * 1000) + 200,
            value2: Math.floor(Math.random() * 800) + 100,
        }));
    }, [isConfigured, activeDataset, widget, filteredDataset]);

    const option = useMemo(() => {
        if (!isConfigured) return {};

        const isDark = theme === 'dark';
        const textColor = isDark ? '#e2e8f0' : '#1e293b';
        const gridColor = isDark ? '#334155' : '#e2e8f0';

        const baseOption = {
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis' },
            grid: { top: 40, right: 20, bottom: 40, left: 50, borderColor: gridColor, containLabel: true },
            textStyle: { fontFamily: 'Inter, sans-serif' },
            xAxis: {
                type: 'category',
                data: data.map(d => d.category),
                axisLine: { lineStyle: { color: gridColor } },
                axisLabel: { color: textColor, interval: 0, rotate: 30 } // Rotate labels
            },
            yAxis: {
                type: 'value',
                splitLine: { lineStyle: { color: gridColor, type: 'dashed' } },
                axisLabel: { color: textColor }
            }
        };

        const { type, config } = widget;
        const title = config.yAxis?.[0]?.name || 'Value';

        switch (type) {
            case 'bar':
                return {
                    ...baseOption,
                    series: [{
                        name: title,
                        type: 'bar',
                        data: data.map(d => d.value),
                        itemStyle: { borderRadius: [4, 4, 0, 0], color: '#3b82f6' },
                        animationDelay: (idx: number) => idx * 50
                    }]
                };
            case 'line':
                return {
                    ...baseOption,
                    series: [{
                        name: title,
                        type: 'line',
                        data: data.map(d => d.value),
                        smooth: true,
                        areaStyle: { opacity: 0.2, color: '#3b82f6' },
                        itemStyle: { color: '#3b82f6' }
                    }]
                };
            case 'pie':
                return {
                    ...baseOption,
                    tooltip: { trigger: 'item' },
                    xAxis: { show: false },
                    yAxis: { show: false },
                    grid: { show: false },
                    series: [{
                        type: 'pie',
                        radius: ['40%', '70%'],
                        itemStyle: { borderRadius: 5, borderColor: isDark ? '#1e293b' : '#fff', borderWidth: 2 },
                        data: data.map(d => ({ value: d.value, name: d.category }))
                    }]
                };
            case 'scatter':
                return {
                    ...baseOption,
                    series: [{
                        type: 'scatter',
                        data: data.map(d => [d.value, d.value2 || d.value * 0.5]), // Mock Y2 if missing
                        itemStyle: { color: '#3b82f6' }
                    }]
                };
            case 'kpi':
                 // Special KPI Render
                 const kpiValue = data[0]?.value || 0;
                 const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(kpiValue);
                return {
                    ...baseOption,
                    xAxis: { show: false },
                    yAxis: { show: false },
                    grid: { show: false },
                    graphic: {
                        elements: [
                            {
                                type: 'text',
                                left: 'center',
                                top: 'center',
                                style: {
                                    text: formatted,
                                    fontSize: 32,
                                    fontWeight: 'bold',
                                    fill: '#3b82f6'
                                }
                            },
                            {
                                type: 'text',
                                left: 'center',
                                top: '65%',
                                style: {
                                    text: config.yAxis?.[0]?.name || 'Total',
                                    fontSize: 14,
                                    fill: textColor
                                }
                            }
                        ]
                    }
                };
            case 'combo':
                return {
                    ...baseOption,
                    series: [
                        {
                            name: 'Bar',
                            type: 'bar',
                            data: data.map(d => d.value),
                            itemStyle: { borderRadius: [4, 4, 0, 0], color: '#3b82f6' }
                        },
                        {
                            name: 'Line',
                            type: 'line',
                            data: data.map(d => d.value2 || d.value * 0.8),
                            smooth: true,
                            itemStyle: { color: '#8b5cf6' }
                        }
                    ]
                };
            default:
                return baseOption;
        }
    }, [widget, data, isConfigured, theme]); // Added theme dependency

    if (!isConfigured) {
        return (
            <div 
                className="h-full w-full flex flex-col items-center justify-center bg-muted/20 border-2 border-dashed border-muted rounded-lg p-4 transition-colors hover:bg-muted/30 hover:border-muted-foreground/50"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <div className="p-3 bg-muted rounded-full mb-3">
                    <svg
                        className="h-6 w-6 text-muted-foreground"
                        fill="none"
                        height="24"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                </div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">No Data Selected</h3>
                <p className="text-xs text-muted-foreground/70 text-center max-w-[180px]">
                    Drop fields here to build your visual
                </p>
            </div>
        );
    }

    return (
        <div className="w-full h-full" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
            <ReactECharts
                option={option}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
            />
        </div>
    );
}
