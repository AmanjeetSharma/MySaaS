import fs from "fs";

const removeLocalFile = (filePath, reason="unknown") => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        console.log(`Removed local file: ${filePath} due to ${reason}`);
    } catch (err) {
        console.error("File cleanup failed:", err.message);
    }
};



export const cleanupAvatar = (file, reason="avatar upload failure") => {
    if (file?.path) removeLocalFile(file.path, reason);
};