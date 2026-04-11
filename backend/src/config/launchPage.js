// launchPage.js
const launchPage = (name = 'Your') => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name.charAt(0).toUpperCase() + name.slice(1)}-Service Launched Successfully</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #0f172a; /* slate-950 */
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #e2e8f0; /* slate-200 */
            overflow: hidden;
            position: relative;
        }

        /* Particle background */
        #particles-js {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: 0;
        }

        .container {
            text-align: center;
            padding: 3rem;
            background: rgba(15, 23, 42, 0.7); /* slate-950 with opacity */
            backdrop-filter: blur(16px);
            border-radius: 24px;
            box-shadow: 
                0 0 0 1px rgba(255, 255, 255, 0.05),
                0 25px 50px -12px rgba(0, 0, 0, 0.5);
            max-width: 640px;
            margin: 2rem;
            position: relative;
            z-index: 1;
            border: 1px solid rgba(255, 255, 255, 0.05);
            transform: translateY(20px);
            opacity: 0;
        }

        .success-icon {
            font-size: 5rem;
            margin-bottom: 2rem;
            display: inline-block;
            filter: drop-shadow(0 0 10px rgba(96, 165, 250, 0.5));
            animation: float 6s ease-in-out infinite, glow 2s ease-in-out infinite alternate;
        }

        h1 {
            font-size: 3.5rem;
            margin-bottom: 1.5rem;
            font-weight: 800;
            background: linear-gradient(to right, #e2e8f0, #94a3b8);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            letter-spacing: -0.025em;
        }

        .service-name {
            background: linear-gradient(135deg, #60a5fa, #a78bfa);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            display: inline-block;
        }

        p {
            font-size: 1.25rem;
            margin-bottom: 2.5rem;
            line-height: 1.6;
            opacity: 0.85;
            font-weight: 300;
        }

        .status {
            background: linear-gradient(135deg, rgba(30, 64, 175, 0.4), rgba(76, 29, 149, 0.4));
            padding: 1rem 2rem;
            border-radius: 50px;
            display: inline-flex;
            align-items: center;
            margin: 1.5rem 0;
            font-weight: 600;
            letter-spacing: 0.05em;
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(96, 165, 250, 0.2);
            box-shadow: 0 0 20px rgba(96, 165, 250, 0.2);
        }

        .status::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
                to bottom right,
                rgba(255, 255, 255, 0.1),
                rgba(255, 255, 255, 0.01)
            );
            transform: rotate(45deg);
            z-index: -1;
        }

        .status-dot {
            width: 12px;
            height: 12px;
            background: #4ade80; /* green-400 */
            border-radius: 50%;
            margin-right: 12px;
            box-shadow: 0 0 10px #4ade80;
            animation: pulse 2s infinite;
        }

        .tech-stack {
            margin-top: 2.5rem;
            opacity: 0.7;
            font-size: 0.95rem;
            letter-spacing: 0.05em;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .tech-pill {
            background: rgba(30, 41, 59, 0.5); /* slate-800 */
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.85rem;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        /* Rocket flame animation */
        .rocket-flame {
            position: absolute;
            bottom: -15px;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 40px;
            background: linear-gradient(to top, transparent, #60a5fa, #3b82f6, #6366f1);
            border-radius: 50% 50% 0 0;
            filter: blur(4px);
            opacity: 0.8;
            animation: flame 1.5s ease-in-out infinite alternate;
        }

        .rocket-container {
            position: relative;
            display: inline-block;
        }

        /* Animations */
        @keyframes float {
            0%, 100% {
                transform: translateY(0) rotate(0deg);
            }
            25% {
                transform: translateY(-8px) rotate(2deg);
            }
            50% {
                transform: translateY(-4px) rotate(-2deg);
            }
            75% {
                transform: translateY(-12px) rotate(1deg);
            }
        }

        @keyframes flame {
            0% {
                height: 40px;
                opacity: 0.8;
                filter: blur(4px);
            }
            100% {
                height: 60px;
                opacity: 1;
                filter: blur(6px);
            }
        }

        @keyframes glow {
            0% {
                filter: drop-shadow(0 0 10px rgba(96, 165, 250, 0.5));
            }
            100% {
                filter: drop-shadow(0 0 20px rgba(96, 165, 250, 0.8));
            }
        }

        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
                transform: scale(0.95);
            }
            70% {
                box-shadow: 0 0 0 12px rgba(74, 222, 128, 0);
                transform: scale(1);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
                transform: scale(0.95);
            }
        }

        @keyframes containerEntrance {
            0% {
                opacity: 0;
                transform: translateY(20px) scale(0.95);
            }
            100% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        @media (max-width: 768px) {
            .container {
                padding: 2.5rem 1.5rem;
                margin: 1rem;
            }
            
            h1 {
                font-size: 2.75rem;
            }
            
            .success-icon {
                font-size: 4rem;
            }
        }
    </style>
</head>
<body>
    <div id="particles-js"></div>
    
    <div class="container">
        <div class="rocket-container">
            <div class="success-icon">🚀</div>
            <div class="rocket-flame"></div>
        </div>
        <h1>
            <span class="service-name">${name.charAt(0).toUpperCase() + name.slice(1)}</span>-Service is Live!
        </h1>
        <p>Your ${name.toLowerCase()} service is running successfully and ready to handle requests.</p>

        <div class="status">
            <div class="status-dot"></div>
            LIVE & RUNNING
        </div>
        
        <div class="tech-stack">
            <span class="tech-pill">Node.js</span>
            <span class="tech-pill">Express</span>
            <span class="tech-pill">Modern Web Technologies</span>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
    <script>
        // Initialize particles.js
        document.addEventListener('DOMContentLoaded', function() {
            particlesJS('particles-js', {
                particles: {
                    number: { value: 80, density: { enable: true, value_area: 800 } },
                    color: { value: "#60a5fa" },
                    shape: { type: "circle" },
                    opacity: {
                        value: 0.3,
                        random: true,
                        anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false }
                    },
                    size: {
                        value: 3,
                        random: true,
                        anim: { enable: true, speed: 2, size_min: 0.3, sync: false }
                    },
                    line_linked: {
                        enable: true,
                        distance: 150,
                        color: "#60a5fa",
                        opacity: 0.1,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: 1,
                        direction: "none",
                        random: true,
                        straight: false,
                        out_mode: "out",
                        bounce: false,
                        attract: { enable: false, rotateX: 600, rotateY: 1200 }
                    }
                },
                interactivity: {
                    detect_on: "canvas",
                    events: {
                        onhover: { enable: true, mode: "grab" },
                        onclick: { enable: true, mode: "push" },
                        resize: true
                    },
                    modes: {
                        grab: { distance: 140, line_linked: { opacity: 0.5 } },
                        push: { particles_nb: 4 }
                    }
                },
                retina_detect: true
            });

            // Container entrance animation
            const container = document.querySelector('.container');
            container.style.animation = 'containerEntrance 1s ease forwards';
            
            // Add subtle mouse move tilt effect
            document.addEventListener('mousemove', function(e) {
                const x = (window.innerWidth / 2 - e.clientX) / 25;
                const y = (window.innerHeight / 2 - e.clientY) / 25;
                
            });
        });
    </script>
</body>
</html>
`;

export default launchPage;