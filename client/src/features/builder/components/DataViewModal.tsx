import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBuilder } from '../context/BuilderContext';
import { Download, Search, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { utils, writeFile } from 'xlsx';

export function DataViewModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const { activeDataset } = useBuilder();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 20;

    const filteredData = useMemo(() => {
        if (!activeDataset) return [];
        if (!search) return activeDataset.data;
        const lowerSearch = search.toLowerCase();
        return activeDataset.data.filter(row => 
            Object.values(row).some(val => 
                String(val).toLowerCase().includes(lowerSearch)
            )
        );
    }, [activeDataset, search]);

    const paginatedData = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, page, pageSize]);

    const totalPages = Math.ceil(filteredData.length / pageSize);

    const handleExport = () => {
        if (!activeDataset) return;
        const ws = utils.json_to_sheet(activeDataset.data);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Data");
        writeFile(wb, `${activeDataset.name || 'dataset'}.xlsx`);
    };

    if (!activeDataset) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <FileSpreadsheet className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle>Dataset View</DialogTitle>
                            <DialogDescription>
                                {activeDataset.name} • {filteredData.length} rows • {activeDataset.columns.length} columns
                            </DialogDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search data..." 
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                className="pl-8"
                            />
                        </div>
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" /> Export
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900/50 relative">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                            <TableRow>
                                <TableHead className="w-[50px] text-center">#</TableHead>
                                {activeDataset.columns.map(col => (
                                    <TableHead key={col.id} className="whitespace-nowrap min-w-[120px]">
                                        {col.name}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((row, i) => (
                                    <TableRow key={i} className="hover:bg-muted/50">
                                        <TableCell className="text-center text-muted-foreground text-xs">
                                            {(page - 1) * pageSize + i + 1}
                                        </TableCell>
                                        {activeDataset.columns.map(col => (
                                            <TableCell key={col.id} className="text-xs truncate max-w-[200px]" title={String(row[col.id] || '')}>
                                                {row[col.id] !== undefined ? String(row[col.id]) : '-'}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={activeDataset.columns.length + 1} className="h-24 text-center">
                                        No results found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="p-4 border-t bg-card flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Page {page} of {totalPages || 1}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="h-4 w-4" /> Previous
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                        >
                            Next <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
