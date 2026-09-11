import { Routes, Route } from "react-router"
import Layout from "./components/Layout"
import DashboardPage from "./pages/DashboardPage"
import PartnersPage from "./pages/PartnersPage"
import PartnerDetailPage from "./pages/PartnerDetailPage"
import DocumentsPage from "./pages/DocumentsPage"
import UtilsPage from "./pages/UtilsPage"
import SettingsPage from "./pages/SettingsPage"
import { Toaster } from "./components/ui/sonner"

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/partners/:id" element={<PartnerDetailPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/utils" element={<UtilsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
      <Toaster />
    </>
  )
}

export default App
