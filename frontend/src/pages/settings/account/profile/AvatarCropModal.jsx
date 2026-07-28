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
import { Loader2, ZoomIn, ZoomOut, RotateCw, RotateCcw, RefreshCw } from 'lucide-react';
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

    const handleCropComplete = useCallback((_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleReset = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
    };

    const handleSave = async () => {
        try {
            if (!croppedAreaPixels || !imageSrc) return;
            const croppedFile = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                rotation,
                'avatar.jpg',
                fileType
            );
            await onCropComplete(croppedFile);
        } catch (e) {
            console.error('Error cropping image:', e);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isUploading && onClose()}>
            <DialogContent
                className="
          sm:max-w-lg bg-card/95 backdrop-blur-md border-border/80 shadow-2xl p-5 sm:p-6 rounded-2xl
          animate-in fade-in-0 zoom-in-95 duration-200
          [&>button]:cursor-pointer [&>button]:transition-transform [&>button]:active:scale-90
        "
            >
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-base sm:text-xl font-semibold tracking-tight">
                        Adjust Profile Picture
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                        Drag to position, scroll or slide to zoom and rotate.
                    </DialogDescription>
                </DialogHeader>

                {/* Cropper Viewport Area (Clean & tight layout) */}
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

                {/* Control Sliders & Quick Buttons */}
                <div className="space-y-3 py-1">
                    {/* Zoom Controls */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5">
                                <ZoomIn className="h-3.5 w-3.5" /> Zoom
                            </span>
                            <span className="font-mono text-[11px]">{Math.round(zoom * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 rounded-lg cursor-pointer transition-all active:scale-90 hover:bg-muted"
                                onClick={() => setZoom((prev) => Math.max(1, prev - 0.2))}
                                disabled={zoom <= 1 || isUploading}
                            >
                                <ZoomOut className="h-3.5 w-3.5" />
                            </Button>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.05}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                disabled={isUploading}
                                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary transition-opacity hover:opacity-100 opacity-90"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 rounded-lg cursor-pointer transition-all active:scale-90 hover:bg-muted"
                                onClick={() => setZoom((prev) => Math.min(3, prev + 0.2))}
                                disabled={zoom >= 3 || isUploading}
                            >
                                <ZoomIn className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>

                    {/* Rotation Controls */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5">
                                <RotateCw className="h-3.5 w-3.5" /> Rotation
                            </span>
                            {/* Formatted to 2 decimal places */}
                            <span className="font-mono text-[11px]">{Number(rotation).toFixed(2)}°</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 rounded-lg cursor-pointer transition-all active:scale-90 hover:bg-muted"
                                onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                                disabled={isUploading}
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
                                disabled={isUploading}
                                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary transition-opacity hover:opacity-100 opacity-90"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 rounded-lg cursor-pointer transition-all active:scale-90 hover:bg-muted"
                                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                                disabled={isUploading}
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
                        disabled={isUploading || (zoom === 1 && rotation === 0 && crop.x === 0 && crop.y === 0)}
                        className="text-xs gap-1.5 text-muted-foreground hover:text-foreground rounded-xl cursor-pointer transition-all active:scale-95 px-3 py-2"
                    >
                        <RefreshCw className="h-3.5 w-3.5" /> Reset
                    </Button>

                    <div className="flex gap-2.5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isUploading}
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
                            disabled={isUploading}
                            className="
                h-8 px-4 py-2.5 rounded-xl text-xs sm:text-sm gap-2 font-medium cursor-pointer transition-all active:scale-95 shadow-sm hover:shadow
              "
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Uploading...
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