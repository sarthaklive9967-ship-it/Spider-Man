import { useEffect, useRef, useState, useCallback } from "react";
import "./index.css";

/* ═══════════════════════════════
   LOADING SCREEN
═══════════════════════════════ */
function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [fading, setFading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* Particle canvas on loader */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.4,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.15,
      color: Math.random() > 0.5 ? "139,92,246" : "59,130,246",
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* Progress counter */
  useEffect(() => {
    const steps = [
      { target: 30, delay: 0, speed: 22 },
      { target: 65, delay: 320, speed: 30 },
      { target: 88, delay: 700, speed: 45 },
      { target: 100, delay: 1100, speed: 28 },
    ];

    let current = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    steps.forEach(({ target, delay, speed }) => {
      const t = setTimeout(() => {
        const tick = setInterval(() => {
          current += 1;
          setPct(current);
          if (current >= target) clearInterval(tick);
        }, speed);
        timers.push(tick as unknown as ReturnType<typeof setTimeout>);
      }, delay);
      timers.push(t);
    });

    const done = setTimeout(() => {
      setFading(true);
      setTimeout(onDone, 900);
    }, 2200);
    timers.push(done);

    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className={`loader-wrap ${fading ? "loader-fade" : ""}`}>
      <canvas ref={canvasRef} className="loader-canvas" />
      <div className="loader-orb loader-orb-1" />
      <div className="loader-orb loader-orb-2" />
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

/* ═══════════════════════════════
   PARTICLE BACKGROUND CANVAS
═══════════════════════════════ */
function ParticleBG() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const count = window.innerWidth < 600 ? 40 : 70;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.45 + 0.1,
      color: Math.random() > 0.55 ? "139,92,246" : "59,130,246",
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // draw faint connection lines
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(139,92,246,${0.06 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${a.color},${a.alpha})`;
        ctx.fill();
        a.x += a.dx;
        a.y += a.dy;
        if (a.x < 0 || a.x > canvas.width) a.dx *= -1;
        if (a.y < 0 || a.y > canvas.height) a.dy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} className="particle-bg" />;
}

/* ═══════════════════════════════
   GLOBAL TOUCH / CLICK RIPPLE
═══════════════════════════════ */
function useGlobalTouchEffect() {
  useEffect(() => {
    const spawn = (x: number, y: number) => {
      const ring = document.createElement("div");
      ring.className = "touch-ring";
      ring.style.left = `${x}px`;
      ring.style.top = `${y}px`;
      document.body.appendChild(ring);
      setTimeout(() => ring.remove(), 700);
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

/* ═══════════════════════════════
   MAIN APP
═══════════════════════════════ */
function App() {
  const [loaded, setLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useGlobalTouchEffect();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("revealed"); }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loaded]);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    setTimeout(() => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); }, 50);
  };

  const addRipple = useCallback((e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
    const btn = e.currentTarget;
    const circle = document.createElement("span");
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const clientX = "touches" in e ? e.touches[0]?.clientX ?? rect.left : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0]?.clientY ?? rect.top : (e as React.MouseEvent).clientY;
    circle.style.cssText = `width:${size}px;height:${size}px;left:${clientX - rect.left - size / 2}px;top:${clientY - rect.top - size / 2}px;`;
    circle.classList.add("ripple");
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 700);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        <div className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
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
        <ParticleBG />
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>
        <div className="hero-content">
          <div className="hero-badge reveal">
            <span className="hero-badge-dot" />
            Premium Gaming & Community Brand
          </div>
          <h1 className="hero-title reveal reveal-delay-1">
            Building Premium <br />
            <span className="gradient-text">Minecraft & Discord</span>
            <br />Experiences
          </h1>
          <p className="hero-subtitle reveal reveal-delay-2">
            Sound_APEX creates premium Minecraft servers, custom plugins, resource packs, Discord servers, and powerful bots for creators and communities that want a polished, professional, and unique setup.
          </p>
          <div className="hero-buttons reveal reveal-delay-3">
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
                Sound_APEX is a premium gaming and community studio specializing in Minecraft server setups, custom plugin development, immersive resource packs, and fully configured Discord communities.
              </p>
              <p className="reveal reveal-delay-2">
                Whether you need a high-performance SMP server, a feature-rich Discord bot, or a full-scale community brand — we build it with precision, style, and zero compromise on quality.
              </p>
              <div className="reveal reveal-delay-3">
                <button className="btn-primary ripple-btn" style={{ marginTop: "8px" }}
                  onMouseDown={addRipple} onTouchStart={addRipple} onClick={() => scrollTo("services")}>
                  What We Do
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
              { icon: "⛏️", title: "Minecraft Server Setup", desc: "Full setup of optimized Minecraft servers — SMP, survival, minigames, or custom gamemodes. Performance-tuned, anti-cheat ready, and player-ready from day one." },
              { icon: "🧩", title: "Custom Plugins", desc: "Bespoke Java plugins built from scratch to match your server's exact gameplay needs. Lightweight, efficient, and deeply integrated with your setup." },
              { icon: "🎨", title: "Mods & Resource Packs", desc: "Stunning custom resource packs and mod configurations that give your server a unique visual identity your players will instantly recognize." },
              { icon: "💬", title: "Discord Server Setup", desc: "Premium Discord communities built with structured channels, custom roles, verification flows, embeds, and a professional aesthetic your members will love." },
              { icon: "🤖", title: "Discord Bot Development", desc: "Powerful custom bots — moderation, ticketing, leveling, economy, and more. Built with clean code and tailored entirely to your community's needs." },
              { icon: "🚀", title: "Server Branding & Optimization", desc: "Complete branding packages — logos, banners, server icons, MOTD styling — plus performance optimization so your server runs smooth at scale." },
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
              A curated look at our most impressive Minecraft and Discord projects built for creators and communities.
            </p>
          </div>
          <div className="projects-grid">
            {[
              { emoji: "⛏️", bg: "linear-gradient(135deg,#1a0a2e,#0d1117)", tag: "Minecraft", title: "Premium Minecraft SMP Server", desc: "A fully configured survival multiplayer server with custom economy, land claiming, anti-cheat, and 50+ quality-of-life plugins — running 200+ concurrent players." },
              { emoji: "🧩", bg: "linear-gradient(135deg,#0a1628,#0d1117)", tag: "Plugin", title: "Custom Plugin System", desc: "A modular plugin suite featuring custom crafting, player stats, seasonal events, and admin tools — written in Java and optimized for zero-lag performance." },
              { emoji: "🎨", bg: "linear-gradient(135deg,#1a1a0a,#0d1117)", tag: "Resource Pack", title: "Stylish Resource Pack", desc: "A complete 32x resource pack overhaul with custom UI, unique block textures, and a cohesive visual theme that makes the server feel like a premium experience." },
              { emoji: "💬", bg: "linear-gradient(135deg,#0a1a1a,#0d1117)", tag: "Discord", title: "Full Discord Community Server", desc: "A professionally designed Discord server with role systems, onboarding flows, reaction roles, structured channels, and a premium branded aesthetic." },
              { emoji: "🤖", bg: "linear-gradient(135deg,#1a0a0a,#0d1117)", tag: "Bot", title: "Moderation & Utility Bot", desc: "A full-featured Discord bot with moderation commands, auto-moderation, ticket system, leveling, custom embeds, and slash command support." },
              { emoji: "🚀", bg: "linear-gradient(135deg,#0a1428,#0d1117)", tag: "Branding", title: "Custom Creator Server Setup", desc: "End-to-end setup for a content creator — branded Minecraft server, matching Discord, custom bot, logo, banner, and launch-ready in under a week." },
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
              Join the Sound_APEX Discord — a premium space for Minecraft players, server owners, developers, and creators. Share your builds, get support, and vibe with a tight-knit community that takes quality seriously.
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
              <p className="section-subtitle reveal reveal-delay-2" style={{ marginBottom: "40px" }}>
                Have a project in mind? Want a premium Minecraft server, a custom Discord bot, or a full community setup? Reach out — we'll make it happen.
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
                <label className="form-label">Service Interested In</label>
                <select className="form-input" style={{ cursor: "pointer" }} required defaultValue="">
                  <option value="" disabled>Select a service...</option>
                  <option>Minecraft Server Setup</option>
                  <option>Custom Plugins</option>
                  <option>Mods & Resource Packs</option>
                  <option>Discord Server Setup</option>
                  <option>Discord Bot Development</option>
                  <option>Server Branding & Optimization</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-textarea" placeholder="Tell us about your project, vision, and goals..." required />
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
              {["Minecraft Server Setup", "Custom Plugins", "Resource Packs", "Discord Servers", "Discord Bots", "Server Branding"].map((l) => (
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
