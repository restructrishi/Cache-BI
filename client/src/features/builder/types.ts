import type ReactGridLayout from 'react-grid-layout';

export type WidgetType = 'bar' | 'line' | 'pie' | 'scatter' | 'kpi' | 'table' | 'combo' | 'area' | 'heatmap';

export interface DateRange {
    from: Date | undefined;
    to: Date | undefined;
}

export interface FilterState {
    dateRange: DateRange | undefined;
    selectedRegions: string[];
}

export interface AxisConfig {
    id: string;
    name: string;
    type: 'string' | 'number' | 'date';
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface WidgetConfig {
    title: string;
    xAxis?: AxisConfig[];
    yAxis?: AxisConfig[];
    [key: string]: any; // Allow other config properties
}

export interface Widget {
    id: string;
    type: WidgetType;
    layout: ReactGridLayout.Layout;
    config: WidgetConfig;
    filters?: FilterState;
}
