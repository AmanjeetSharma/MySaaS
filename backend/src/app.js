import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error.middleware.js";
import httpLogger from "./middlewares/httpLogger.middleware.js";
import env from "./config/env.config.js";

const app = express();

app.use(httpLogger);

app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true
}));

app.use(
    "/api/v1/payments/webhook",
    express.raw({ type: "application/json" })
)
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public/temp"));
app.use(cookieParser());

// Import routes
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import organizationRoutes from "./modules/organization/organization.routes.js";
import serviceRoutes from "./modules/service/service.routes.js";
import availabilityRoutes from "./modules/availability/availability.routes.js";
import customerRoutes from "./modules/customer/customer.routes.js";
import dealRoutes from "./modules/deal/deal.routes.js";
import activityRoutes from "./modules/activity/activity.routes.js";
import bookingRoutes from "./modules/booking/booking.routes.js";
import googleRoutes from "./modules/providers/google/google.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";

// Use routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/organizations", organizationRoutes);
app.use("/api/v1/services", serviceRoutes);
app.use("/api/v1/availability", availabilityRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/deals", dealRoutes);
app.use("/api/v1/activities", activityRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/providers/google", googleRoutes);
app.use("/api/v1/payments", paymentRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
