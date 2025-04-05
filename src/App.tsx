
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { WiseAppLayout } from "@/components/layouts/WiseAppLayout";
import Dashboard from "@/pages/Dashboard";
import StockAnalyzer from "@/pages/StockAnalyzer";
import InvestorJournal from "@/pages/InvestorJournal";
import AIAdvisor from "@/pages/AIAdvisor";
import PortfolioSimulator from "@/pages/PortfolioSimulator";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SidebarProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WiseAppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="stock-analyzer" element={<StockAnalyzer />} />
              <Route path="investor-journal" element={<InvestorJournal />} />
              <Route path="ai-advisor" element={<AIAdvisor />} />
              <Route path="portfolio-simulator" element={<PortfolioSimulator />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
