import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "./lib/authService";

// --- PAHIGINA / PAGES ---
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Interns from "./pages/Interns";
import Attendance from "./pages/Attendance";
import QrScan from "./pages/QrScan";
import IdCards from "./pages/IdCards";
import InternProfile from "./pages/InternProfile";
import Employees from "./pages/Employees";
import EmployeeAttendance from "./pages/EmployeeAttendance";
import EmployeeIdCards from "./pages/EmployeeIdCards";
import NotFound from "./pages/NotFound";
import EmployeeProfile from "./pages/EmployeeProfile";

const queryClient = new QueryClient();

// Protected Route Component (Para sa mga Admin pages)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* 🟢 PUBLIC ROUTES (Kahit walang login, pwede makita) */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/intern/:id" element={<InternProfile />} />
          <Route path="/employee/:id" element={<EmployeeProfile />} /> {/* <-- Idinagdag na linya */}
          
          {/* 🔴 ADMIN PROTECTED ROUTES (Kailangan naka-login) */}
          
          {/* Main */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/scan" element={<ProtectedRoute><QrScan /></ProtectedRoute>} />
          
          {/* Interns Management */}
          <Route path="/interns" element={<ProtectedRoute><Interns /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
          <Route path="/id-cards" element={<ProtectedRoute><IdCards /></ProtectedRoute>} />
          
          {/* Employees Management */}
          <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
          <Route path="/employee-attendance" element={<ProtectedRoute><EmployeeAttendance /></ProtectedRoute>} />
          <Route path="/employee-id-cards" element={<ProtectedRoute><EmployeeIdCards /></ProtectedRoute>} />
          
          {/* Catch-all (404 Page Not Found) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;