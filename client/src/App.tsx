import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { AuthProvider } from "@/features/auth/AuthContext"
import { AuthGuard } from "@/features/auth/AuthGuard"
import { ViewerLogin } from "@/pages/auth/ViewerLogin"
import { AdminLogin } from "@/pages/auth/AdminLogin"
import { AppShell } from "@/components/layout/AppShell"
import { DashboardHome } from "@/pages/DashboardHome"
import { DashboardBuilderLayout } from "@/features/builder/components/DashboardBuilderLayout"
import { BuilderProvider } from "@/features/builder/context/BuilderContext"
import { DashboardListPage } from "@/features/dashboard-list/DashboardListPage"
import { ViewerProvider } from "@/features/viewer/context/ViewerContext"
import { UserControlPage } from "@/pages/admin/UserControlPage"

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Login Routes */}
          <Route path="/login" element={<ViewerLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Viewer Routes - Redirect root to home for viewers */}
          <Route element={<AuthGuard allowedRoles={['viewer', 'admin']} />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={
              <ViewerProvider>
                <AppShell><DashboardHome /></AppShell>
              </ViewerProvider>
            } />
            {/* Add other viewer pages here as needed */}
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<AuthGuard allowedRoles={['admin']} />}>
            <Route path="/admin" element={<Navigate to="/dashboards" replace />} />

            <Route path="/admin/user-control" element={
              <BuilderProvider>
                <AppShell><UserControlPage /></AppShell>
              </BuilderProvider>
            } />

            <Route element={<BuilderProvider><Outlet /></BuilderProvider>}>
              <Route path="/dashboards" element={<AppShell><DashboardListPage /></AppShell>} />
              <Route path="/dashboards/new" element={<DashboardBuilderLayout />} />
              <Route path="/dashboards/:id/edit" element={<DashboardBuilderLayout />} />
            </Route>
          </Route>

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
