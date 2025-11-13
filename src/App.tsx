import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { Navigation } from "@/components/Navigation";
import ChartViewer from "./pages/ChartViewer";
import VolumeBoost from "./pages/VolumeBoost";
import TransactionBoost from "./pages/TransactionBoost";
import RunAds from "./pages/RunAds";
import Donate from "./pages/Donate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<ChartViewer />} />
            <Route path="/boost-volume/:contractAddress" element={<VolumeBoost />} />
            <Route path="/boost-transactions/:contractAddress" element={<TransactionBoost />} />
            <Route path="/run-ads/:contractAddress" element={<RunAds />} />
            <Route path="/donate" element={<Donate />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
