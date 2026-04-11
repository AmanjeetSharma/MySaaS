import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {

    let error = err;

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

    // error logging
    // console.error("ERROR 💥:", error);
    console.error("ERROR 💥:", {
        message: error.message,
        statusCode: error.statusCode,
        isOperational: error.isOperational,
        path: req.originalUrl,
        method: req.method,
        stack: error.stack
    });

    const statusCode = error.statusCode || 500;

    const response = {
        success: false,
        message: error.isOperational
            ? error.message
            : "Something went wrong",

        ...(error.errors?.length > 0 && { errors: error.errors }),// Include errors array if it exists and is not empty
    };

    if (process.env.NODE_ENV === "development") {
        response.stack = error.stack;
    }

    res.status(statusCode).json(response);
};

export default errorHandler;