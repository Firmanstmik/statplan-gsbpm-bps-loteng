import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { LandingPage } from '@/features/landing/LandingPage'
import { Skeleton } from '@/components/ui/EmptyState'

const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const NewProjectPage = lazy(() =>
  import('@/features/planner/NewProjectPage').then((m) => ({ default: m.NewProjectPage })),
)
const ProjectWorkspacePage = lazy(() =>
  import('@/features/workspace/ProjectWorkspacePage').then((m) => ({
    default: m.ProjectWorkspacePage,
  })),
)
const AssistantPage = lazy(() =>
  import('@/features/settings/AssistantPage').then((m) => ({ default: m.AssistantPage })),
)
const SettingsPage = lazy(() =>
  import('@/features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
const AboutPage = lazy(() =>
  import('@/features/about/AboutPage').then((m) => ({ default: m.AboutPage })),
)
const HelpPage = lazy(() =>
  import('@/features/help/HelpPage').then((m) => ({ default: m.HelpPage })),
)
const PresentationPage = lazy(() =>
  import('@/features/presentation/PresentationPage').then((m) => ({
    default: m.PresentationPage,
  })),
)
const SearchPage = lazy(() =>
  import('@/features/search/SearchPage').then((m) => ({ default: m.SearchPage })),
)

const ExampleWalkthroughPage = lazy(() =>
  import('@/features/examples/ExampleWalkthroughPage').then((m) => ({
    default: m.ExampleWalkthroughPage,
  })),
)
const GuidedPhasePage = lazy(() =>
  import('@/features/planner/guided/GuidedPhasePage').then((m) => ({
    default: m.GuidedPhasePage,
  })),
)

function RouteFallback() {
  return (
    <div className="space-y-4 py-6" role="status" aria-live="polite" aria-label="Menyiapkan halaman">
      <p className="text-sm text-ink-600">Menyiapkan halaman…</p>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/contoh/:slug" element={<ExampleWalkthroughPage />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="new" element={<NewProjectPage />} />
            <Route path="assistant" element={<AssistantPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="presentation" element={<PresentationPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="projects/:id/guided" element={<GuidedPhasePage />} />
            <Route path="projects/:id" element={<ProjectWorkspacePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
