/* erp-tour-operator/backend/src/server.ts */

import { createApp } from "@/app";
import { env } from "@/core/config/env";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Backend running on http://localhost:${env.PORT}`);
});
