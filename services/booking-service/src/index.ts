import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { bookingRouter } from "./routes/booking.js";
import { providerRouter } from "./routes/provider.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());

app.use("/bookings", bookingRouter);
app.use("/provider/bookings", providerRouter);

app.get("/health", (_, res) => {
  res.json({ status: "ok", service: "booking-service" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Booking service running on port ${PORT}`);
});

export default app;
