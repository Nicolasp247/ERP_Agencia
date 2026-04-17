import ReactDOM from "react-dom/client";

import { AppProviders } from "@/core/AppProviders";
import { AppRouter } from "@/routes/AppRouter";
import "@/styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <AppRouter />
  </AppProviders>
);
