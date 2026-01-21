import { useBuilder } from '../context/BuilderContext';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, BarChart3, ArrowUp, ArrowDown } from "lucide-react";

export function PropertiesPanel() {
    const { widgets, selectedWidgetId, updateWidgetConfig } = useBuilder();

    const selectedWidget = widgets.find(w => w.id === selectedWidgetId);

    if (!selectedWidget) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
                <BarChart3 className="h-10 w-10 mb-2 opacity-20" />
                <p>Select a widget to edit properties</p>
            </div>
        );
    }

    const { config } = selectedWidget;

    return (
        <div className="space-y-6">
            <h3 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider">Properties</h3>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs">Title</Label>
                    <Input
                        value={config.title}
                        onChange={(e) => updateWidgetConfig(selectedWidget.id, { title: e.target.value })}
                        className="bg-muted/50"
                    />
                </div>

                {/* Dimension / X-Axis Drop Zone */}
                <div className="space-y-2">
                    <label className="text-xs font-medium uppercase text-muted-foreground">Dimension (X-Axis)</label>
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            const fieldName = e.dataTransfer.getData('fieldName');
                            const fieldType = e.dataTransfer.getData('fieldType') as "string" | "number" | "date";
                            if (fieldName) {
                                // Correctly mapping to AxisField[] type
                                updateWidgetConfig(selectedWidget.id, {
                                    xAxis: [{
                                        id: fieldName,
                                        name: fieldName,
                                        type: fieldType || 'string'
                                    }]
                                });
                            }
                        }}
                        className="min-h-[40px] rounded-md border border-dashed border-border flex items-center justify-center p-2 bg-muted/20 text-xs text-muted-foreground hover:bg-muted/40 transition-colors"
                    >
                        {config.xAxis && config.xAxis.length > 0 ? (
                            <div className="flex items-center gap-2 w-full">
                                <span className="bg-primary/10 text-primary px-2 py-1 rounded w-full truncate text-center">
                                    {config.xAxis[0].name}
                                </span>
                                <Button size="icon" variant="ghost" className="h-4 w-4" onClick={() => updateWidgetConfig(selectedWidget.id, { xAxis: [] })}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ) : "Drag Dimension here"}
                    </div>
                </div>

                {/* Measure / Y-Axis Drop Zone */}
                <div className="space-y-2">
                    <label className="text-xs font-medium uppercase text-muted-foreground">Measures (Y-Axis)</label>
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            const fieldName = e.dataTransfer.getData('fieldName');
                            const fieldType = e.dataTransfer.getData('fieldType') as "string" | "number" | "date";
                            if (fieldName) {
                                updateWidgetConfig(selectedWidget.id, {
                                    yAxis: [{
                                        id: fieldName,
                                        name: fieldName,
                                        type: fieldType || 'number',
                                        aggregation: 'sum'
                                    }]
                                });
                            }
                        }}
                        className="min-h-[40px] rounded-md border border-dashed border-border flex items-center justify-center p-2 bg-muted/20 text-xs text-muted-foreground hover:bg-muted/40 transition-colors"
                    >
                        {config.yAxis && config.yAxis.length > 0 ? (
                            <div className="flex flex-col gap-2 w-full">
                                {config.yAxis.map((measure, idx) => (
                                    <div key={idx} className="flex items-center gap-2 w-full">
                                        <span className="bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded w-full truncate text-center">
                                            {measure.name} ({measure.aggregation})
                                        </span>
                                        <Button size="icon" variant="ghost" className="h-4 w-4" onClick={() => updateWidgetConfig(selectedWidget.id, { yAxis: [] })}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : "Drag Measures here"}
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-border/50 space-y-2">
                <Button variant="outline" className="w-full justify-start text-xs">
                    <Copy className="mr-2 h-3 w-3" /> Duplicate Visual
                </Button>
                <Button variant="outline" className="w-full justify-start text-xs">
                    <ArrowUp className="mr-2 h-3 w-3" /> Bring to Front
                </Button>
                <Button variant="outline" className="w-full justify-start text-xs">
                    <ArrowDown className="mr-2 h-3 w-3" /> Send to Back
                </Button>
            </div>
        </div>
    );
}
