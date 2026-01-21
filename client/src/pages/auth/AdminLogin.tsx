import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ShieldCheck, User, ArrowRight } from "lucide-react";

export function AdminLogin() {
    const { login, isLoading } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        // Hardcoded admin credentials as requested
        if (username === 'admin' && password === 'admin') {
            try {
                // Admin email mock
                await login('admin@local', 'admin');
            } catch (err) {
                setError('Login failed.');
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setError('Invalid master credentials.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            {/* Admin specific darker theme/background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent"></div>
                <div className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent"></div>
            </div>

            <Card className="w-full max-w-md p-8 shadow-2xl border-primary/20 bg-slate-900/90 backdrop-blur-xl relative z-10 ring-1 ring-white/10">
                <div className="text-center mb-8">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-4 shadow-lg shadow-primary/30">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold font-heading text-white">Builder Access</h1>
                    <p className="text-sm text-slate-400 mt-2">Enter master credentials to access the design studio.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Username"
                                className="pl-10 h-11 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 focus:border-primary/50"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                type="password"
                                placeholder="Master Key"
                                className="pl-10 h-11 bg-slate-950/50 border-white/10 text-white placeholder:text-slate-500 focus:border-primary/50"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="default" // Using default but customized by class
                        className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground"
                        disabled={isSubmitting || isLoading}
                    >
                        {isSubmitting ? "Verifying..." : (
                            <>
                                Enter Studio <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
