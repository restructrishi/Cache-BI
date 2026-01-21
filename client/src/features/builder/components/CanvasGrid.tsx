import { useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useBuilder } from '../context/BuilderContext';
import { ChartRenderer } from './ChartRenderer';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export function CanvasGrid() {
    const { widgets, updateWidgetLayout, selectWidget, selectedWidgetId, removeWidget, addWidget } = useBuilder();

    // Transform widgets to react-grid-layout format
    const layout = useMemo(() => widgets.map(w => w.layout), [widgets]);

    const handleLayoutChange = (currentLayout: any) => {
        updateWidgetLayout(currentLayout);
    };

    return (
        <div className="h-full w-full bg-muted/30 relative overflow-auto p-4 custom-scrollbar">
            {/* Grid Background */}
            <div className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    opacity: 0.5
                }}
            />

            <ResponsiveGridLayout
                className="layout min-h-[800px]"
                layouts={{ lg: layout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={60}
                onLayoutChange={(l: any) => handleLayoutChange(l)}
                draggableHandle=".drag-handle"
                isDroppable={true}
                onDrop={(_layout: any, _layoutItem: any, _event: any) => {
                    const type = (_event as DragEvent).dataTransfer?.getData('widgetType') as any;
                    if (type) {
                        // Pass the grid coordinates from the drop event
                        addWidget(type, { x: _layoutItem.x, y: _layoutItem.y });
                    }
                }}
            >
                {widgets.map((widget) => (
                    <div key={widget.id} onClick={(e) => { e.stopPropagation(); selectWidget(widget.id); }} className="group">
                        <Card
                            className={cn(
                                "w-full h-full overflow-hidden flex flex-col transition-all duration-200 border-2",
                                selectedWidgetId === widget.id
                                    ? "border-primary shadow-xl ring-4 ring-primary/10"
                                    : "border-transparent hover:border-border hover:shadow-md"
                            )}
                        >
                            <div className="drag-handle h-9 px-3 flex items-center justify-between border-b cursor-move bg-card/50 backdrop-blur-sm group-hover:bg-muted/50 transition-colors">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground truncate flex items-center gap-2">
                                    {widget.config.title}
                                </span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeWidget(widget.id);
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 min-h-0 relative p-2">
                                <ChartRenderer widget={widget} />
                            </div>
                        </Card>
                    </div>
                ))}
            </ResponsiveGridLayout>
        </div>
    );
}
