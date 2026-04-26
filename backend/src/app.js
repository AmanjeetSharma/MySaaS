import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error.middleware.js";
import env from "./config/env.js";

const app = express();

app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Import routes
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";


// Use routes
app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/users", userRoutes);


// Error handling middleware
app.use(errorHandler);

export { app };