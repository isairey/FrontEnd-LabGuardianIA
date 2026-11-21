
import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";

// Layout
import AppLayout from "../components/layout/AppLayout";

// Pages
import Dashboard from "../pages/Dashboard";
import Samples from "../pages/Samples";
import SampleDetails from "../pages/SampleDetails";
import Equipment from "../pages/Equipment";
import QRScanner from "../pages/QRScanner";
import RiskAnalysis from "../pages/RiskAnalysis";
import Traceability from "../pages/Traceability";
import Settings from "../pages/Settings";
import NotFound from "../pages/NotFound";

// =====================================================
// ROUTER
// =====================================================

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      // Dashboard
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },

      // Samples
      {
        path: "samples",
        element: <Samples />,
      },
      {
        path: "samples/:id",
        element: <SampleDetails />,
      },

      // Equipment
      {
        path: "equipment",
        element: <Equipment />,
      },

      // QR Scanner
      {
        path: "qr-scanner",
        element: <QRScanner />,
      },

      // Risk Analysis
      {
        path: "risk-analysis",
        element: <RiskAnalysis />,
      },

      // Traceability
      {
        path: "traceability",
        element: <Traceability />,
      },

      // Settings
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },

  // 404 - Not Found
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
