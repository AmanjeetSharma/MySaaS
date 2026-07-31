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
 * Crop canvas image with target sizing optimization
 */
export async function getCroppedImg(
    imageSrc,
    pixelCrop,
    rotation = 0,
    fileName = 'cropped-image.jpg',
    outputType = 'image/jpeg',
    maxOutputSize = 512 // 512px max dimension is ideal for avatars
) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('No 2d context');

    const rotRad = getRadianAngle(rotation);

    // Calculate bounding box
    const boundingBoxWidth =
        Math.abs(Math.cos(rotRad) * image.width) +
        Math.abs(Math.sin(rotRad) * image.height);
    const boundingBoxHeight =
        Math.abs(Math.sin(rotRad) * image.width) +
        Math.abs(Math.cos(rotRad) * image.height);

    canvas.width = boundingBoxWidth;
    canvas.height = boundingBoxHeight;

    ctx.translate(boundingBoxWidth / 2, boundingBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.width / 2, -image.height / 2);
    ctx.drawImage(image, 0, 0);

    // Calculate target output dimensions (Max limit capping)
    let targetWidth = pixelCrop.width;
    let targetHeight = pixelCrop.height;

    if (targetWidth > maxOutputSize || targetHeight > maxOutputSize) {
        if (targetWidth > targetHeight) {
            targetHeight = Math.round((targetHeight * maxOutputSize) / targetWidth);
            targetWidth = maxOutputSize;
        } else {
            targetWidth = Math.round((targetWidth * maxOutputSize) / targetHeight);
            targetHeight = maxOutputSize;
        }
    }

    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');

    if (!cropCtx) throw new Error('No crop context');

    cropCanvas.width = targetWidth;
    cropCanvas.height = targetHeight;

    // Smooth image scaling during resize
    cropCtx.imageSmoothingQuality = 'high';

    cropCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        targetWidth,
        targetHeight
    );

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
            0.90 
        );
    });
}