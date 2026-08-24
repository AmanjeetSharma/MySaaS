import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
import env from "../config/env.config.js";
import logger from "../config/logger.js";

const errorHandler = (err, req, res, next) => {
    let error = err;

    if (err instanceof mongoose.Error.ValidationError) {

        const errors = Object.values(err.errors).map(error => ({
            field: error.path,
            message: error.message,
        }));

        logger.warn(
            {
                requestId: req.id,
                method: req.method,
                path: req.originalUrl,
                statusCode: 400,
                isOperational: true,
                errors
            },
            "Request validation failed"
        );

        return res.status(400).json({
            statusCode: 400,
            success: false,
            message: "Validation failed.",
            errors,
        });
    }

    // converts unknown errors -> ApiError
    if (!(error instanceof ApiError)) {
        error = new ApiError(
            error.statusCode || 500,
            "Internal Server Error",
            [],
            err.stack
        );

        error.isOperational = false;
    }

    logger.error(
        {
            err: error,
            requestId: req.id,
            method: req.method,
            path: req.originalUrl,
            statusCode: error.statusCode,
            isOperational: error.isOperational
        },
        "Request failed"
    );

    const statusCode = error.statusCode || 500;

    const response = {
        success: false,
        message: error.isOperational
            ? error.message
            : "Something went wrong",

        ...(error.errors?.length > 0 && { errors: error.errors }),// Include errors array if it exists and is not empty
    };

    if (env.NODE_ENV === "development") {
        response.stack = error.stack;
    }

    res.status(statusCode).json(response);
};

export default errorHandler;