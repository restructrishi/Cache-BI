import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Lock, Mail, ArrowRight } from "lucide-react";
// We don't have a toast component imported yet, so we'll use a simple alert or console error for now, 
// or I can assume standard toast usage if user has it. The prompt mentioned "premium error message toast".
// I will implement a basic error state UI for now to be safe.

export function ViewerLogin() {
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        // Validation Rule: Only allow emails ending with @cachedigitech.com
        if (!email.endsWith('@cachedigitech.com')) {
            setError('Access Denied. Please use your official @cachedigitech.com email.');
            setIsSubmitting(false);
            return;
        }

        try {
            await login(email, 'viewer');
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-indigo-500/10 via-background to-background opacity-40"></div>
            </div>

            <Card className="w-full max-w-md p-8 shadow-premium border-0 bg-card/50 backdrop-blur-xl relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                        <Lock className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold font-heading">Welcome Back</h1>
                    <p className="text-sm text-muted-foreground mt-2">Enter your employee credentials to access the workspace.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="email"
                                placeholder="name@cachedigitech.com"
                                className="pl-10 h-11 bg-background/50"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="password"
                                placeholder="Password"
                                className="pl-10 h-11 bg-background/50"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                        disabled={isSubmitting || isLoading}
                    >
                        {isSubmitting ? "Authenticating..." : (
                            <>
                                Sign In <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center text-xs text-muted-foreground">
                    <p>Protected Area. Authorized Personnel Only.</p>
                </div>
            </Card>
        </div>
    );
}
