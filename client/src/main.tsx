import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { DashboardProvider } from "./contexts/dashboard-context";

createRoot(document.getElementById("root")!).render(
  <DashboardProvider>
    <App />
  </DashboardProvider>
);
