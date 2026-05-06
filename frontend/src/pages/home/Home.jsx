import { useEffect, useRef, useState } from "react";

// ─── Parallax Hook ───────────────────────────────────────────────────────────
function useParallax() {
    const [scrollY, setScrollY] = useState(0);
    useEffect(() => {
        const onScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    return scrollY;
}

// ─── Animated Counter ────────────────────────────────────────────────────────
function Counter({ end, suffix = "" }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    let start = 0;
                    const duration = 1800;
                    const step = (end / duration) * 16;
                    const timer = setInterval(() => {
                        start += step;
                        if (start >= end) { setCount(end); clearInterval(timer); }
                        else setCount(Math.floor(start));
                    }, 16);
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end]);
    return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Features Data ───────────────────────────────────────────────────────────
const features = [
    {
        icon: "◈",
        title: "Customer Management",
        desc: "Store and organise all your clients in one unified workspace — name, phone, tags like lead or client, all at your fingertips.",
        accent: "#C8A96E",
    },
    {
        icon: "⏱",
        title: "Follow-up Reminders",
        desc: "Set reminders for calls, messages, or meetings. Never miss a follow-up again with a clear view of today's and overdue tasks.",
        accent: "#8B9E6E",
    },
    {
        icon: "◎",
        title: "Notes & Timeline",
        desc: "Keep a structured interaction history per customer — what was discussed, their current status, next steps.",
        accent: "#6E8B9E",
    },
    {
        icon: "⚡",
        title: "WhatsApp Quick Action",
        desc: "One click opens WhatsApp with a pre-written follow-up. Fast, personal, and consistent messaging every time.",
        accent: "#9E6E8B",
    },
    {
        icon: "◉",
        title: "Focused Dashboard",
        desc: "A clean command centre: today's follow-ups, missed actions, and quick-add options — no noise, only signal.",
        accent: "#6E9E8B",
    },
    {
        icon: "✦",
        title: "Calendar & Meetings",
        desc: "Pro feature: schedule meetings, sync with Google Calendar, and generate meeting links — all from one place.",
        accent: "#9E8B6E",
    },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
const testimonials = [
    {
        quote: "We went from losing 3–4 leads a week to closing them. The follow-up reminders alone paid for the subscription in the first month.",
        name: "Arjun Mehta",
        role: "Founder, Mehta Distributors",
        initials: "AM",
    },
    {
        quote: "Finally a CRM that doesn't need a manual. My team was up and running in an afternoon. Feels like it was built for how we actually work.",
        name: "Priya Sharma",
        role: "Director, PS Consulting",
        initials: "PS",
    },
    {
        quote: "The WhatsApp quick action is a game changer. I used to copy-paste the same message 20 times a day. Now it's one click.",
        name: "Rahul Kapoor",
        role: "Freelance Designer",
        initials: "RK",
    },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export const Home = () => {
    const scrollY = useParallax();
    const [hoveredFeature, setHoveredFeature] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div
            style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                backgroundColor: "#0D0D0D",
                color: "#E8E2D9",
                overflowX: "hidden",
            }}
        >
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=Neue+Haas+Grotesk+Display+Pro:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --gold: #C8A96E;
          --gold-dim: rgba(200,169,110,0.15);
          --surface: #141414;
          --surface-2: #1A1A1A;
          --surface-3: #202020;
          --border: rgba(255,255,255,0.07);
          --text-muted: #6B6560;
          --text-dim: #9E9790;
        }

        html { scroll-behavior: smooth; }

        .mono { font-family: 'DM Mono', 'Courier New', monospace; }

        /* NAV */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 20px 48px;
          display: flex; align-items: center; justify-content: space-between;
          background: linear-gradient(to bottom, rgba(13,13,13,0.95) 0%, transparent 100%);
          backdrop-filter: blur(2px);
        }
        .nav-logo {
          font-size: 15px; letter-spacing: 0.3em; text-transform: uppercase;
          color: var(--gold); font-family: 'DM Mono', monospace; font-weight: 500;
        }
        .nav-links { display: flex; gap: 40px; align-items: center; }
        .nav-link {
          font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--text-dim); text-decoration: none;
          transition: color 0.3s;
        }
        .nav-link:hover { color: #E8E2D9; }
        .nav-cta {
          font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.2em;
          text-transform: uppercase; padding: 10px 22px;
          border: 1px solid var(--gold); color: var(--gold);
          background: transparent; cursor: pointer; transition: all 0.3s;
          text-decoration: none;
        }
        .nav-cta:hover { background: var(--gold); color: #0D0D0D; }

        /* HERO */
        .hero {
          position: relative; height: 100vh; min-height: 700px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; overflow: hidden;
        }

        /* Layer 0 — background image */
        .hero-bg-layer {
          position: absolute; inset: -15%; z-index: 0;
          background-size: cover; background-position: center;
          will-change: transform;
        }

        /* Layer 1 — dark vignette overlay */
        .hero-overlay {
          position: absolute; inset: 0; z-index: 1;
          background:
            radial-gradient(ellipse 80% 60% at 50% 60%, transparent 0%, rgba(13,13,13,0.85) 100%),
            linear-gradient(to bottom, rgba(13,13,13,0.6) 0%, rgba(13,13,13,0.3) 40%, rgba(13,13,13,0.8) 85%, #0D0D0D 100%);
        }

        /* Layer 2 — mid decorative ring */
        .hero-ring {
          position: absolute; z-index: 2;
          width: 520px; height: 520px;
          border-radius: 50%;
          border: 1px solid rgba(200,169,110,0.12);
          box-shadow: 0 0 80px rgba(200,169,110,0.04), inset 0 0 80px rgba(200,169,110,0.02);
          will-change: transform;
          pointer-events: none;
        }

        /* Layer 3 — text content */
        .hero-content {
          position: relative; z-index: 3;
          max-width: 800px; padding: 0 24px;
          will-change: transform;
        }

        .hero-eyebrow {
          font-family: 'DM Mono', monospace; font-size: 11px;
          letter-spacing: 0.4em; text-transform: uppercase;
          color: var(--gold); margin-bottom: 28px;
          opacity: 0; animation: fadeUp 1s ease 0.3s forwards;
        }

        .hero-title {
          font-size: clamp(44px, 7vw, 88px); line-height: 1.0;
          font-weight: 400; letter-spacing: -0.02em;
          margin-bottom: 28px;
          opacity: 0; animation: fadeUp 1s ease 0.5s forwards;
        }

        .hero-title em {
          font-style: italic; color: var(--gold);
        }

        .hero-subtitle {
          font-family: 'DM Mono', monospace; font-size: 14px;
          line-height: 1.8; color: var(--text-dim);
          max-width: 520px; margin: 0 auto 44px;
          font-weight: 300; letter-spacing: 0.02em;
          opacity: 0; animation: fadeUp 1s ease 0.7s forwards;
        }

        .hero-actions {
          display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
          opacity: 0; animation: fadeUp 1s ease 0.9s forwards;
        }

        .btn-primary {
          padding: 14px 36px; background: var(--gold); color: #0D0D0D;
          font-family: 'DM Mono', monospace; font-size: 11px;
          letter-spacing: 0.25em; text-transform: uppercase;
          border: none; cursor: pointer;
          transition: all 0.3s; text-decoration: none; display: inline-block;
        }
        .btn-primary:hover { background: #E0C285; transform: translateY(-2px); }

        .btn-secondary {
          padding: 14px 36px; background: transparent;
          border: 1px solid rgba(232,226,217,0.25); color: #E8E2D9;
          font-family: 'DM Mono', monospace; font-size: 11px;
          letter-spacing: 0.25em; text-transform: uppercase;
          cursor: pointer; transition: all 0.3s; text-decoration: none; display: inline-block;
        }
        .btn-secondary:hover { border-color: rgba(232,226,217,0.6); transform: translateY(-2px); }

        .hero-scroll-hint {
          position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
          z-index: 3; display: flex; flex-direction: column; align-items: center; gap: 8px;
          opacity: 0; animation: fadeIn 1s ease 1.4s forwards;
        }
        .scroll-line {
          width: 1px; height: 48px;
          background: linear-gradient(to bottom, var(--gold), transparent);
          animation: scrollPulse 2s ease infinite;
        }
        .scroll-label {
          font-family: 'DM Mono', monospace; font-size: 9px;
          letter-spacing: 0.3em; text-transform: uppercase; color: var(--text-muted);
        }

        /* SECTIONS */
        section { position: relative; }

        /* STATS BAR */
        .stats-bar {
          background: var(--surface); border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 40px 0;
        }
        .stats-inner {
          max-width: 1100px; margin: 0 auto; padding: 0 48px;
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }
        .stat-item {
          text-align: center; padding: 0 24px;
          border-right: 1px solid var(--border);
        }
        .stat-item:last-child { border-right: none; }
        .stat-number {
          font-size: 40px; color: var(--gold); letter-spacing: -0.03em;
          display: block; margin-bottom: 6px;
        }
        .stat-label {
          font-family: 'DM Mono', monospace; font-size: 11px;
          letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-muted);
        }

        /* SECTION HEADER */
        .section-header {
          max-width: 1100px; margin: 0 auto; padding: 100px 48px 60px;
        }
        .section-tag {
          font-family: 'DM Mono', monospace; font-size: 10px;
          letter-spacing: 0.4em; text-transform: uppercase;
          color: var(--gold); margin-bottom: 18px; display: block;
        }
        .section-title {
          font-size: clamp(32px, 4vw, 52px); line-height: 1.1;
          font-weight: 400; letter-spacing: -0.02em; max-width: 600px;
        }
        .section-title em { font-style: italic; color: var(--gold); }

        /* FEATURES GRID */
        .features-grid {
          max-width: 1100px; margin: 0 auto; padding: 0 48px 100px;
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
          background: var(--border);
        }
        .feature-card {
          background: var(--surface); padding: 48px 40px;
          transition: background 0.4s; cursor: default; position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, var(--card-accent, rgba(200,169,110,0.04)) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.4s;
        }
        .feature-card:hover { background: var(--surface-2); }
        .feature-card:hover::before { opacity: 1; }
        .feature-icon {
          font-size: 24px; margin-bottom: 24px; display: block;
          transition: transform 0.3s;
        }
        .feature-card:hover .feature-icon { transform: scale(1.15); }
        .feature-name {
          font-size: 20px; margin-bottom: 14px; letter-spacing: -0.01em;
        }
        .feature-desc {
          font-family: 'DM Mono', monospace; font-size: 12.5px;
          line-height: 1.85; color: var(--text-dim); font-weight: 300;
        }
        .feature-bar {
          position: absolute; bottom: 0; left: 0;
          height: 2px; width: 0; transition: width 0.5s ease;
        }
        .feature-card:hover .feature-bar { width: 100%; }

        /* HOW IT WORKS */
        .how-section {
          background: var(--surface); border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .how-inner {
          max-width: 1100px; margin: 0 auto; padding: 100px 48px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
        }
        .how-steps { display: flex; flex-direction: column; gap: 0; }
        .how-step {
          display: flex; gap: 28px; padding: 32px 0;
          border-bottom: 1px solid var(--border);
          transition: all 0.3s;
        }
        .how-step:first-child { padding-top: 0; }
        .how-step:last-child { border-bottom: none; }
        .step-num {
          font-family: 'DM Mono', monospace; font-size: 11px;
          color: var(--gold); letter-spacing: 0.1em; flex-shrink: 0;
          padding-top: 4px;
        }
        .step-content {}
        .step-title { font-size: 18px; margin-bottom: 8px; letter-spacing: -0.01em; }
        .step-desc {
          font-family: 'DM Mono', monospace; font-size: 12px;
          line-height: 1.75; color: var(--text-dim); font-weight: 300;
        }

        /* mock dashboard */
        .mock-dashboard {
          background: var(--surface-3); border: 1px solid var(--border);
          padding: 28px; position: relative; overflow: hidden;
        }
        .mock-dashboard::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(to right, transparent, var(--gold), transparent);
        }
        .mock-topbar {
          display: flex; align-items: center; gap: 8px; margin-bottom: 22px;
        }
        .mock-dot { width: 8px; height: 8px; border-radius: 50%; }
        .mock-title {
          font-family: 'DM Mono', monospace; font-size: 10px;
          letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-muted);
          margin-left: auto;
        }
        .mock-row {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; margin-bottom: 6px;
          border: 1px solid var(--border); background: var(--surface-2);
          transition: border-color 0.3s;
        }
        .mock-row:hover { border-color: rgba(200,169,110,0.3); }
        .mock-status {
          width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
        }
        .mock-name {
          font-family: 'DM Mono', monospace; font-size: 11px;
          color: #E8E2D9; flex: 1;
        }
        .mock-tag {
          font-family: 'DM Mono', monospace; font-size: 9px;
          letter-spacing: 0.15em; text-transform: uppercase;
          padding: 3px 8px; border: 1px solid;
        }
        .mock-time {
          font-family: 'DM Mono', monospace; font-size: 9px; color: var(--text-muted);
        }
        .mock-wa-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; background: transparent;
          border: 1px solid rgba(37,211,102,0.3); color: rgba(37,211,102,0.7);
          font-family: 'DM Mono', monospace; font-size: 9px;
          letter-spacing: 0.15em; text-transform: uppercase;
          cursor: pointer; transition: all 0.3s; margin-top: 14px;
        }
        .mock-wa-btn:hover { background: rgba(37,211,102,0.08); border-color: rgba(37,211,102,0.6); }

        /* TESTIMONIALS */
        .testimonials-section { padding: 100px 0; }
        .testimonials-inner {
          max-width: 1100px; margin: 0 auto; padding: 0 48px;
        }
        .testimonials-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
          background: var(--border); margin-top: 60px;
        }
        .testimonial-card {
          background: var(--surface); padding: 44px 36px;
          position: relative; overflow: hidden;
        }
        .testimonial-card::after {
          content: 'C'; position: absolute; top: 20px; right: 24px;
          font-size: 80px; color: rgba(200,169,110,0.08); line-height: 1;
          font-family: Georgia, serif;
        }
        .testimonial-quote {
          font-family: 'DM Mono', monospace; font-size: 12.5px;
          line-height: 1.9; color: var(--text-dim); font-weight: 300;
          margin-bottom: 32px; font-style: italic;
        }
        .testimonial-author { display: flex; align-items: center; gap: 14px; }
        .author-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: var(--gold-dim); border: 1px solid rgba(200,169,110,0.3);
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Mono', monospace; font-size: 10px; color: var(--gold);
          flex-shrink: 0;
        }
        .author-name { font-size: 14px; margin-bottom: 2px; letter-spacing: -0.01em; }
        .author-role {
          font-family: 'DM Mono', monospace; font-size: 10px;
          color: var(--text-muted); letter-spacing: 0.1em;
        }

        /* CTA SECTION */
        .cta-section {
          padding: 120px 48px;
          text-align: center; position: relative; overflow: hidden;
        }
        .cta-section::before {
          content: ''; position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(200,169,110,0.05) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-title {
          font-size: clamp(36px, 5vw, 68px); line-height: 1.05;
          letter-spacing: -0.02em; max-width: 700px; margin: 0 auto 20px;
        }
        .cta-title em { font-style: italic; color: var(--gold); }
        .cta-sub {
          font-family: 'DM Mono', monospace; font-size: 13px;
          color: var(--text-muted); margin-bottom: 44px; letter-spacing: 0.05em;
        }
        .cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

        /* FOOTER */
        .footer {
          border-top: 1px solid var(--border); padding: 48px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 24px;
          background: var(--surface);
        }
        .footer-logo {
          font-family: 'DM Mono', monospace; font-size: 13px;
          letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold);
        }
        .footer-links { display: flex; gap: 32px; }
        .footer-link {
          font-family: 'DM Mono', monospace; font-size: 10px;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--text-muted); text-decoration: none; transition: color 0.3s;
        }
        .footer-link:hover { color: #E8E2D9; }
        .footer-copy {
          font-family: 'DM Mono', monospace; font-size: 10px;
          color: var(--text-muted); letter-spacing: 0.1em;
        }

        /* KEYFRAMES */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes scrollPulse {
          0%,100% { opacity: 0.4; } 50% { opacity: 1; }
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .nav { padding: 16px 24px; }
          .nav-links { display: none; }
          .features-grid { grid-template-columns: 1fr; }
          .how-inner { grid-template-columns: 1fr; gap: 48px; }
          .testimonials-grid { grid-template-columns: 1fr; }
          .stats-inner { grid-template-columns: repeat(2, 1fr); }
          .stat-item { border-right: none; border-bottom: 1px solid var(--border); padding: 20px; }
          .stat-item:nth-child(2n) { border-right: none; }
          .footer { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

            <nav className="nav">
                <span className="nav-logo mono">FollowUp</span>
                <div className="nav-links">
                    <a href="#features" className="nav-link">Features</a>
                    <a href="#how" className="nav-link">How it works</a>
                    <a href="#testimonials" className="nav-link">Reviews</a>
                    <a href="/login" className="nav-cta">Start free</a>
                </div>
            </nav>

            <section className="hero">

              

                {/* Layer 1 — overlay */}
                <div className="hero-overlay" />

                {/* Layer 2 — decorative ring (mid depth) */}
                <div
                    className="hero-ring"
                    style={{ transform: `translateY(${scrollY * 0.2}px)` }}
                />

                {/* Layer 3 — text (fastest, nearest) */}
                <div
                    className="hero-content"
                    style={{ transform: `translateY(${scrollY * 0.08}px)` }}
                >
                    <p className="hero-eyebrow mono">B2B Follow-Up Management</p>
                    <h1 className="hero-title">
                        Never miss a<br /><em>follow-up</em><br />again.
                    </h1>
                    <p className="hero-subtitle mono">
                        A lightweight action-driven system for small businesses, freelancers, and service providers — track every lead, reminder, and conversation in one place.
                    </p>
                    <div className="hero-actions">
                        <a href="#cta" className="btn-primary">Start for free</a>
                        <a href="#features" className="btn-secondary">See how it works</a>
                    </div>
                </div>

                {/* scroll indicator */}
                <div className="hero-scroll-hint">
                    <div className="scroll-line" />
                    <span className="scroll-label mono">scroll</span>
                </div>
            </section>

            {/* ── STATS BAR ────────────────────────────────── */}
            <section className="stats-bar">
                <div className="stats-inner">
                    {[
                        { num: 2400, suffix: "+", label: "Businesses onboarded" },
                        { num: 98, suffix: "%", label: "Follow-up accuracy" },
                        { num: 3, suffix: "×", label: "More leads converted" },
                        { num: 40, suffix: "%", label: "Time saved weekly" },
                    ].map((s) => (
                        <div key={s.label} className="stat-item">
                            <span className="stat-number">
                                <Counter end={s.num} suffix={s.suffix} />
                            </span>
                            <span className="stat-label mono">{s.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FEATURES ─────────────────────────────────── */}
            <section id="features">
                <div className="section-header">
                    <span className="section-tag mono">Modules</span>
                    <h2 className="section-title">
                        Everything you need,<br /><em>nothing you don't.</em>
                    </h2>
                </div>
                <div className="features-grid">
                    {features.map((f, i) => (
                        <div
                            key={f.title}
                            className="feature-card"
                            style={{ "--card-accent": `${f.accent}18` }}
                            onMouseEnter={() => setHoveredFeature(i)}
                            onMouseLeave={() => setHoveredFeature(null)}
                        >
                            <span className="feature-icon" style={{ color: f.accent }}>{f.icon}</span>
                            <h3 className="feature-name">{f.title}</h3>
                            <p className="feature-desc mono">{f.desc}</p>
                            <div
                                className="feature-bar"
                                style={{ background: `linear-gradient(to right, ${f.accent}, transparent)` }}
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* ── HOW IT WORKS ──────────────────────────────── */}
            <section id="how" className="how-section">
                <div className="how-inner">
                    {/* Steps */}
                    <div>
                        <span className="section-tag mono">How it works</span>
                        <h2 className="section-title" style={{ marginBottom: 48 }}>
                            From chaos to<br /><em>clarity</em> in minutes.
                        </h2>
                        <div className="how-steps">
                            {[
                                { n: "01", title: "Add your customers", desc: "Import or add clients with name, phone, and tags. Takes seconds, not hours." },
                                { n: "02", title: "Log every interaction", desc: "Note what was discussed, set a status, and attach the next action to every contact." },
                                { n: "03", title: "Get reminded, take action", desc: "Your dashboard surfaces today's follow-ups. One click sends a WhatsApp message." },
                                { n: "04", title: "Convert leads, grow revenue", desc: "Structured follow-ups mean fewer leaks in your pipeline and more closed deals." },
                            ].map((step) => (
                                <div key={step.n} className="how-step">
                                    <span className="step-num mono">{step.n}</span>
                                    <div className="step-content">
                                        <h4 className="step-title">{step.title}</h4>
                                        <p className="step-desc mono">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mock Dashboard */}
                    <div className="mock-dashboard">
                        <div className="mock-topbar">
                            <div className="mock-dot" style={{ background: "#FF5F57" }} />
                            <div className="mock-dot" style={{ background: "#FEBC2E" }} />
                            <div className="mock-dot" style={{ background: "#28C840" }} />
                            <span className="mock-title mono">Today's Follow-ups · 4 pending</span>
                        </div>

                        {[
                            { name: "Arjun — Mehta Dist.", tag: "Lead", tagColor: "#C8A96E", status: "#C8A96E", time: "10:00 AM" },
                            { name: "Priya — PS Consult.", tag: "Client", tagColor: "#6E9E8B", status: "#6E9E8B", time: "11:30 AM" },
                            { name: "Rahul Kapoor", tag: "Lead", tagColor: "#C8A96E", status: "#FF5F57", time: "Overdue" },
                            { name: "Sneha — DigitalArts", tag: "Client", tagColor: "#6E9E8B", status: "#6E9E8B", time: "2:00 PM" },
                        ].map((r) => (
                            <div key={r.name} className="mock-row">
                                <div className="mock-status" style={{ background: r.status }} />
                                <span className="mock-name mono">{r.name}</span>
                                <span className="mock-tag mono" style={{ color: r.tagColor, borderColor: `${r.tagColor}44` }}>{r.tag}</span>
                                <span className="mock-time mono" style={{ color: r.time === "Overdue" ? "#FF5F57" : undefined }}>{r.time}</span>
                            </div>
                        ))}

                        <button className="mock-wa-btn mono">
                            <span>◎</span> Open WhatsApp
                        </button>
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ──────────────────────────────── */}
            <section id="testimonials" className="testimonials-section">
                <div className="testimonials-inner">
                    <span className="section-tag mono">Reviews</span>
                    <h2 className="section-title">
                        Trusted by businesses<br /><em>like yours.</em>
                    </h2>
                    <div className="testimonials-grid">
                        {testimonials.map((t) => (
                            <div key={t.name} className="testimonial-card">
                                <p className="testimonial-quote mono">"{t.quote}"</p>
                                <div className="testimonial-author">
                                    <div className="author-avatar mono">{t.initials}</div>
                                    <div>
                                        <p className="author-name">{t.name}</p>
                                        <p className="author-role mono">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────────── */}
            <section id="cta" className="cta-section">
                <span className="section-tag mono" style={{ display: "block", marginBottom: 20 }}>Get started</span>
                <h2 className="cta-title">
                    Stop losing leads.<br /><em>Start following up.</em>
                </h2>
                <p className="cta-sub mono">Free to start · No credit card required · Setup in under 5 minutes</p>
                <div className="cta-actions">
                    <button className="btn-primary">Create free account</button>
                    <button className="btn-secondary">View pricing</button>
                </div>
            </section>

            {/* ── FOOTER ────────────────────────────────────── */}
            <footer className="footer">
                <span className="footer-logo mono">FollowUp</span>
                <div className="footer-links">
                    {["Privacy", "Terms", "Support", "Blog"].map((l) => (
                        <a key={l} href="#" className="footer-link mono">{l}</a>
                    ))}
                </div>
                <span className="footer-copy mono">© 2025 FollowUp Inc. All rights reserved.</span>
            </footer>
        </div>
    );
}