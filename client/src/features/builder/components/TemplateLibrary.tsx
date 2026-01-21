import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

const TEMPLATES = [
    { id: 'sales', name: 'Sales Overview', description: 'Track revenue, growth, and top products.' },
    { id: 'finance', name: 'Finance KPIs', description: 'Monitor P&L, expenses, and margins.' },
    { id: 'marketing', name: 'Marketing Funnel', description: 'Analyze leads, conversion, and traffic.' },
    { id: 'ops', name: 'Operations', description: 'Track inventory, logistics, and efficiency.' },
];

export function TemplateLibrary() {
    return (
        <div className="grid grid-cols-2 gap-4">
            {TEMPLATES.map((template) => (
                <Card key={template.id} className="p-4 hover:border-primary cursor-pointer transition-colors group">
                    <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{template.name}</h4>
                    <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
                    <Button variant="outline" size="sm" className="w-full text-xs h-8">
                        <Plus className="mr-2 h-3 w-3" /> Use Template
                    </Button>
                </Card>
            ))}
        </div>
    );
}
