import { createApp } from "./app";
import { logger } from "./lib/logger";

const PORT = parseInt(process.env.PORT || "4000", 10);
const app = createApp();

app.listen(PORT, () => {
  logger.info(`🌿 GreenMart API Server started`, {
    port: PORT,
    health: `http://localhost:${PORT}/api/health`,
    docs: `http://localhost:${PORT}/api/docs`,
    env: process.env.NODE_ENV || "development",
  });
});
