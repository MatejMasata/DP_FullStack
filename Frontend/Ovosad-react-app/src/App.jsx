import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

import { Home } from "./pages/Home";
import { Agents } from "./pages/Agents";
import { FileBatches } from "./pages/FileBatches";
import { Orchards } from "./pages/Orchards";

import { OrchardDetails } from "./pages/OrchardDetails";
import { TreeDetails } from "./pages/TreeDetails";
import { FileBatchDetails } from "./pages/FileBatchDetails";

import { NotFound } from "./pages/NotFound";

import { Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { KeycloakProvider } from "./auth/KeycloakProvider";
import { ToastProvider } from "./components/ToastProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep previous data while refetching
      keepPreviousData: true,
      // Retry failed requests once
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <KeycloakProvider>
        <ToastProvider />

        <div className="body-container">
          <Navbar />

          <div className="page-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/filebatches" element={<FileBatches />} />
              <Route
                path="/filebatch/:batchId"
                element={<FileBatchDetails />}
              />
              <Route path="/orchards" element={<Orchards />} />
              <Route path="/orchard/:orchardId" element={<OrchardDetails />} />
              <Route path="/tree/:treeId" element={<TreeDetails />} />
              {/* Catch-all route for non-existent pages */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>

          <Footer />
        </div>
      </KeycloakProvider>
    </QueryClientProvider>
  );
}

export default App;
