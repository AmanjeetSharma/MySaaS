class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong...", errors = [], stack = "") {
        super(message);

        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        this.isOperational = true;
        // if true: These are expected/handled errors (your app knows they can happen. e.g., validation errors, not found errors)
        // if false: These are unexpected/unhandled errors (e.g., programming errors, bugs)

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };