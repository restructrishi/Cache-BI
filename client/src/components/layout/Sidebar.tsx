import { useState } from "react"
import { motion } from "framer-motion"
import { useLocation, Link } from "react-router-dom"
import {
    LayoutDashboard,
    Database,
    BarChart3,
    Settings,
    ChevronLeft,
    Menu,
    PieChart,
    Users
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ViewerFiltersPanel } from "@/features/viewer/components/ViewerFiltersPanel"

const navItems = [
    { icon: LayoutDashboard, label: "Home", href: "/" },
    { icon: BarChart3, label: "Dashboards", href: "/dashboards" },
    { icon: Database, label: "Datasets", href: "/datasets" },
    { icon: PieChart, label: "Visuals", href: "/visuals" },
    { icon: Settings, label: "Settings", href: "/settings" },
]

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const location = useLocation()
    const isViewerHome = location.pathname === "/home"

    return (
        <motion.div
            initial={{ width: 240 }}
            animate={{ width: collapsed ? 80 : 240 }}
            className="h-screen bg-card border-r border-border flex flex-col relative z-20 shadow-xl shadow-black/5"
        >
            <div className="h-16 flex items-center px-6 border-b border-border/50">
                <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
                    <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                        C
                    </div>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            Cache BI
                        </motion.span>
                    )}
                </div>
            </div>

            <div className="flex-1 py-6 px-0 space-y-1">
                {isViewerHome ? (
                    // Viewer Mode: Show Filters Panel
                    collapsed ? (
                        // If collapsed in viewer mode, maybe show icons or nothing? 
                        // For now let's just show a simplified indicator or force expand intent
                        <div className="flex flex-col items-center gap-4 pt-4">
                            <Button variant="ghost" size="icon" onClick={() => setCollapsed(false)}>
                                <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </div>
                    ) : (
                        <div className="h-full px-2">
                            <ViewerFiltersPanel />
                        </div>
                    )
                ) : (
                    // Admin Mode: Show Navigation
                    <div className="px-3 space-y-1">
                        {navItems.map((item) => (
                            <Button
                                key={item.label}
                                asChild
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer",
                                    collapsed ? "px-2 justify-center" : "px-4",
                                    location.pathname === item.href && "bg-secondary text-secondary-foreground"
                                )}
                            >
                                <Link to={item.href}>
                                    <item.icon className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-3")} />
                                    {!collapsed && <span>{item.label}</span>}
                                </Link>
                            </Button>
                        ))}

                        {/* User Control Link (Admin Only) */}
                        <Button
                            key="User Control"
                            asChild
                            variant="ghost"
                            className={cn(
                                "w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer",
                                collapsed ? "px-2 justify-center" : "px-4",
                                location.pathname.startsWith('/admin/user-control') && "bg-secondary text-secondary-foreground"
                            )}
                        >
                            <Link to="/admin/user-control">
                                <Users className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-3")} />
                                {!collapsed && <span>User Control</span>}
                            </Link>
                        </Button>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-border/50">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full h-10 hover:bg-muted/50"
                >
                    {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </Button>
            </div>
        </motion.div >
    )
}
