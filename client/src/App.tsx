import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CloneSetup from "./pages/CloneSetup";
import ChatLog from "./pages/ChatLog";
import Report from "./pages/Report";
import Pricing from "./pages/Pricing";
import { AnimatePresence } from "framer-motion";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/clone-setup" component={CloneSetup} />
        <Route path="/chat-log" component={ChatLog} />
        <Route path="/report" component={Report} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        {/* Design: Warm Afternoon Conversation - 건실한 만남 */}
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
