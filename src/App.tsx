import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import Layout from '@/components/Layout'

const Index = lazy(() => import('@/pages/Index'))
const Login = lazy(() => import('@/pages/Login'))
const Signup = lazy(() => import('@/pages/Signup'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Patients = lazy(() => import('@/pages/Patients'))
const PatientProfile = lazy(() => import('@/pages/PatientProfile'))
const NewAssessment = lazy(() => import('@/pages/NewAssessment'))
const AssessmentDetail = lazy(() => import('@/pages/AssessmentDetail'))

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="theme">
      <AuthProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <SonnerToaster richColors position="top-right" />
            <Suspense
              fallback={
                <div className="flex h-screen items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mb-4"></div>
                    <p className="text-muted-foreground">Carregando...</p>
                  </div>
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/pacientes" element={<Patients />} />
                  <Route path="/paciente/:id" element={<PatientProfile />} />
                  <Route path="/avaliacao/nova" element={<NewAssessment />} />
                  <Route path="/avaliacao/:id" element={<AssessmentDetail />} />
                  <Route path="/relatorio/:id" element={<AssessmentDetail />} />
                </Route>
              </Routes>
            </Suspense>
          </TooltipProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
