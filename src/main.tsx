import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Layout from "./components/Layout";
import Analytics from "./pages/Analytics";
import Conversations from "./pages/Conversations";
import Config from "./pages/Config";
import Leads from "./pages/Leads";
import Servicos from "./pages/Servicos";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/analytics" replace />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/conversations" element={<Conversations />} />
          <Route path="/config" element={<Config />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/servicos" element={<Servicos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
