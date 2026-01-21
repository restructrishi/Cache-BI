import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDropzone } from 'react-dropzone';
import { DatasetService, type Dataset } from '@/features/builder/services/DatasetService';
import { Upload, FileSpreadsheet, Loader2, BarChart, CheckCircle2, ArrowRight, ArrowLeft, FileType, Check, FileText, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface NewProjectWizardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete: (projectData: { title: string, dataset: Dataset }) => void;
}

type WizardStep = 'details' | 'upload' | 'preview';

const steps = [
    { id: 'details', title: 'Project Details', icon: LayoutDashboard },
    { id: 'upload', title: 'Upload Data', icon: Upload },
    { id: 'preview', title: 'Review Dataset', icon: FileSpreadsheet }
];

export function NewProjectWizard({ open, onOpenChange, onComplete }: NewProjectWizardProps) {
    const [step, setStep] = useState<WizardStep>('details');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [parsedData, setParsedData] = useState<{ sheets: string[], workbook: any } | null>(null);
    const [selectedSheet, setSelectedSheet] = useState<string>('');
    const [previewDataset, setPreviewDataset] = useState<Dataset | null>(null);

    const currentStepIndex = steps.findIndex(s => s.id === step);

    const onDrop = async (acceptedFiles: File[]) => {
        const uploadedFile = acceptedFiles[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);
        setIsParsing(true);
        try {
            const result = await DatasetService.parseExcel(uploadedFile);
            setParsedData(result);
            if (result.sheets.length > 0) {
                // Auto select first sheet
                selectSheet(result.sheets[0], result.workbook);
            }
            // Wait a bit for the success animation
            setTimeout(() => {
                setStep('preview');
            }, 800);
        } catch (error) {
            console.error("Parsing failed", error);
            alert("Failed to parse Excel file");
            setFile(null);
        } finally {
            setIsParsing(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'text/csv': ['.csv']
        },
        maxFiles: 1
    });

    const selectSheet = (sheetName: string, workbook: any = parsedData?.workbook) => {
        if (!workbook) return;
        try {
            const dataset = DatasetService.extractSheetData(workbook, sheetName);
            setSelectedSheet(sheetName);
            setPreviewDataset(dataset);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreate = () => {
        if (!previewDataset) return;
        onComplete({
            title: title || "New Dashboard",
            dataset: previewDataset
        });
        onOpenChange(false);
        // Reset state
        setTimeout(() => {
            setStep('details');
            setTitle('');
            setDescription('');
            setFile(null);
            setParsedData(null);
            setPreviewDataset(null);
        }, 500);
    };

    const handleBack = () => {
        if (step === 'upload') setStep('details');
        else if (step === 'preview') setStep('upload');
        else onOpenChange(false);
    };

    const handleContinue = () => {
        if (step === 'details') {
            if (title) setStep('upload');
        }
        else if (step === 'upload') {
            // Handled by drop usually, but can skip if needed or if file already there
            if (file) setStep('preview');
        }
        else if (step === 'preview') {
            handleCreate();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-5xl p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-sm shadow-2xl border-none flex flex-col h-[90vh] sm:h-[85vh]">

                {/* Header & Stepper */}
                <div className="bg-muted/30 border-b px-8 py-6 flex-none z-10">
                    <DialogHeader className="mb-6 text-center sm:text-left">
                        <DialogTitle className="text-2xl font-bold tracking-tight">Create New Dashboard</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Set up your project and connect your data source.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Premium Stepper */}
                    <div className="relative flex justify-between items-center max-w-3xl mx-auto">
                        {/* Connecting Lines */}
                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-muted -translate-y-1/2 -z-10" />
                        <div
                            className="absolute top-1/2 left-0 h-[2px] bg-primary -translate-y-1/2 -z-10 transition-all duration-500 ease-in-out"
                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                        />

                        {steps.map((s, i) => {
                            const isCompleted = i < currentStepIndex;
                            const isActive = i === currentStepIndex;

                            return (
                                <div key={s.id} className="flex flex-col items-center gap-2 bg-background px-2">
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10",
                                            isActive ? "border-primary bg-primary text-primary-foreground shadow-lg scale-110" :
                                                isCompleted ? "border-primary bg-primary text-primary-foreground" :
                                                    "border-muted bg-background text-muted-foreground"
                                        )}
                                    >
                                        {isCompleted ? <Check className="h-5 w-5" /> : <s.icon className="h-4 w-4" />}
                                    </div>
                                    <span className={cn(
                                        "text-xs font-semibold tracking-wide uppercase transition-colors duration-300",
                                        isActive ? "text-primary" :
                                            isCompleted ? "text-foreground" :
                                                "text-muted-foreground"
                                    )}>
                                        {s.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="p-8 flex-1 overflow-y-auto min-h-0 flex flex-col">
                    <AnimatePresence mode="wait">

                        {/* Step 1: Project Details */}
                        {step === 'details' && (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex-1 flex flex-col items-center justify-start max-w-2xl mx-auto w-full space-y-8"
                            >
                                <div className="text-center space-y-2">
                                    <h2 className="text-xl font-semibold">Let's start with the basics</h2>
                                    <p className="text-muted-foreground text-sm">Give your dashboard a name and description to get started.</p>
                                </div>

                                <Card className="w-full border-muted shadow-sm flex-none">
                                    <CardContent className="p-6 space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-medium">Dashboard Name <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="name"
                                                placeholder="e.g. Q1 Sales Performance"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="h-11 bg-muted/30"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="desc" className="text-sm font-medium">Description (Optional)</Label>
                                            <Input
                                                id="desc"
                                                placeholder="Briefly describe the purpose of this dashboard"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="h-11 bg-muted/30"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="w-full space-y-3 pb-8">
                                    <Label className="text-sm font-medium text-muted-foreground">Or start with a template</Label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {['Blank Dashboard', 'Sales Overview', 'Finance Report'].map((t) => (
                                            <div key={t} className="relative group cursor-pointer">
                                                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 rounded-lg transition-colors border border-transparent group-hover:border-primary/20" />
                                                <div className="bg-card border rounded-lg p-4 flex flex-col items-center gap-3 transition-all group-hover:shadow-md">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                        <BarChart className="h-5 w-5" />
                                                    </div>
                                                    <span className="text-xs font-medium text-center">{t}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Upload Data */}
                        {step === 'upload' && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full my-auto"
                            >
                                <div className="text-center mb-8">
                                    <h2 className="text-xl font-semibold">Upload your Dataset</h2>
                                    <p className="text-muted-foreground text-sm mt-1">Supported formats: .xlsx, .xls, .csv</p>
                                </div>

                                <div
                                    {...getRootProps()}
                                    className={cn(
                                        "w-full aspect-[2/1] max-h-[300px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300",
                                        isDragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30",
                                        file && "border-green-500/50 bg-green-50/50 dark:bg-green-900/10"
                                    )}
                                >
                                    <input {...getInputProps()} />

                                    <div className="h-20 w-20 bg-background rounded-full shadow-sm flex items-center justify-center mb-6">
                                        {isParsing ? (
                                            <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                        ) : file ? (
                                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                                        ) : (
                                            <Upload className="h-8 w-8 text-primary" />
                                        )}
                                    </div>

                                    {isParsing ? (
                                        <div className="text-center space-y-2">
                                            <h3 className="text-lg font-semibold">Processing File...</h3>
                                            <p className="text-sm text-muted-foreground">Extracting data and analyzing structure</p>
                                        </div>
                                    ) : file ? (
                                        <div className="text-center space-y-2">
                                            <h3 className="text-lg font-semibold text-green-600">Upload Successful!</h3>
                                            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground bg-background/50 py-1 px-3 rounded-full">
                                                <FileText className="h-3 w-3" />
                                                {file.name}
                                                <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                                                {(file.size / 1024).toFixed(1)} KB
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-3">
                                            <h3 className="text-lg font-semibold">Drag & drop your file here</h3>
                                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                                or click to browse from your computer
                                            </p>
                                            <Button variant="outline" size="sm" className="mt-2">
                                                Browse Files
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Review */}
                        {step === 'preview' && (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex-1 flex flex-col h-full space-y-6"
                            >
                                {/* File & Sheet Info */}
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <h2 className="text-lg font-semibold flex items-center gap-2">
                                            <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                            {file?.name}
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Review your data and select the sheet to analyze.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setStep('upload')} className="h-8 text-xs">
                                            Replace File
                                        </Button>
                                    </div>
                                </div>

                                {/* Sheet Selector Tabs */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Sheet</Label>
                                    <div className="flex gap-2 flex-wrap">
                                        {parsedData?.sheets.map(sheet => (
                                            <Button
                                                key={sheet}
                                                variant={selectedSheet === sheet ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => selectSheet(sheet)}
                                                className={cn(
                                                    "h-8 rounded-full px-4 transition-all",
                                                    selectedSheet === sheet ? "shadow-md" : "hover:border-primary/50"
                                                )}
                                            >
                                                {sheet}
                                                {selectedSheet === sheet && <Check className="ml-2 h-3 w-3" />}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Data Preview Table */}
                                <Card className="flex-1 border-muted overflow-hidden flex flex-col shadow-sm min-h-[300px]">
                                    <div className="p-3 border-b bg-muted/20 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-background">
                                                {previewDataset?.columns.length || 0} Columns
                                            </Badge>
                                            <Badge variant="outline" className="bg-background">
                                                {previewDataset?.data.length || 0} Rows
                                            </Badge>
                                        </div>
                                        <span className="text-xs text-muted-foreground italic">
                                            Showing first 10 rows
                                        </span>
                                    </div>

                                    <div className="flex-1 relative overflow-auto bg-card">
                                        {previewDataset ? (
                                            <Table>
                                                <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                                                    <TableRow className="hover:bg-transparent">
                                                        {previewDataset.columns.map(col => (
                                                            <TableHead key={col.id} className="whitespace-nowrap h-9 py-2">
                                                                <div className="flex items-center gap-1.5">
                                                                    <FileType className="h-3 w-3 text-muted-foreground/70" />
                                                                    <span className="font-semibold text-foreground">{col.name}</span>
                                                                    <Badge variant="secondary" className="ml-1 text-[9px] h-4 px-1 rounded-sm opacity-70">
                                                                        {col.type}
                                                                    </Badge>
                                                                </div>
                                                            </TableHead>
                                                        ))}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {previewDataset.data.slice(0, 15).map((row, i) => (
                                                        <TableRow key={i} className="even:bg-muted/30 hover:bg-muted/50 border-b border-muted/50">
                                                            {previewDataset.columns.map(col => (
                                                                <TableCell key={col.id} className="whitespace-nowrap font-mono text-xs py-2 text-muted-foreground">
                                                                    {String(row[col.id] ?? '')}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                                                <Loader2 className="h-8 w-8 animate-spin opacity-20" />
                                                <p>Loading dataset preview...</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <DialogFooter className="flex-none p-6 border-t bg-muted/10 flex justify-between items-center sm:justify-between z-10">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        {step === 'details' ? 'Cancel' : <><ArrowLeft className="mr-2 h-4 w-4" /> Back</>}
                    </Button>

                    <Button
                        onClick={handleContinue}
                        disabled={step === 'details' && !title || step === 'upload' && !file}
                        className="min-w-[120px] shadow-lg shadow-primary/20"
                    >
                        {step === 'preview' ? (
                            <>Create Dashboard <ArrowRight className="ml-2 h-4 w-4" /></>
                        ) : (
                            <>{step === 'upload' && !file ? 'Skip Import' : 'Continue'} <ArrowRight className="ml-2 h-4 w-4" /></>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
