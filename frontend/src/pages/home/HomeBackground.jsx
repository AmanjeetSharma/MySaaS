import homeBg from "@/assets/animations/home-bg1.webm";

export const HomeBackground = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none w-screen h-screen overflow-hidden select-none">
            {/* Full-screen background video */}
            <video
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                aria-hidden="true"
            >
                <source src={homeBg} type="video/webm" />
            </video>

            {/* Subtle blur to blend the animation */}
            <div className="absolute inset-0 backdrop-blur-[5px]" />

            {/* Gradient fades for header / hero / footer readability and depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/65 to-background/95" />
        </div>
    );
};
