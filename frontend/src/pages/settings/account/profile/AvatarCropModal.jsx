// src/components/AvatarCropModal.jsx
import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCw, RotateCcw, RefreshCw } from 'lucide-react';
import { getCroppedImg } from '@/utils/cropImage';

const AvatarCropModal = ({
    imageSrc,
    isOpen,
    onClose,
    onCropComplete,
    isUploading,
    fileType = 'image/jpeg'
}) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCropComplete = useCallback((_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleReset = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
    };

    const handleSave = () => {
        if (!croppedAreaPixels || !imageSrc || isProcessing || isUploading) return;

        // Instant UI feedback
        setIsProcessing(true);

        // Yield to browser frame to render processing loader immediately
        setTimeout(async () => {
            try {
                const croppedFile = await getCroppedImg(
                    imageSrc,
                    croppedAreaPixels,
                    rotation,
                    'avatar.jpg',
                    fileType,
                    512 // Cap output resolution to 512x512 for optimal performance
                );
                await onCropComplete(croppedFile);
            } catch (e) {
                console.error('Error cropping image:', e);
            } finally {
                setIsProcessing(false);
            }
        }, 50);
    };

    const isBusy = isProcessing || isUploading;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isBusy && onClose()}>
            <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-md border-border/80 shadow-2xl p-5 sm:p-6 rounded-2xl">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-base sm:text-xl font-semibold tracking-tight">
                        Adjust Profile Picture
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                        Drag to position & scroll/pinch to zoom.
                    </DialogDescription>
                </DialogHeader>

                {/* Cropper Viewport Area */}
                <div className="relative w-full h-64 sm:h-72 bg-neutral-950 rounded-xl overflow-hidden border border-border/50 shadow-inner my-2 select-none">
                    {imageSrc && (
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onRotationChange={setRotation}
                            onCropComplete={handleCropComplete}
                            style={{
                                containerStyle: { width: '100%', height: '100%', touchAction: 'none' },
                                cropAreaStyle: { border: '2px solid rgba(255, 255, 255, 0.85)' }
                            }}
                        />
                    )}
                </div>

                {/* Rotation Control Slider & Quick Step Buttons */}
                <div className="space-y-3 py-1">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5">
                                Rotate the image to adjust its orientation
                            </span>
                            <span className="font-mono text-[11px]">{Number(rotation).toFixed(2)}°</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 rounded-lg cursor-pointer transition-all active:scale-90 hover:bg-muted"
                                onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                                disabled={isBusy}
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                            <input
                                type="range"
                                value={rotation}
                                min={0}
                                max={360}
                                step={1}
                                onChange={(e) => setRotation(Number(e.target.value))}
                                disabled={isBusy}
                                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary transition-opacity hover:opacity-100 opacity-90"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 rounded-lg cursor-pointer transition-all active:scale-90 hover:bg-muted"
                                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                                disabled={isBusy}
                            >
                                <RotateCw className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Modal Actions */}
                <DialogFooter className="flex flex-row items-center justify-between gap-3 pt-3 border-t border-border/40 sm:justify-between">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        disabled={isBusy || (zoom === 1 && rotation === 0 && crop.x === 0 && crop.y === 0)}
                        className="text-xs gap-1.5 text-muted-foreground hover:text-foreground rounded-xl cursor-pointer transition-all active:scale-95 px-3 py-2"
                    >
                        <RefreshCw className="h-3.5 w-3.5" /> Reset
                    </Button>

                    <div className="flex gap-2.5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isBusy}
                            className="
                                h-8 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium cursor-pointer transition-all active:scale-95
                                border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive
                            "
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            onClick={handleSave}
                            disabled={isBusy}
                            className="
                                h-8 px-4 py-2.5 rounded-xl text-xs sm:text-sm gap-2 font-medium cursor-pointer transition-all active:scale-95 shadow-sm hover:shadow
                            "
                        >
                            {isBusy ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {isProcessing ? 'Processing...' : 'Uploading...'}
                                </>
                            ) : (
                                'Crop & Save'
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AvatarCropModal;