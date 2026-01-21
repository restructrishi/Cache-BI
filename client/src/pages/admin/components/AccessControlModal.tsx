import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, ShieldAlert, CheckCircle2 } from "lucide-react";
import { RBACService, type AccessRule } from '@/features/admin/services/RBACService';
import type { Dashboard } from '@/features/builder/services/DashboardStorageService';

interface AccessControlModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dashboard: Dashboard | null;
}

export function AccessControlModal({ open, onOpenChange, dashboard }: AccessControlModalProps) {
    const [users, setUsers] = useState<AccessRule[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (dashboard && open) {
            loadUsers();
        }
    }, [dashboard, open]);

    const loadUsers = () => {
        if (!dashboard) return;
        const accessList = RBACService.getDashboardAccess(dashboard.id);
        setUsers(accessList);
    };

    const handleAddUser = () => {
        setError('');

        if (!newEmail) {
            setError('Email is required');
            return;
        }

        if (!newEmail.endsWith('@cachedigitech.com')) {
            setError('Email must belong to @cachedigitech.com');
            return;
        }

        if (users.some(u => u.email === newEmail)) {
            setError('User already has access');
            return;
        }

        if (!dashboard) return;

        RBACService.grantAccess(dashboard.id, newEmail, 'view');
        setNewEmail('');
        loadUsers();
    };

    const handleRemoveUser = (email: string) => {
        if (!dashboard) return;
        RBACService.revokeAccess(dashboard.id, email);
        loadUsers();
    };

    if (!dashboard) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Manage Access</DialogTitle>
                    <DialogDescription>
                        Control who can view <strong>{dashboard.title}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Add User Section */}
                    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                        <Label className="text-sm font-medium">Add Viewer Access</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="user@cachedigitech.com"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
                            />
                            <Button onClick={handleAddUser} size="sm" className="shrink-0">
                                <UserPlus className="h-4 w-4 mr-2" /> Add
                            </Button>
                        </div>
                        {error && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <ShieldAlert className="h-3 w-3" /> {error}
                            </p>
                        )}
                    </div>

                    {/* Users List */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-xs">Current Viewers ({users.length})</Label>
                        <div className="border rounded-md overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableHead className="h-9">User Email</TableHead>
                                        <TableHead className="h-9 w-[100px]">Role</TableHead>
                                        <TableHead className="h-9 w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center text-muted-foreground text-sm">
                                                No users assigned yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map((user) => (
                                            <TableRow key={user.email} className="group">
                                                <TableCell className="font-medium text-sm">
                                                    {user.email}
                                                    <div className="text-[10px] text-muted-foreground">
                                                        Added {new Date(user.grantedAt).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="text-[10px] font-normal">
                                                        <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                                                        Viewer
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all"
                                                        onClick={() => handleRemoveUser(user.email)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
