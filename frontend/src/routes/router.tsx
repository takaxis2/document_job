import Nav from "@/components/Nav";
import Dashboard from "@/pages/Dashboard";
import Document from "@/pages/Document";
import Setting from "@/pages/Setting";
import Vendor from "@/pages/Vendor";
import VendorDetail from "@/pages/VendorDetail";

import { HashRouter, Route, Routes } from "react-router-dom";


export default function Router() {
    return (
        <HashRouter basename={"/"}>

            <Nav />

            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/document" element={<Document />} />
                <Route path="/vendor" element={<Vendor />} />
                <Route path="/vendor-detail" element={<VendorDetail />} />
                <Route path="/setting" element={<Setting />} />
            </Routes>

        </HashRouter>
    )
}