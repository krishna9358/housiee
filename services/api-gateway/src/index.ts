import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import { verifyToken } from "@marketplace/utils";
import { JwtPayload } from "@marketplace/types";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3002", "http://localhost:3003"],
  credentials: true,
}));

app.use(express.json());

const services = {
  auth: process.env.AUTH_SERVICE_URL || "http://localhost:4001",
  listing: process.env.LISTING_SERVICE_URL || "http://localhost:4002",
  booking: process.env.BOOKING_SERVICE_URL || "http://localhost:4003",
  review: process.env.REVIEW_SERVICE_URL || "http://localhost:4004",
  notification: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:4005",
};

function createProxy(target: string, pathRewrite?: Record<string, string>): Options {
  return {
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      proxyReq: (proxyReq, req) => {
        if ((req as express.Request).user) {
          proxyReq.setHeader("x-user-id", (req as express.Request).user!.userId);
          proxyReq.setHeader("x-user-email", (req as express.Request).user!.email);
          proxyReq.setHeader("x-user-role", (req as express.Request).user!.role);
        }
      },
    },
  };
}

function optionalAuth(req: express.Request, _res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token, process.env.JWT_SECRET!);
    if (payload) {
      req.user = payload;
    }
  }
  next();
}

app.use(optionalAuth);

app.use("/api/auth", createProxyMiddleware(createProxy(services.auth, { "^/api/auth": "/auth" })));

app.use("/api/listings", createProxyMiddleware(createProxy(services.listing, { "^/api/listings": "/listings" })));
app.use("/api/provider/listings", createProxyMiddleware(createProxy(services.listing, { "^/api/provider/listings": "/provider/listings" })));
app.use("/api/admin/listings", createProxyMiddleware(createProxy(services.listing, { "^/api/admin/listings": "/admin/listings" })));

app.use("/api/bookings", createProxyMiddleware(createProxy(services.booking, { "^/api/bookings": "/bookings" })));
app.use("/api/provider/bookings", createProxyMiddleware(createProxy(services.booking, { "^/api/provider/bookings": "/provider/bookings" })));

app.use("/api/reviews", createProxyMiddleware(createProxy(services.review, { "^/api/reviews": "/reviews" })));

app.use("/api/notifications", createProxyMiddleware(createProxy(services.notification, { "^/api/notifications": "" })));

app.get("/api/me", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }

  try {
    const response = await fetch(`${services.auth}/auth/me`, {
      headers: { Authorization: req.headers.authorization || "" },
    });
    const data = await response.json();
    res.json(data);
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch user" });
  }
});

app.get("/api/health", async (_, res) => {
  const health: Record<string, string> = { gateway: "ok" };

  for (const [name, url] of Object.entries(services)) {
    try {
      const response = await fetch(`${url}/health`);
      health[name] = response.ok ? "ok" : "error";
    } catch {
      health[name] = "unreachable";
    }
  }

  res.json({ status: "ok", services: health });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log("Services:", services);
});

export default app;
