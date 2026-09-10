import { AsyncLocalStorage } from "node:async_hooks";

const requestContext = new AsyncLocalStorage();

export const getRequestContext = () => {
    return requestContext.getStore();
};

export const setUserId = (userId) => {
    const context = requestContext.getStore();

    if (!context) {
        return;
    }

    context.userId = userId;
};

export default requestContext;