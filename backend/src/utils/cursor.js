import mongoose from "mongoose";

// Encode cursor object → base64 string
export const encodeCursor = (cursorObj) => {
    return Buffer.from(JSON.stringify(cursorObj)).toString("base64");
};

// Decode cursor string → original object
export const decodeCursor = (cursorStr) => {
    try {
        const decoded = Buffer.from(cursorStr, "base64").toString("utf-8");
        return JSON.parse(decoded);
    } catch (err) {
        return null;
    }
};