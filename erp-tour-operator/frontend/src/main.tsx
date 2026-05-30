/* <erp-tour-operator/frontend/src/main.tsx> */

import ReactDOM from "react-dom/client";

import { AppProviders } from "@/core/AppProviders";
import { AppRouter } from "@/routes/AppRouter";
import "@/styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <AppRouter />
  </AppProviders>
);
