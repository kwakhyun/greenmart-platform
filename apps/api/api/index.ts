import { createApp } from "../src/app";
import type { IncomingMessage, ServerResponse } from "http";

const app = createApp();

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}
