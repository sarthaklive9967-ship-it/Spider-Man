import { useEffect, useRef, useState, useCallback } from "react";
import "./index.css";

/* ═══════════════════════════════════════════════════
   SOUND ENGINE — Web Audio API, no external files
════════════════════════════════════════════════════ */
class SoundEngine {
  private ctx: AudioContext | null = null;
  muted = true; // start muted, unmute after first interaction

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  click() {
    if (this.muted) return;
    const ctx = this.getCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.setValueAtTime(1200, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    o.start(); o.stop(ctx.currentTime + 0.12);
  }

  menuOpen() {
    if (this.muted) return;
    const ctx = this.getCtx();
    [600, 800, 1000].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq;
      const t = ctx.currentTime + i * 0.07;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.06, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.start(t); o.stop(t + 0.2);
    });
  }

  loaderDone() {
    if (this.muted) return;
    const ctx = this.getCtx();
    [440, 550, 660, 880].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq;
      const t = ctx.currentTime + i * 0.1;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.07, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      o.start(t); o.stop(t + 0.45);
    });
  }
}

const sfx = new SoundEngine();

/* ═══════════════════════════════════════════════════
   WEB-LINE CANVAS BACKGROUND
════════════════════════════════════════════════════ */
function WebLineBG() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const isMobile = window.innerWidth < 600;
    const count = isMobile ? 30 : 55;

    const pts = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.4 + 0.4,
      isRed: Math.random() > 0.55,
    }));

    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // web lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxD = isMobile ? 90 : 110;
          if (dist < maxD) {
            const alpha = 0.07 * (1 - dist / maxD);
            const color = pts[i].isRed && pts[j].isRed ? `rgba(230,57,70,${alpha})` : `rgba(59,130,246,${alpha * 0.8})`;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
        // dot
        ctx.beginPath();
        ctx.arc(pts[i].x, pts[i].y, pts[i].r, 0, Math.PI * 2);
        ctx.fillStyle = pts[i].isRed ? `rgba(230,57,70,0.55)` : `rgba(59,130,246,0.45)`;
        ctx.fill();

        pts[i].x += pts[i].vx;
        pts[i].y += pts[i].vy;
        if (pts[i].x < 0 || pts[i].x > canvas.width) pts[i].vx *= -1;
        if (pts[i].y < 0 || pts[i].y > canvas.height) pts[i].vy *= -1;
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} className="particle-bg" />;
}

