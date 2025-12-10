import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);

app.get("/health", (_, res) => {
  res.json({ status: "ok", service: "auth-service" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});

export default app;
