import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createApiResponse } from "@marketplace/utils";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4005;

app.use(cors());
app.use(express.json());

interface Notification {
  id: string;
  to: string;
  subject: string;
  message: string;
  type: string;
  sentAt: Date;
}

const notifications: Notification[] = [];

app.post("/notify", async (req, res) => {
  const { to, subject, message, type = "email" } = req.body;

  const notification: Notification = {
    id: crypto.randomUUID(),
    to,
    subject,
    message,
    type,
    sentAt: new Date(),
  };

  notifications.push(notification);

  console.log(`[NOTIFICATION] To: ${to}, Subject: ${subject}, Message: ${message}`);

  res.status(201).json(createApiResponse(true, notification, "Notification queued"));
});

app.get("/notifications", (_, res) => {
  res.json(createApiResponse(true, notifications.slice(-100)));
});

app.get("/health", (_, res) => {
  res.json({ status: "ok", service: "notification-service" });
});

app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});

export default app;
