export type WidgetType = 'bar' | 'line' | 'pie' | 'scatter' | 'kpi' | 'table' | 'combo' | 'area' | 'heatmap';

export interface WidgetLayout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface AxisField {
    id: string;
    name: string;
    type: 'string' | 'number' | 'date';
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface DateRange {
    from: Date | undefined;
    to: Date | undefined;
}

export interface FilterState {
    dateRange: DateRange | undefined;
    selectedRegions: string[];
}

export interface WidgetConfig {
    title: string;
    xAxis?: AxisField[];
    yAxis?: AxisField[];
    legend?: AxisField[];
    tooltip?: AxisField[];
}

export interface Widget {
    id: string;
    type: WidgetType;
    layout: WidgetLayout;
    config: WidgetConfig;
    filters?: FilterState;
}

export interface DashboardData {
    id: string;
    name: string;
    widgets: Widget[];
}
