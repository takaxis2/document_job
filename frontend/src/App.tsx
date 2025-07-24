import { Routes, Route } from "react-router"
import Layout from "./components/Layout"
import DashboardPage from "./pages/DashboardPage"
import PartnersPage from "./pages/PartnersPage"
import DocumentsPage from "./pages/Documentspage"
import { Toaster } from "./components/ui/sonner"

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
        </Routes>
      </Layout>
      <Toaster />
    </>
  )
}

export default App
