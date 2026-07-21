import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import { NavigationProgress } from '@/components/NavigationProgress'
import Layout from '@/components/Layout'

const Index = lazy(() => import(/* webpackChunkName: "index-chunk" */ '@/pages/Index'))
const Login = lazy(() => import(/* webpackChunkName: "login-chunk" */ '@/pages/Login'))
const Signup = lazy(() => import(/* webpackChunkName: "signup-chunk" */ '@/pages/Signup'))
const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard-chunk" */ '@/pages/Dashboard'))
const Patients = lazy(() => import(/* webpackChunkName: "pacientes-chunk" */ '@/pages/Patients'))
const PatientProfile = lazy(
  () => import(/* webpackChunkName: "paciente-chunk" */ '@/pages/PatientProfile'),
)
const NewAssessment = lazy(
  () => import(/* webpackChunkName: "avaliacao-chunk" */ '@/pages/NewAssessment'),
)
const AssessmentDetail = lazy(
  () => import(/* webpackChunkName: "avaliacao-detail-chunk" */ '@/pages/AssessmentDetail'),
)
const Report = lazy(() => import(/* webpackChunkName: "relatorio-chunk" */ '@/pages/Report'))
const Summary = lazy(() => import(/* webpackChunkName: "sumario-chunk" */ '@/pages/Summary'))
const Resumo = lazy(() => import(/* webpackChunkName: "resumo-chunk" */ '@/pages/Resumo'))

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
          <NavigationProgress />
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
                  <Route path="/relatorio/:id" element={<Report />} />
                  <Route path="/sumario/:id" element={<Summary />} />
                  <Route path="/resumo/:id" element={<Resumo />} />
                </Route>
              </Routes>
            </Suspense>
          </TooltipProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
