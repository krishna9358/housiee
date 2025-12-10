import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { listingRouter } from "./routes/listing.js";
import { providerRouter } from "./routes/provider.js";
import { adminRouter } from "./routes/admin.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

app.use("/listings", listingRouter);
app.use("/provider/listings", providerRouter);
app.use("/admin/listings", adminRouter);

app.get("/health", (_, res) => {
  res.json({ status: "ok", service: "listing-service" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Listing service running on port ${PORT}`);
});

export default app;
