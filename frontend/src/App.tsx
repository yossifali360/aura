import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/config/queryClient'
import { MainLayout } from '@/components/layout/MainLayout'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { HomePage } from '@/pages/HomePage'
import { ApplyPage } from '@/pages/ApplyPage'
import { PoliceApplyPage } from '@/pages/PoliceApplyPage'
import { EmsApplyPage } from '@/pages/EmsApplyPage'
import { RulesPage } from '@/pages/RulesPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { PoliceProfilePage } from '@/pages/PoliceProfilePage'
import { TeamPage } from '@/pages/TeamPage'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/apply" element={<ApplyPage />} />
          <Route path="/apply/police" element={<PoliceApplyPage />} />
          <Route path="/apply/ems" element={<EmsApplyPage />} />
          <Route path="/rules" element={<RulesPage type="server" />} />
          <Route path="/rules/police" element={<RulesPage type="police" />} />
          <Route path="/rules/ems" element={<RulesPage type="ems" />} />
          <Route path="/team" element={<TeamPage section="admin" />} />
          <Route path="/team/police" element={<TeamPage section="police" />} />
          <Route path="/team/ems" element={<TeamPage section="ems" />} />
          <Route path="/police/profile" element={<PoliceProfilePage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
      </Routes>
    </BrowserRouter>
    </QueryClientProvider>
  )
}