/* ═══════════════════════════════════════════════════
   LOADING SCREEN
════════════════════════════════════════════════════ */
function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [fading, setFading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const pts = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.3 + 0.4,
      isRed: Math.random() > 0.5,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = pts[i].isRed ? `rgba(230,57,70,${0.08*(1-d/100)})` : `rgba(59,130,246,${0.07*(1-d/100)})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
        ctx.beginPath(); ctx.arc(pts[i].x, pts[i].y, pts[i].r, 0, Math.PI * 2);
        ctx.fillStyle = pts[i].isRed ? "rgba(230,57,70,0.6)" : "rgba(59,130,246,0.5)";
        ctx.fill();
        pts[i].x += pts[i].vx; pts[i].y += pts[i].vy;
        if (pts[i].x < 0 || pts[i].x > canvas.width) pts[i].vx *= -1;
        if (pts[i].y < 0 || pts[i].y > canvas.height) pts[i].vy *= -1;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  useEffect(() => {
    let cur = 0;
    const schedule = [
      { target: 28, delay: 0, speed: 25 },
      { target: 60, delay: 350, speed: 32 },
      { target: 85, delay: 800, speed: 48 },
      { target: 100, delay: 1200, speed: 30 },
    ];
    const timers: ReturnType<typeof setTimeout>[] = [];

    schedule.forEach(({ target, delay, speed }) => {
      const t = setTimeout(() => {
        const iv = setInterval(() => {
          cur += 1;
          setPct(cur);
          if (cur >= target) clearInterval(iv);
        }, speed);
        timers.push(iv as unknown as ReturnType<typeof setTimeout>);
      }, delay);
      timers.push(t);
    });

    const done = setTimeout(() => {
      sfx.loaderDone();
      setFading(true);
      setTimeout(onDone, 960);
    }, 2300);
    timers.push(done);

    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className={`loader-wrap ${fading ? "loader-fade" : ""}`}>
      <canvas ref={canvasRef} className="loader-canvas" />
      <div className="loader-orb loader-orb-1" />
      <div className="loader-orb loader-orb-2" />
      <div className="loader-orb loader-orb-3" />
      <div className="loader-content">
        <div className="loader-logo-wrap">
          <h1 className="loader-logo">Sound_APEX</h1>
          <div className="loader-logo-glow" />
        </div>
        <p className="loader-subtitle">Minecraft · Discord · Developer</p>
        <div className="loader-bar-wrap">
          <div className="loader-bar-bg">
            <div className="loader-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <span className="loader-pct">{pct}%</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   GLOBAL WEB BURST EFFECT
════════════════════════════════════════════════════ */
function useWebBurst() {
  useEffect(() => {
    const spawn = (x: number, y: number) => {
      const container = document.createElement("div");
      container.className = "touch-burst";
      container.style.left = `${x}px`;
      container.style.top = `${y}px`;

      const size = 60;
      const lineCount = 8;
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", String(size));
      svg.setAttribute("height", String(size));
      svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

      for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        const cx = size / 2, cy = size / 2;
        const len = 22 + Math.random() * 8;
        const x2 = cx + Math.cos(angle) * len;
        const y2 = cy + Math.sin(angle) * len;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", String(cx)); line.setAttribute("y1", String(cy));
        line.setAttribute("x2", String(x2)); line.setAttribute("y2", String(y2));
        line.setAttribute("stroke", i % 2 === 0 ? "rgba(230,57,70,0.75)" : "rgba(59,130,246,0.65)");
        line.setAttribute("stroke-width", "1.2");
        line.setAttribute("stroke-linecap", "round");
        svg.appendChild(line);
      }

      // center dot
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", String(size / 2)); circle.setAttribute("cy", String(size / 2));
      circle.setAttribute("r", "3");
      circle.setAttribute("fill", "rgba(230,57,70,0.8)");
      svg.appendChild(circle);

      container.appendChild(svg);
      document.body.appendChild(container);
      setTimeout(() => container.remove(), 700);
    };

    const onMouse = (e: MouseEvent) => spawn(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      Array.from(e.touches).forEach((t) => spawn(t.clientX, t.clientY));
    };

    window.addEventListener("click", onMouse);
    window.addEventListener("touchstart", onTouch, { passive: true });
    return () => {
      window.removeEventListener("click", onMouse);
      window.removeEventListener("touchstart", onTouch);
    };
  }, []);
}

/* ═══════════════════════════════════════════════════
   MAIN APP
════════════════════════════════════════════════════ */
function App() {
  const [loaded, setLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [muted, setMuted] = useState(true);

  useWebBurst();

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    sfx.muted = next;
    if (!next) sfx.click();
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("revealed"); }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [loaded]);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const openMenu = () => {
    setMobileOpen(true);
    sfx.menuOpen();
  };

  const closeMenu = () => setMobileOpen(false);

  const addRipple = useCallback((e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
    sfx.click();
    const btn = e.currentTarget;
    const circle = document.createElement("span");
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const cx = "touches" in e ? (e.touches[0]?.clientX ?? rect.left) : (e as React.MouseEvent).clientX;
    const cy = "touches" in e ? (e.touches[0]?.clientY ?? rect.top) : (e as React.MouseEvent).clientY;
    circle.style.cssText = `width:${size}px;height:${size}px;left:${cx - rect.left - size / 2}px;top:${cy - rect.top - size / 2}px;`;
    circle.classList.add("ripple");
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 700);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sfx.click();
    const btn = e.currentTarget.querySelector("button[type='submit']") as HTMLButtonElement;
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = "Message Sent ✓";
    btn.style.background = "linear-gradient(135deg,#10b981,#059669)";
    setTimeout(() => { btn.textContent = orig; btn.style.background = ""; (e.target as HTMLFormElement).reset(); }, 2600);
  };

  const NAV = [
    { label: "Home", id: "home" },
    { label: "About", id: "about" },
    { label: "Services", id: "services" },
    { label: "Projects", id: "projects" },
    { label: "Community", id: "community" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <>
      {!loaded && <LoadingScreen onDone={() => setLoaded(true)} />}

      {/* MUTE TOGGLE */}
      <button className="mute-btn" onClick={toggleMute} title={muted ? "Unmute sounds" : "Mute sounds"}>
        {muted ? "🔇" : "🔊"}
      </button>

      {/* ─── NAVBAR ─── */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          Sound_APEX
        </a>
        <ul className="nav-links">
          {NAV.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} onClick={(e) => { e.preventDefault(); scrollTo(item.id); }}>{item.label}</a>
            </li>
          ))}
          <li>
            <a href="https://discord.gg/BEEyA4TE4h" target="_blank" rel="noopener noreferrer" className="nav-cta">
              Join Discord
            </a>
          </li>
        </ul>
        <div className="hamburger" onClick={mobileOpen ? closeMenu : openMenu}>
          <span style={{ transform: mobileOpen ? "rotate(45deg) translate(5px,5px)" : "" }} />
          <span style={{ opacity: mobileOpen ? 0 : 1 }} />
          <span style={{ transform: mobileOpen ? "rotate(-45deg) translate(5px,-5px)" : "" }} />
        </div>
      </nav>

      {/* ─── MOBILE MENU ─── */}
      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
        {NAV.map((item) => (
          <a key={item.id} href={`#${item.id}`} onClick={(e) => { e.preventDefault(); scrollTo(item.id); }}>{item.label}</a>
        ))}
        <a href="https://discord.gg/BEEyA4TE4h" target="_blank" rel="noopener noreferrer"
          className="btn-primary ripple-btn" onMouseDown={addRipple} onTouchStart={addRipple}>
          Join Discord
        </a>
      </div>

      {/* ─── HERO ─── */}
      <section className="hero" id="home">
        <WebLineBG />
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>
        <div className="hero-content">
          <div className="hero-badge reveal">
            <span className="hero-badge-dot" />
            Minecraft · Discord · Developer
          </div>
          <p className="hero-subtitle-tag reveal reveal-delay-1">Premium Digital Studio</p>
          <h1 className="hero-title reveal reveal-delay-2">
            <span className="gradient-text">Sound_APEX</span>
          </h1>
          <p className="hero-desc reveal reveal-delay-3">
            Building premium Minecraft servers, custom plugins, resource packs, Discord communities, and powerful bots with a cinematic, futuristic edge.
          </p>
          <div className="hero-buttons reveal reveal-delay-4">
            <button className="btn-primary ripple-btn" onMouseDown={addRipple} onTouchStart={addRipple} onClick={() => scrollTo("services")}>
              Explore Services →
            </button>
            <a href="https://discord.gg/BEEyA4TE4h" target="_blank" rel="noopener noreferrer"
              className="btn-secondary ripple-btn" onMouseDown={addRipple} onTouchStart={addRipple}>
              Join Discord
            </a>
          </div>
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section className="about-section" id="about">
        <div className="container">
          <div className="about-grid">
            <div className="about-text-block">
              <div className="reveal">
                <span className="section-label">About Us</span>
                <h2 className="section-title">Crafted for the <span className="gradient-text">Elite</span></h2>
                <div className="divider" />
              </div>
              <p className="reveal reveal-delay-1">
                Sound_APEX is a premium digital studio specializing in Minecraft server architecture, custom plugin development, immersive resource packs, mods, and fully engineered Discord communities.
              </p>
              <p className="reveal reveal-delay-2">
                From high-performance SMP servers to powerful Discord bots — every project we deliver is built with precision, cinematic style, and zero compromise on quality.
              </p>
              <div className="reveal reveal-delay-3">
                <button className="btn-primary ripple-btn" style={{ marginTop: "8px" }}
                  onMouseDown={addRipple} onTouchStart={addRipple} onClick={() => scrollTo("services")}>
                  What We Build
                </button>
              </div>
            </div>
            <div className="about-stats">
              {[
                { n: "50+", l: "Servers Built" },
                { n: "30+", l: "Bots Deployed" },
                { n: "100+", l: "Plugins Written" },
                { n: "98%", l: "Client Satisfaction" },
              ].map((s, i) => (
                <div key={s.n} className={`stat-card tappable reveal reveal-delay-${i + 1}`}>
                  <div className="stat-number">{s.n}</div>
                  <div className="stat-label">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section className="services-section" id="services">
        <div className="container">
          <div style={{ textAlign: "center" }}>
            <span className="section-label reveal">What We Offer</span>
            <h2 className="section-title reveal reveal-delay-1">Premium <span className="gradient-text">Services</span></h2>
            <p className="section-subtitle reveal reveal-delay-2" style={{ margin: "0 auto" }}>
              Every project we take on is built with elite craftsmanship, clean code, and an uncompromising attention to detail.
            </p>
          </div>
          <div className="services-grid">
            {[
              { icon: "⛏️", title: "Minecraft Server Setup", desc: "Fully optimized Minecraft servers — SMP, survival, minigames, or custom gamemodes. Performance-tuned, anti-cheat ready, and player-ready from day one." },
              { icon: "🧩", title: "Custom Plugin Development", desc: "Bespoke Java plugins built from scratch — custom gameplay mechanics, admin tools, and integrations tailored precisely to your server's vision." },
              { icon: "🎨", title: "Mods & Resource Packs", desc: "Cinematic resource packs and mod configurations that give your server a unique visual identity your players will instantly recognize and love." },
              { icon: "💬", title: "Discord Server Design", desc: "Premium Discord communities with structured channels, custom roles, verification flows, branded embeds, and a professional aesthetic." },
              { icon: "🤖", title: "Discord Bot Development", desc: "Powerful custom bots — moderation, ticketing, leveling, economy, and more. Built clean, reliable, and tailored to your community." },
              { icon: "🚀", title: "Branding & Optimization", desc: "Full branding packages — logos, banners, server icons, MOTD styling — plus performance optimization so everything runs smooth at scale." },
            ].map((s, i) => (
              <div key={s.title} className={`service-card tappable reveal reveal-delay-${(i % 3) + 1}`}>
                <div className="service-icon">{s.icon}</div>
                <h3 className="service-title">{s.title}</h3>
                <p className="service-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROJECTS ─── */}
      <section className="projects-section" id="projects">
        <div className="container">
          <div style={{ textAlign: "center" }}>
            <span className="section-label reveal">Portfolio</span>
            <h2 className="section-title reveal reveal-delay-1">Featured <span className="gradient-text">Showcase</span></h2>
            <p className="section-subtitle reveal reveal-delay-2" style={{ margin: "0 auto" }}>
              A curated look at our most impressive Minecraft and Discord projects — built for creators and communities.
            </p>
          </div>
          <div className="projects-grid">
            {[
              { emoji: "⛏️", bg: "linear-gradient(135deg,#200a0a,#0d0a1a)", tag: "Minecraft", title: "Premium Minecraft SMP Server", desc: "Fully configured SMP with custom economy, land claiming, anti-cheat, and 50+ QoL plugins — running 200+ concurrent players with zero lag." },
              { emoji: "🧩", bg: "linear-gradient(135deg,#0a1a30,#0d0a1a)", tag: "Plugin", title: "Custom Plugin System", desc: "A modular Java plugin suite — custom crafting, player stats, seasonal events, and admin tools optimized for performance and scalability." },
              { emoji: "🎨", bg: "linear-gradient(135deg,#1a100a,#0d0a1a)", tag: "Resource Pack", title: "Stylish Resource Pack", desc: "A 32x premium resource pack overhaul — custom UI, unique textures, and a cohesive visual identity that makes the server feel cinematic." },
              { emoji: "💬", bg: "linear-gradient(135deg,#0a1a20,#0d0a1a)", tag: "Discord", title: "Full Discord Community Server", desc: "Professionally designed Discord with role systems, onboarding flows, reaction roles, structured channels, and a premium branded aesthetic." },
              { emoji: "🤖", bg: "linear-gradient(135deg,#200a10,#0d0a1a)", tag: "Bot", title: "Moderation & Utility Bot", desc: "Full-featured Discord bot — moderation, auto-mod, ticket system, leveling, custom embeds, and slash command support, built to last." },
              { emoji: "🚀", bg: "linear-gradient(135deg,#0a102a,#0d0a1a)", tag: "Branding", title: "Custom Creator Server Setup", desc: "End-to-end setup for a content creator — branded Minecraft server, matching Discord, custom bot, logo, banner — launch-ready in days." },
            ].map((p, i) => (
              <div key={p.title} className={`project-card tappable reveal reveal-delay-${(i % 3) + 1}`}>
                <div className="project-thumb" style={{ background: p.bg }}>
                  <div className="project-thumb-bg">{p.emoji}</div>
                  <div className="project-thumb-overlay" />
                  <span className="project-tag">{p.tag}</span>
                </div>
                <div className="project-body">
                  <h3 className="project-title">{p.title}</h3>
                  <p className="project-desc">{p.desc}</p>
                  <a href="https://discord.gg/BEEyA4TE4h" target="_blank" rel="noopener noreferrer" className="project-link">
                    Learn More →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMMUNITY ─── */}
      <section className="discord-section" id="community">
        <div className="container">
          <div className="discord-card reveal">
            <div className="discord-icon">💬</div>
            <h2 className="section-title">Chill. Connect. Create.</h2>
            <p className="section-subtitle">
              Join the Sound_APEX Discord — a premium space for Minecraft players, server owners, plugin developers, and creators. Share builds, get support, stay updated, and vibe with a tight-knit community that takes quality seriously.
            </p>
            <div className="discord-buttons">
              <a href="https://discord.gg/BEEyA4TE4h" target="_blank" rel="noopener noreferrer"
                className="btn-primary ripple-btn" onMouseDown={addRipple} onTouchStart={addRipple}>
                Join Our Discord →
              </a>
              <button className="btn-secondary ripple-btn" onMouseDown={addRipple} onTouchStart={addRipple} onClick={() => scrollTo("contact")}>
                Get in Touch
              </button>
            </div>
            <div className="member-count">
              <span className="member-count-dot" />
              <span>Members online — come hang 🎮</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section className="contact-section" id="contact">
        <div className="container">
          <div className="contact-grid">
            <div>
              <span className="section-label reveal">Get In Touch</span>
              <h2 className="section-title reveal reveal-delay-1">Let's Build Something <span className="gradient-text">Extraordinary</span></h2>
              <div className="divider reveal reveal-delay-2" />
              <p className="section-subtitle reveal reveal-delay-2" style={{ marginBottom: "38px" }}>
                Have a project in mind? A premium Minecraft server, a custom Discord bot, or a full community setup? Reach out — we'll make it happen.
              </p>
              <div className="contact-info">
                {[
                  { icon: "📧", label: "Email", value: "sarthaklive9967@gmail.com" },
                  { icon: "💬", label: "Discord", value: "discord.gg/BEEyA4TE4h" },
                  { icon: "🕐", label: "Response Time", value: "Within 24 hours on business days" },
                ].map((c, i) => (
                  <div key={c.label} className={`contact-item reveal reveal-delay-${i + 2}`}>
                    <div className="contact-item-icon">{c.icon}</div>
                    <div>
                      <div className="contact-item-label">{c.label}</div>
                      <div className="contact-item-value">{c.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <form className="contact-form reveal reveal-delay-2" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input className="form-input" type="text" placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="john@example.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Service</label>
                <select className="form-input" style={{ cursor: "pointer" }} required defaultValue="">
                  <option value="" disabled>Select a service...</option>
                  <option>Minecraft Server Setup</option>
                  <option>Custom Plugin Development</option>
                  <option>Mods & Resource Packs</option>
                  <option>Discord Server Design</option>
                  <option>Discord Bot Development</option>
                  <option>Branding & Optimization</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-textarea" placeholder="Tell us about your project and vision..." required />
              </div>
              <button type="submit" className="btn-primary ripple-btn"
                style={{ width: "100%", justifyContent: "center", border: "none", fontSize: "1rem" }}
                onMouseDown={addRipple} onTouchStart={addRipple}>
                Send Message →
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">Sound_APEX</div>
            <p>Premium Minecraft and Discord setups for creators and communities who refuse to settle for ordinary.</p>
          </div>
          <div>
            <p className="footer-col-title">Services</p>
            <ul className="footer-links">
              {["Minecraft Server Setup", "Custom Plugins", "Resource Packs", "Discord Servers", "Discord Bots", "Branding"].map((l) => (
                <li key={l}><a href="#services" onClick={(e) => { e.preventDefault(); scrollTo("services"); }}>{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer-col-title">Navigate</p>
            <ul className="footer-links">
              {NAV.map((l) => (
                <li key={l.id}><a href={`#${l.id}`} onClick={(e) => { e.preventDefault(); scrollTo(l.id); }}>{l.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer-col-title">Community</p>
            <ul className="footer-links">
              <li><a href="https://discord.gg/BEEyA4TE4h" target="_blank" rel="noopener noreferrer">Discord Server</a></li>
              <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo("contact"); }}>Contact Us</a></li>
              <li><a href="mailto:sarthaklive9967@gmail.com">Email Us</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Sound_APEX. All rights reserved.</p>
          <div className="social-links">
            <a href="https://discord.gg/BEEyA4TE4h" target="_blank" rel="noopener noreferrer" className="social-link" title="Discord">💬</a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
