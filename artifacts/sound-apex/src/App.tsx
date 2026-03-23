import { useEffect, useRef, useState, useCallback } from "react";
import "./index.css";

/* ═══════════════════════════════════════════════════
   SOUND ENGINE — auto-unlocks on first interaction
════════════════════════════════════════════════════ */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private unlocked = false;

  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  private getCtx(): AudioContext | null {
    if (!this.unlocked) return null;
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  click() {
    const ctx = this.getCtx();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.connect(g); g.connect(ctx.destination);
    o.frequency.setValueAtTime(900, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.07, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    o.start(); o.stop(ctx.currentTime + 0.14);
  }

  menuOpen() {
    const ctx = this.getCtx();
    if (!ctx) return;
    [500, 700, 950].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq;
      const t = ctx.currentTime + i * 0.08;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.055, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.start(t); o.stop(t + 0.22);
    });
  }

  loaderDone() {
    const ctx = this.getCtx();
    if (!ctx) return;
    [330, 440, 550, 660, 880].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq;
      const t = ctx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.06, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      o.start(t); o.stop(t + 0.4);
    });
  }
}

const sfx = new SoundEngine();

/* ═══════════════════════════════════════════════════
   GLOBAL FIXED ANIMATED BACKGROUND
════════════════════════════════════════════════════ */
function GlobalBG() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const isMobile = window.innerWidth < 600;
    const count = isMobile ? 36 : 60;
    const maxDist = isMobile ? 100 : 130;

    const pts = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.6 + 0.5,
      isRed: Math.random() > 0.5,
    }));

    const draw = () => {
      t += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // pulsing red orb (top-left area)
      const rp = 0.1 + 0.04 * Math.sin(t);
      const gR = ctx.createRadialGradient(
        canvas.width * 0.18, canvas.height * 0.2, 0,
        canvas.width * 0.18, canvas.height * 0.2, canvas.width * 0.5
      );
      gR.addColorStop(0, `rgba(180,20,30,${rp})`);
      gR.addColorStop(1, "transparent");
      ctx.fillStyle = gR; ctx.fillRect(0, 0, canvas.width, canvas.height);

      // pulsing blue orb (bottom-right)
      const bp = 0.08 + 0.04 * Math.sin(t + 2);
      const gB = ctx.createRadialGradient(
        canvas.width * 0.82, canvas.height * 0.78, 0,
        canvas.width * 0.82, canvas.height * 0.78, canvas.width * 0.48
      );
      gB.addColorStop(0, `rgba(30,80,220,${bp})`);
      gB.addColorStop(1, "transparent");
      ctx.fillStyle = gB; ctx.fillRect(0, 0, canvas.width, canvas.height);

      // web lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            const a = 0.16 * (1 - d / maxDist);
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = pts[i].isRed ? `rgba(220,40,50,${a})` : `rgba(50,100,240,${a})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(pts[i].x, pts[i].y, pts[i].r, 0, Math.PI * 2);
        ctx.fillStyle = pts[i].isRed ? "rgba(230,57,70,0.7)" : "rgba(59,130,246,0.65)";
        ctx.fill();

        pts[i].x += pts[i].vx; pts[i].y += pts[i].vy;
        if (pts[i].x < -8) pts[i].x = canvas.width + 8;
        if (pts[i].x > canvas.width + 8) pts[i].x = -8;
        if (pts[i].y < -8) pts[i].y = canvas.height + 8;
        if (pts[i].y > canvas.height + 8) pts[i].y = -8;
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="global-bg-canvas" />;
}

/* ═══════════════════════════════════════════════════
   LOADING SCREEN
════════════════════════════════════════════════════ */
function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState<"loading" | "done" | "fading">("loading");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.32, vy: (Math.random() - 0.5) * 0.32,
      r: Math.random() * 1.4 + 0.4, isRed: Math.random() > 0.5,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 110) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = pts[i].isRed ? `rgba(200,30,40,${0.1*(1-d/110)})` : `rgba(40,90,220,${0.09*(1-d/110)})`;
            ctx.lineWidth = 0.6; ctx.stroke();
          }
        }
        ctx.beginPath(); ctx.arc(pts[i].x, pts[i].y, pts[i].r, 0, Math.PI * 2);
        ctx.fillStyle = pts[i].isRed ? "rgba(230,57,70,0.65)" : "rgba(59,130,246,0.55)";
        ctx.fill();
        pts[i].x += pts[i].vx; pts[i].y += pts[i].vy;
        if (pts[i].x < -8) pts[i].x = canvas.width + 8;
        if (pts[i].x > canvas.width + 8) pts[i].x = -8;
        if (pts[i].y < -8) pts[i].y = canvas.height + 8;
        if (pts[i].y > canvas.height + 8) pts[i].y = -8;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  useEffect(() => {
    let cur = 0;
    const bumps = [
      { to: 22, delay: 0,    ms: 22 },
      { to: 55, delay: 380,  ms: 28 },
      { to: 82, delay: 850,  ms: 40 },
      { to: 100, delay: 1260, ms: 22 },
    ];
    const handles: ReturnType<typeof setTimeout>[] = [];
    bumps.forEach(({ to, delay, ms }) => {
      const t = setTimeout(() => {
        const iv = setInterval(() => {
          cur = Math.min(cur + 1, to);
          setPct(cur);
          if (cur >= to) clearInterval(iv);
        }, ms);
        handles.push(iv as unknown as ReturnType<typeof setTimeout>);
      }, delay);
      handles.push(t);
    });
    const done = setTimeout(() => {
      setPhase("done");
      sfx.loaderDone();
      setTimeout(() => { setPhase("fading"); setTimeout(onDone, 900); }, 260);
    }, 2400);
    handles.push(done);
    return () => handles.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className={`loader-wrap ${phase === "fading" ? "loader-fade" : ""} ${phase === "done" ? "loader-done" : ""}`}>
      <canvas ref={canvasRef} className="loader-canvas" />
      <div className="loader-scanlines" />
      <div className="loader-orb loader-orb-1" />
      <div className="loader-orb loader-orb-2" />
      <div className="loader-content">
        <div className="loader-logo-wrap">
          <div className="loader-logo-eyeline" />
          <h1 className="loader-logo">Sound_APEX</h1>
          <div className="loader-logo-glow" />
        </div>
        <p className="loader-subtitle">Minecraft &nbsp;·&nbsp; Discord &nbsp;·&nbsp; Developer</p>
        <div className="loader-bar-wrap">
          <div className="loader-bar-bg">
            <div className="loader-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="loader-pct">{pct}%</span>
        </div>
        <p className="loader-status">{pct < 40 ? "Initializing…" : pct < 80 ? "Loading assets…" : pct < 100 ? "Almost ready…" : "Welcome."}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SPIDER WEB BURST EFFECT
════════════════════════════════════════════════════ */
function useWebBurst() {
  useEffect(() => {
    const spawn = (x: number, y: number) => {
      const div = document.createElement("div");
      div.className = "web-burst";
      div.style.left = `${x}px`;
      div.style.top = `${y}px`;

      const S = 80; // svg size
      const cx = S / 2, cy = S / 2;
      const rays = 8;
      const innerR = 8, outerR = 32;
      const arcR1 = 14, arcR2 = 22;

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", String(S));
      svg.setAttribute("height", String(S));
      svg.setAttribute("viewBox", `0 0 ${S} ${S}`);

      // Draw rays
      for (let i = 0; i < rays; i++) {
        const a = (i / rays) * Math.PI * 2 - Math.PI / 2;
        const variation = (Math.random() - 0.5) * 0.18;
        const ar = a + variation;
        const x1 = cx + Math.cos(ar) * innerR;
        const y1 = cy + Math.sin(ar) * innerR;
        const segLen = outerR + Math.random() * 6;
        const x2 = cx + Math.cos(ar) * segLen;
        const y2 = cy + Math.sin(ar) * segLen;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", String(x1)); line.setAttribute("y1", String(y1));
        line.setAttribute("x2", String(x2)); line.setAttribute("y2", String(y2));
        line.setAttribute("stroke", i % 3 === 0 ? "rgba(59,130,246,0.7)" : "rgba(210,30,45,0.8)");
        line.setAttribute("stroke-width", "0.9");
        line.setAttribute("stroke-linecap", "round");
        svg.appendChild(line);
      }

      // Draw arc ring 1
      for (let i = 0; i < rays; i++) {
        const a1 = (i / rays) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((i + 1) / rays) * Math.PI * 2 - Math.PI / 2;
        const x1 = cx + Math.cos(a1) * arcR1;
        const y1 = cy + Math.sin(a1) * arcR1;
        const x2 = cx + Math.cos(a2) * arcR1;
        const y2 = cy + Math.sin(a2) * arcR1;
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const sweep = 1;
        path.setAttribute("d", `M ${x1} ${y1} A ${arcR1} ${arcR1} 0 0 ${sweep} ${x2} ${y2}`);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "rgba(200,30,40,0.45)");
        path.setAttribute("stroke-width", "0.7");
        svg.appendChild(path);
      }

      // Draw arc ring 2
      for (let i = 0; i < rays; i++) {
        const a1 = (i / rays) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((i + 1) / rays) * Math.PI * 2 - Math.PI / 2;
        const x1 = cx + Math.cos(a1) * arcR2;
        const y1 = cy + Math.sin(a1) * arcR2;
        const x2 = cx + Math.cos(a2) * arcR2;
        const y2 = cy + Math.sin(a2) * arcR2;
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M ${x1} ${y1} A ${arcR2} ${arcR2} 0 0 1 ${x2} ${y2}`);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "rgba(50,90,230,0.35)");
        path.setAttribute("stroke-width", "0.6");
        svg.appendChild(path);
      }

      // Center glow dot
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", String(cx)); dot.setAttribute("cy", String(cy));
      dot.setAttribute("r", "2.5");
      dot.setAttribute("fill", "rgba(230,57,70,0.9)");
      svg.appendChild(dot);

      div.appendChild(svg);
      document.body.appendChild(div);
      setTimeout(() => div.remove(), 750);
    };

    const firstInteract = () => sfx.unlock();

    const onMouse = (e: MouseEvent) => { firstInteract(); spawn(e.clientX, e.clientY); };
    const onTouch = (e: TouchEvent) => { firstInteract(); Array.from(e.touches).forEach(t => spawn(t.clientX, t.clientY)); };

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

  useWebBurst();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("revealed"); }),
      { threshold: 0.07, rootMargin: "0px 0px -36px 0px" }
    );
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [loaded]);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const openMenu = () => { sfx.unlock(); sfx.menuOpen(); setMobileOpen(true); };
  const closeMenu = () => setMobileOpen(false);

  const addRipple = useCallback((e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
    sfx.unlock(); sfx.click();
    const btn = e.currentTarget;
    const span = document.createElement("span");
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const cx = "touches" in e ? (e.touches[0]?.clientX ?? rect.left) : (e as React.MouseEvent).clientX;
    const cy = "touches" in e ? (e.touches[0]?.clientY ?? rect.top) : (e as React.MouseEvent).clientY;
    span.style.cssText = `width:${size}px;height:${size}px;left:${cx - rect.left - size/2}px;top:${cy - rect.top - size/2}px;`;
    span.className = "ripple";
    btn.appendChild(span);
    setTimeout(() => span.remove(), 680);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); sfx.unlock(); sfx.click();
    const btn = e.currentTarget.querySelector("button[type='submit']") as HTMLButtonElement;
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = "Message Sent ✓";
    btn.style.background = "linear-gradient(135deg,#059669,#10b981)";
    setTimeout(() => { btn.textContent = orig; btn.style.background = ""; (e.target as HTMLFormElement).reset(); }, 2800);
  };

  const NAV = [
    { label: "Home",      id: "home" },
    { label: "About",     id: "about" },
    { label: "Services",  id: "services" },
    { label: "Projects",  id: "projects" },
    { label: "Community", id: "community" },
    { label: "Contact",   id: "contact" },
  ];

  return (
    <>
      {!loaded && <LoadingScreen onDone={() => setLoaded(true)} />}

      <GlobalBG />

      <div className="site-content">

        {/* ─── NAVBAR ─── */}
        <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
          <a href="#" className="nav-logo" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            Sound_APEX
          </a>
          <ul className="nav-links">
            {NAV.map(item => (
              <li key={item.id}>
                <a href={`#${item.id}`} onClick={e => { e.preventDefault(); scrollTo(item.id); }}>{item.label}</a>
              </li>
            ))}
            <li>
              <a href="https://discord.gg/BEEyA4TE4h" target="_blank" rel="noopener noreferrer"
                className="nav-cta ripple-btn" onMouseDown={addRipple} onTouchStart={addRipple}>
                Join Discord
              </a>
            </li>
          </ul>
          <div className={`hamburger ${mobileOpen ? "open" : ""}`} onClick={mobileOpen ? closeMenu : openMenu}>
            <span /><span /><span />
          </div>
        </nav>

        {/* ─── MOBILE MENU ─── */}
        <div className={`mobile-menu ${mobileOpen ? "open" : ""}`} onClick={closeMenu}>
          <div className="mobile-menu-inner" onClick={e => e.stopPropagation()}>
            <button className="mobile-close" onClick={closeMenu}>✕</button>
            {NAV.map(item => (
              <a key={item.id} href={`#${item.id}`} onClick={e => { e.preventDefault(); scrollTo(item.id); }}>{item.label}</a>
            ))}
            <a href="https://discord.gg/BEEyA4TE4h" target="_blank" rel="noopener noreferrer"
              className="btn-primary ripple-btn" onMouseDown={addRipple} onTouchStart={addRipple} style={{ marginTop: 8 }}>
              Join Discord →
            </a>
          </div>
        </div>

        {/* ─── HERO ─── */}
        <section className="hero" id="home">
          <div className="hero-overlay" />
          <div className="hero-grid" />
          <div className="hero-content">
            <div className="hero-badge reveal">
              <span className="hero-badge-dot" />
              Premium Digital Studio
            </div>
            <p className="hero-subtitle-tag reveal reveal-delay-1">Minecraft · Discord · Developer</p>
            <h1 className="hero-title reveal reveal-delay-2">
              <span className="gradient-text">Sound_APEX</span>
            </h1>
            <p className="hero-desc reveal reveal-delay-3">
              Building premium Minecraft servers, custom plugins, resource packs, Discord communities, and powerful bots — with a cinematic, futuristic edge.
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
          <div className="hero-scroll-hint reveal reveal-delay-5">
            <span>scroll</span>
            <div className="hero-scroll-line" />
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
                  Sound_APEX is a premium digital studio for Minecraft architecture, custom Java plugins, immersive resource packs, mod setups, and fully engineered Discord communities.
                </p>
                <p className="reveal reveal-delay-2">
                  From high-performance SMP servers to powerful Discord bots — every project is built with precision, cinematic style, and zero compromise.
                </p>
                <div className="reveal reveal-delay-3">
                  <button className="btn-primary ripple-btn" style={{ marginTop: 8 }}
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
                Every project is built with elite craftsmanship, clean code, and uncompromising attention to detail.
              </p>
            </div>
            <div className="services-grid">
              {[
                { icon: "⛏️", title: "Minecraft Server Setup",    desc: "Fully optimized SMP, survival, minigames, or custom gamemodes. Performance-tuned and player-ready from day one." },
                { icon: "🧩", title: "Custom Plugin Development", desc: "Bespoke Java plugins — custom gameplay, admin tools, and integrations tailored precisely to your server's vision." },
                { icon: "🎨", title: "Mods & Resource Packs",     desc: "32x+ premium resource packs and mod configs that give your server a unique cinematic visual identity." },
                { icon: "💬", title: "Discord Server Design",     desc: "Premium communities with structured channels, custom roles, verification flows, and a professional aesthetic." },
                { icon: "🤖", title: "Discord Bot Development",   desc: "Powerful bots — moderation, ticketing, leveling, economy, and more. Built clean and reliable." },
                { icon: "🚀", title: "Branding & Optimization",   desc: "Logos, banners, server icons, MOTD styling — plus performance optimization so everything runs smooth at scale." },
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
                A curated look at our most impressive Minecraft and Discord projects.
              </p>
            </div>
            <div className="projects-grid">
              {[
                { emoji: "⛏️", bg: "linear-gradient(135deg,#1a0505,#0a0612)", tag: "Minecraft",    title: "Premium Minecraft SMP Server",    desc: "SMP with custom economy, land claiming, anti-cheat, and 50+ QoL plugins — 200+ concurrent players with zero lag." },
                { emoji: "🧩", bg: "linear-gradient(135deg,#050d1a,#0a0612)", tag: "Plugin",       title: "Custom Plugin System",            desc: "Modular Java plugin suite — custom crafting, player stats, seasonal events, and admin tools built for scale." },
                { emoji: "🎨", bg: "linear-gradient(135deg,#140a05,#0a0612)", tag: "Resource Pack", title: "Stylish Resource Pack",           desc: "32x premium overhaul — custom UI, unique textures, and a cohesive identity that makes the server feel cinematic." },
                { emoji: "💬", bg: "linear-gradient(135deg,#050a14,#0a0612)", tag: "Discord",      title: "Full Discord Community Server",   desc: "Professionally designed Discord with role systems, onboarding, reaction roles, and a premium branded aesthetic." },
                { emoji: "🤖", bg: "linear-gradient(135deg,#14050a,#0a0612)", tag: "Bot",          title: "Moderation & Utility Bot",        desc: "Full-featured bot — moderation, auto-mod, tickets, leveling, custom embeds, and slash commands built to last." },
                { emoji: "🚀", bg: "linear-gradient(135deg,#05081a,#0a0612)", tag: "Branding",     title: "Custom Creator Server Setup",     desc: "End-to-end setup — branded server, Discord, bot, logo, banner. Launch-ready in days." },
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
              <div className="discord-card-corner tl" />
              <div className="discord-card-corner tr" />
              <div className="discord-card-corner bl" />
              <div className="discord-card-corner br" />
              <div className="discord-icon">💬</div>
              <h2 className="section-title">Chill. Connect. Create.</h2>
              <p className="section-subtitle">
                Join the Sound_APEX Discord — a premium space for Minecraft players, server owners, plugin developers, and creators. Share builds, get support, and vibe with a community that takes quality seriously.
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
                <p className="section-subtitle reveal reveal-delay-2" style={{ marginBottom: 38 }}>
                  Have a project in mind? Reach out — we'll make it happen.
                </p>
                <div className="contact-info">
                  {[
                    { icon: "📧", label: "Email",         value: "sarthaklive9967@gmail.com" },
                    { icon: "💬", label: "Discord",       value: "discord.gg/BEEyA4TE4h" },
                    { icon: "🕐", label: "Response Time", value: "Within 24 hours" },
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
                    <option value="" disabled>Select a service…</option>
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
                  <textarea className="form-textarea" placeholder="Tell us about your project…" required />
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
              <p>Premium Minecraft and Discord setups for creators who refuse to settle for ordinary.</p>
            </div>
            <div>
              <p className="footer-col-title">Services</p>
              <ul className="footer-links">
                {["Minecraft Server Setup","Custom Plugins","Resource Packs","Discord Servers","Discord Bots","Branding"].map(l => (
                  <li key={l}><a href="#services" onClick={e => { e.preventDefault(); scrollTo("services"); }}>{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="footer-col-title">Navigate</p>
              <ul className="footer-links">
                {NAV.map(l => (
                  <li key={l.id}><a href={`#${l.id}`} onClick={e => { e.preventDefault(); scrollTo(l.id); }}>{l.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="footer-col-title">Community</p>
              <ul className="footer-links">
                <li><a href="https://discord.gg/BEEyA4TE4h" target="_blank" rel="noopener noreferrer">Discord Server</a></li>
                <li><a href="#contact" onClick={e => { e.preventDefault(); scrollTo("contact"); }}>Contact Us</a></li>
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

      </div>{/* end .site-content */}
    </>
  );
}

export default App;
