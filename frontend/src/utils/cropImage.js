// src/utils/cropImage.js

const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

function getRadianAngle(degreeValue) {
    return (degreeValue * Math.PI) / 180;
}

/**
 * Generates a cropped File object from an image URL and pixel crop area.
 * Preserves PNG transparency if input is PNG/WEBP.
 */
export async function getCroppedImg(
    imageSrc,
    pixelCrop,
    rotation = 0,
    fileName = 'cropped-image.jpg',
    outputType = 'image/jpeg'
) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    const rotRad = getRadianAngle(rotation);

    // Calculate bounding box of rotated image
    const boundingBoxWidth =
        Math.abs(Math.cos(rotRad) * image.width) +
        Math.abs(Math.sin(rotRad) * image.height);
    const boundingBoxHeight =
        Math.abs(Math.sin(rotRad) * image.width) +
        Math.abs(Math.cos(rotRad) * image.height);

    // Set canvas size to match the bounding box
    canvas.width = boundingBoxWidth;
    canvas.height = boundingBoxHeight;

    // Translate canvas center to image center and rotate
    ctx.translate(boundingBoxWidth / 2, boundingBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.width / 2, -image.height / 2);

    // Draw image on canvas
    ctx.drawImage(image, 0, 0);

    // Create crop canvas
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');

    if (!cropCtx) {
        throw new Error('No crop context');
    }

    cropCanvas.width = pixelCrop.width;
    cropCanvas.height = pixelCrop.height;

    // Extract crop area from the canvas
    cropCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    // Convert canvas to File object
    return new Promise((resolve, reject) => {
        cropCanvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                const file = new File([blob], fileName, { type: outputType });
                resolve(file);
            },
            outputType,
            0.95 // High quality
        );
    });
}