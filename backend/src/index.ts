import express from "express";
import cors from "cors";
import path from "path";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

import servicesRouter from "./routes/services";
import bookingsRouter from "./routes/bookings";
import reviewsRouter from "./routes/reviews";
import providerRouter from "./routes/provider";
import adminRouter from "./routes/admin";

const app = express();
const port = process.env.PORT || 8000;

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(
  cors({
    origin: [frontendUrl, frontendUrl.replace(/\/$/, "")],
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/services", servicesRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/provider", providerRouter);
app.use("/api/admin", adminRouter);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);
console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID)
console.log("Google Client Secret:", process.env.GOOGLE_CLIENT_SECRET)
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
