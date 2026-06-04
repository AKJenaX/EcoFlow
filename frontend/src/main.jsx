import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import "./styles.css";
import MainLayout from "./layouts/MainLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Bins from "./pages/Bins.jsx";
import RoutesPage from "./pages/Routes.jsx";
import Reports from "./pages/Reports.jsx";
import Fleet from "./pages/Fleet.jsx";
import MapPage from "./pages/MapPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "bins", element: <Bins /> },
      { path: "routes", element: <RoutesPage /> },
      { path: "reports", element: <Reports /> },
      { path: "fleet", element: <Fleet /> },
      { path: "map", element: <MapPage /> }
    ]
  }
]);

createRoot(document.getElementById("root")).render(<RouterProvider router={router} />);
