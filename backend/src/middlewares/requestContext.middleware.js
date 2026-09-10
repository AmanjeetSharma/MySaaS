import requestContext from "../config/requestContext.js";

const requestContextMiddleware = (req, res, next) => {

    requestContext.run(
        {
            requestId: req.id,
            userId: "anonymous"
        },
        next
    );

};

export default requestContextMiddleware;