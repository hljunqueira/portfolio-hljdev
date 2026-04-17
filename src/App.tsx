import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Shop from "./pages/Shop";
import LinksBio from "./pages/LinksBio";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPipeline from "./pages/admin/AdminPipeline";
import AdminCampanhas from "./pages/admin/AdminCampanhas";
import AdminProjetos from "./pages/admin/AdminProjetos";
import AdminTarefas from "./pages/admin/AdminTarefas";
import AdminConfig from "./pages/admin/AdminConfig";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/links" element={<LinksBio />} />
            <Route path="/shop" element={<Shop />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="pipeline" element={<AdminPipeline />} />
              <Route path="campanhas" element={<AdminCampanhas />} />
              <Route path="projetos" element={<AdminProjetos />} />
              <Route path="tarefas" element={<AdminTarefas />} />
              <Route path="config" element={<AdminConfig />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
