import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import sharp from "sharp";
import path from "path";
import env from "../config/env.js";

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});

// Upload avatar
export const uploadOnCloudinary = async (localFilePath, folder = "avatars") => {
    try {
        if (!localFilePath) return null;

        const compressedPath = localFilePath.replace(/(\.\w+)$/, "-compressed.jpg");// e.g., 1697059200000-avatar-compressed.jpg

        // converting image size to 400x400 and compressing it to 70% quality for faster uploads and optimized storage
        const compressedImage = await sharp(localFilePath)
            .resize({ width: 400, height: 400, fit: "cover" })
            .jpeg({ quality: 70 })
            .toFile(compressedPath);[]

        // debug log to compare original and compressed image sizes
        // console.log(`Previous image size: ${(fs.statSync(localFilePath).size / 1024).toFixed(2)} KB, Compressed image size: ${(compressedImage.size / 1024).toFixed(2)} KB`);

        const result = await cloudinary.uploader.upload(compressedPath, {
            folder: folder,
        });

        // Cleanup
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath); // remove original file
        if (fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath); // remove compressed file

        console.log(`File uploaded to Cloudinary successfully. Local files removed: ${path.basename(localFilePath)}, ${path.basename(compressedPath)}`);

        return {
            url: result.secure_url,
            publicId: result.public_id,
        };

    } catch (error) {
        console.error("Cloudinary upload failed:", error.message);

        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath); // ensure original file is removed on uploadation failure 
        if (fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath); // ensure compressed file is also removed

        return null;
    }
};

export const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return;
        await cloudinary.uploader.destroy(publicId);
        console.log(`File with publicId ${publicId} deleted from Cloudinary successfully.`);
    } catch (error) {
        console.error(`Failed to delete file with publicId ${publicId} from Cloudinary:`, error.message);
    }
};