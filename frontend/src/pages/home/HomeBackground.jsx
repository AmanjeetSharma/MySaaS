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

            {/* Dark gradient fades for header / hero / footer readability and near-black depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/80 via-[#000000]/60 to-[#000000]/95" />
        </div>
    );
};
