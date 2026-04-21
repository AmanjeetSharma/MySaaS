import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import sharp from "sharp";
import path from "path";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload avatar
export const uploadAvatar = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const compressedPath = localFilePath.replace(
            /(\.\w+)$/,
            "-compressed.jpg"
        );

        // converting image size to 400x400 and compressing it to 70% quality for faster uploads and optimized storage
        await sharp(localFilePath)
            .resize({ width: 400, height: 400, fit: "cover" })
            .jpeg({ quality: 70 })
            .toFile(compressedPath);

        const result = await cloudinary.uploader.upload(compressedPath, {
            folder: "avatars",
        });

        // Cleanup
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        if (fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath);

        return {
            url: result.secure_url,
            publicId: result.public_id,
        };

    } catch (error) {
        console.error("❌ Cloudinary upload failed:", error.message);

        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        return null;
    }
};

