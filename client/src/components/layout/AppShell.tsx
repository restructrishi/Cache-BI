import { Sidebar } from "./Sidebar"
import { Button } from "@/components/ui/button"
import { Bell, Search, UserCircle } from "lucide-react"
import { ThemeToggle } from "@/features/theme/ThemeToggle"

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-full bg-background overflow-hidden font-sans text-foreground transition-colors duration-300">
            <Sidebar />

            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                {/* Topbar */}
                <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0 transition-colors duration-300">
                    <div className="flex items-center gap-4 w-96">
                        <div className="relative w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full h-9 pl-9 pr-4 rounded-lg bg-muted/50 border-none focus:ring-1 focus:ring-primary text-sm transition-all hover:bg-muted"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <Bell className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <UserCircle className="h-6 w-6" />
                        </Button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-6 scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    )
}
