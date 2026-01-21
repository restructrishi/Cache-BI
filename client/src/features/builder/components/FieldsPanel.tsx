import { Search, GripVertical } from "lucide-react";
import { useBuilder } from "../context/BuilderContext";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";


// Dataset from context now


export function FieldsPanel() {
    const { activeDataset } = useBuilder(); // Use dataset from context

    if (!activeDataset) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-muted-foreground p-4 text-center">
                <p className="text-sm">No dataset selected.</p>
                <p className="text-xs opacity-70">Import an Excel file to see fields.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full space-y-4">
            <h3 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                {activeDataset.name} Fields
            </h3>

            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search fields..." className="pl-8 bg-muted/50 border-none" />
            </div>

            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="space-y-1">
                        {activeDataset.columns.map((field) => (
                            <div
                                key={field.id}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('fieldId', field.id);
                                    e.dataTransfer.setData('fieldName', field.name);
                                    e.dataTransfer.setData('fieldType', field.type);
                                }}
                                className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-md cursor-grab active:cursor-grabbing group transition-all"
                            >
                                <GripVertical className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground" />
                                <span className="text-sm font-medium">{field.name}</span>
                                <span className="ml-auto text-xs text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">{field.type}</span>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
