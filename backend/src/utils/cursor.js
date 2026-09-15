import mongoose from "mongoose";

// Encode cursor object → base64 string
export const encodeCursor = (cursorObj) => {
    return Buffer.from(JSON.stringify(cursorObj)).toString("base64");
};

// Decode cursor string → original object
export const decodeCursor = (cursorStr) => {
    try {
        if (!cursorStr || typeof cursorStr !== "string") {
            return null;
        }

        const decoded = Buffer.from(cursorStr, "base64").toString("utf-8");
        const parsed = JSON.parse(decoded);

        if (!parsed ||
            !parsed.createdAt ||
            !parsed._id ||
            !mongoose.Types.ObjectId.isValid(parsed._id)) {
            return null;
        }

        const createdAt = new Date(parsed.createdAt);
        if (isNaN(createdAt.getTime())) {
            return null;
        }

        return {
            createdAt,
            _id: parsed._id,
        };

    } catch (err) {
        return null;
    }
};