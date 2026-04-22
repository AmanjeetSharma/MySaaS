import fs from "fs";
import multer from "multer";
import path from "path";
import { ApiError } from "../utils/ApiError.js";

const tempDir = "./public/temp";

if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        cb(null, `${Date.now()}-${file.fieldname}${extension}`);// e.g., 1697059200000-avatar.jpg
    }
});

export const upload = multer({ storage });