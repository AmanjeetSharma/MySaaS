import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import sharp from "sharp";
import path from "path";
import env from "../config/env.config.js";
import logger from "../config/logger.js";

const log = logger.child({ module: "cloudinary.integration" });

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});

// Upload avatar
export const uploadOnCloudinary = async (localFilePath, folder = "avatars") => {
    let compressedPath;

    try {
        if (!localFilePath) return null;

        const isGif = path.extname(localFilePath).toLowerCase() === ".gif";

        if (isGif) {
            const result = await cloudinary.uploader.upload(localFilePath, {
                folder,
                resource_type: "image",
            });

            log.info(
                {
                    file: path.basename(localFilePath),
                    folder,
                    resourceType: "image",
                },
                "GIF uploaded to Cloudinary"
            );

            return {
                url: result.secure_url,
                publicId: result.public_id,
            };
        }

        compressedPath = localFilePath.replace(/(\.\w+)$/, "-compressed.jpg");// e.g., 1697059200000-avatar-compressed.jpg

        // converting image size to 400x400 and compressing it to 70% quality for faster uploads and optimized storage
        const compressedImage = await sharp(localFilePath)
            .resize({
                width: 400,
                height: 400,
                fit: "cover"
            })
            .jpeg({
                quality: 70
            })
            .toFile(compressedPath);

        // debug log to compare original and compressed image sizes
        // log.debug(
        //     {
        //         originalFile: path.basename(localFilePath),
        //         compressedFile: path.basename(compressedPath),
        //         originalSizeKB: (
        //             fs.statSync(localFilePath).size / 1024
        //         ).toFixed(2),
        //         compressedSizeKB: (
        //             compressedImage.size / 1024
        //         ).toFixed(2),
        //     },
        //     "Image compression completed"
        // );

        const result = await cloudinary.uploader.upload(compressedPath, {
            folder: folder,
        });

        log.info(
            {
                file: path.basename(localFilePath),
                compressedFile: path.basename(compressedPath),
                folder,
                publicId: result.public_id,
            },
            "File uploaded to Cloudinary"
        );

        return {
            url: result.secure_url,
            publicId: result.public_id,
        };

    } catch (error) {

        log.error(
            {
                err: error,
                file: localFilePath
                    ? path.basename(localFilePath)
                    : undefined,
                folder,
            },
            "Cloudinary upload failed"
        );

        return null;

    } finally {
        // Clean up local files
        if (localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        if (compressedPath && fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath);
    }
};

export const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return;
        await cloudinary.uploader.destroy(publicId);
        log.info(
            {
                publicId,
            },
            "File deleted from Cloudinary"
        );
    } catch (error) {
        log.error(
            {
                err: error,
                publicId,
            },
            "Cloudinary file deletion failed"
        );
    }
};