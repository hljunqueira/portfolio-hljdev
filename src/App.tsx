import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense } from "react";

// ── Public routes (loaded immediately) ───────────────────────────────────────
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import LinksBio from "./pages/LinksBio";
import Shop from "./pages/Shop";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// ── Admin routes (lazy-loaded — NOT included in the initial bundle) ──────────
// This ensures the heavy libraries (Recharts, DnD, react-pdf, Google Maps)
// are NEVER downloaded by a visitor on the public landing page.
const Admin          = lazy(() => import("./pages/Admin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminPipeline  = lazy(() => import("./pages/admin/AdminPipeline"));
const AdminMaps      = lazy(() => import("./pages/admin/AdminMaps"));
const AdminProjetos  = lazy(() => import("./pages/admin/AdminProjetos"));
const AdminTarefas   = lazy(() => import("./pages/admin/AdminTarefas"));
const AdminConfig    = lazy(() => import("./pages/admin/AdminConfig"));

// ── Minimal loading fallback while lazy chunks download ──────────────────────
const AdminLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="flex items-center gap-3 text-primary animate-pulse">
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,  // 2 minutes cache before background refetch
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/links" element={<LinksBio />} />
            <Route path="/shop" element={<Shop />} />

            {/* Admin — lazy-loaded, protected */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<AdminLoader />}>
                    <Admin />
                  </Suspense>
                </ProtectedRoute>
              }
            >
              <Route index element={<Suspense fallback={<AdminLoader />}><AdminDashboard /></Suspense>} />
              <Route path="pipeline" element={<Suspense fallback={<AdminLoader />}><AdminPipeline /></Suspense>} />
              <Route path="maps" element={<Suspense fallback={<AdminLoader />}><AdminMaps /></Suspense>} />
              <Route path="projetos" element={<Suspense fallback={<AdminLoader />}><AdminProjetos /></Suspense>} />
              <Route path="tarefas" element={<Suspense fallback={<AdminLoader />}><AdminTarefas /></Suspense>} />
              <Route path="config" element={<Suspense fallback={<AdminLoader />}><AdminConfig /></Suspense>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
