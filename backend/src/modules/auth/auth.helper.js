import fs from "fs";

const removeLocalFile = (filePath, reason = "unknown") => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        console.log(`Removed local file: ${filePath} due to ${reason}`);
    } catch (err) {
        console.error("File cleanup failed:", err.message);
    }
};



export const cleanupAvatar = (file, reason = "avatar upload failure") => {
    if (file?.path) removeLocalFile(file.path, reason);
};



export const getTimeDifference = (expiryTime) => {
    const now = Date.now();
    const diffMs = expiryTime - now;

    const absMs = Math.abs(diffMs);

    const minutes = Math.floor(absMs / (1000 * 60));
    const hours = Math.floor(absMs / (1000 * 60 * 60));
    const days = Math.floor(absMs / (1000 * 60 * 60 * 24));

    let timeString = "";

    if (days > 0) {
        timeString = `${days} day${days > 1 ? "s" : ""}`;
    } else if (hours > 0) {
        timeString = `${hours} hour${hours > 1 ? "s" : ""}`;
    } else {
        timeString = `${minutes} minute${minutes > 1 ? "s" : ""}`;
    }

    return diffMs > 0
        ? `expires in ${timeString}`
        : `expired ${timeString} ago`;
};