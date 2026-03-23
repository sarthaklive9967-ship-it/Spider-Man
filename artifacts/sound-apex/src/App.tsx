import { useEffect, useRef, useState } from "react";
import "./index.css";

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const revealRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const btn = e.currentTarget.querySelector("button[type='submit']") as HTMLButtonElement;
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = "Message Sent ✓";
      btn.style.background = "linear-gradient(135deg, #10b981, #059669)";
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = "";
        (e.target as HTMLFormElement).reset();
      }, 2500);
    }
  };

  return (
    <>
      {/* ─── NAVBAR ─── */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          Sound_APEX
        </a>
        <ul className="nav-links">
          {["about", "services", "projects", "community", "contact"].map((s) => (
            <li key={s}>
              <a href={`#${s}`} onClick={(e) => { e.preventDefault(); scrollTo(s); }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </a>
            </li>
          ))}
          <li>
            <a href="#contact" className="nav-cta" onClick={(e) => { e.preventDefault(); scrollTo("contact"); }}>
              Get Started
            </a>
          </li>
        </ul>
        <div className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
          <span style={{ transform: mobileOpen ? "rotate(45deg) translate(5px, 5px)" : "" }} />
          <span style={{ opacity: mobileOpen ? 0 : 1 }} />
          <span style={{ transform: mobileOpen ? "rotate(-45deg) translate(5px, -5px)" : "" }} />
        </div>
      </nav>

      {/* ─── MOBILE MENU ─── */}
      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
        {["about", "services", "projects", "community", "contact"].map((s) => (
          <a key={s} href={`#${s}`} onClick={(e) => { e.preventDefault(); scrollTo(s); }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </a>
        ))}
        <a href="#contact" className="btn-primary" onClick={(e) => { e.preventDefault(); scrollTo("contact"); }}>
          Get Started
        </a>
      </div>

      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>
        <div className="hero-content">
          <div className="hero-badge reveal">
            <span className="hero-badge-dot" />
            Premium Audio Production Agency
          </div>
          <h1 className="hero-title reveal reveal-delay-1">
            Where Sound Meets <br />
            <span className="gradient-text">Elite Excellence</span>
          </h1>
          <p className="hero-subtitle reveal reveal-delay-2">
            Sound_APEX delivers world-class audio branding, music production, and sonic identity for artists, brands, and visionaries who refuse to settle for ordinary.
          </p>
          <div className="hero-buttons reveal reveal-delay-3">
            <a href="#services" className="btn-primary" onClick={(e) => { e.preventDefault(); scrollTo("services"); }}>
              Explore Services →
            </a>
            <a href="#projects" className="btn-secondary" onClick={(e) => { e.preventDefault(); scrollTo("projects"); }}>
              View Portfolio
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
                <h2 className="section-title">Crafted for the <span style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Exceptional</span></h2>
                <div className="divider" />
              </div>
              <p className="reveal reveal-delay-1">
                Sound_APEX is a premium audio production collective built for artists, brands, and creators who demand the highest caliber of sonic craftsmanship. We operate at the intersection of artistry and technology.
              </p>
              <p className="reveal reveal-delay-2">
                From chart-topping music production to immersive brand sound identities, our team of elite producers, engineers, and audio architects deliver results that transcend the expected — and define the extraordinary.
              </p>
              <div className="reveal reveal-delay-3">
                <a href="#services" className="btn-primary" style={{ marginTop: "8px", display: "inline-flex" }} onClick={(e) => { e.preventDefault(); scrollTo("services"); }}>
                  What We Do
                </a>
              </div>
            </div>
            <div className="about-stats">
              {[
                { n: "500+", l: "Projects Delivered" },
                { n: "12+", l: "Years of Excellence" },
                { n: "98%", l: "Client Satisfaction" },
                { n: "40+", l: "Global Clients" },
              ].map((s, i) => (
                <div key={s.n} className={`stat-card reveal reveal-delay-${i + 1}`}>
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
            <h2 className="section-title reveal reveal-delay-1">Premium Audio <span style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Services</span></h2>
            <p className="section-subtitle reveal reveal-delay-2" style={{ margin: "0 auto" }}>
              Every service we offer is built on a foundation of technical mastery, creative vision, and an obsessive attention to detail.
            </p>
          </div>
          <div className="services-grid">
            {[
              { icon: "🎵", title: "Music Production", desc: "Full-scale music production from concept to master — beats, arrangements, mixing, and mastering engineered for streaming platforms and live performance." },
              { icon: "🎧", title: "Audio Branding", desc: "Craft a unique sonic identity for your brand. Logos, jingles, UI sounds, and complete audio guidelines that make your brand unmistakable." },
              { icon: "🎙️", title: "Vocal Production", desc: "Elite vocal direction, editing, tuning, and processing. We elevate vocal performances to world-class standards for any genre." },
              { icon: "🔊", title: "Mixing & Mastering", desc: "Industry-standard mixing and mastering that gives your tracks the depth, clarity, and loudness to compete on any platform, globally." },
              { icon: "🎬", title: "Film & TV Scoring", desc: "Cinematic scores, soundtracks, and music supervision for film, TV, trailers, and digital content — from indie projects to studio productions." },
              { icon: "🚀", title: "Artist Development", desc: "Strategic artist branding, sound direction, release strategy, and industry consulting to launch and grow your music career with precision." },
            ].map((s, i) => (
              <div key={s.title} className={`service-card reveal reveal-delay-${(i % 3) + 1}`}>
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
            <h2 className="section-title reveal reveal-delay-1">Featured <span style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Showcase</span></h2>
            <p className="section-subtitle reveal reveal-delay-2" style={{ margin: "0 auto" }}>
              A curated selection of our most impactful projects across music, branding, and sonic innovation.
            </p>
          </div>
          <div className="projects-grid">
            {[
              {
                emoji: "🌌",
                bg: "linear-gradient(135deg, #1a0a2e, #0d1117)",
                tag: "Album",
                title: "Nebula Chronicles",
                desc: "Full production and mastering for a 12-track electronic concept album reaching #1 on independent charts across 8 countries.",
              },
              {
                emoji: "⚡",
                bg: "linear-gradient(135deg, #0a1628, #0d1117)",
                tag: "Branding",
                title: "VOLTEX Brand Sound",
                desc: "Complete sonic identity for a premium energy brand — logo audio, UI sounds, ad campaign music, and brand guidelines.",
              },
              {
                emoji: "🎤",
                bg: "linear-gradient(135deg, #1a1a0a, #0d1117)",
                tag: "Artist",
                title: "ARIA — Rise of a Star",
                desc: "18-month artist development project transforming an emerging vocalist into a signed, touring artist with 2M+ monthly listeners.",
              },
              {
                emoji: "🎬",
                bg: "linear-gradient(135deg, #0a1a1a, #0d1117)",
                tag: "Film Score",
                title: "Horizon — Documentary",
                desc: "Original score for an award-winning environmental documentary screened at Sundance, Cannes, and 40+ international festivals.",
              },
              {
                emoji: "🏆",
                bg: "linear-gradient(135deg, #1a0a0a, #0d1117)",
                tag: "Campaign",
                title: "APEX Sports Campaign",
                desc: "High-energy audio production for a global sports brand's flagship product launch, reaching 200M+ impressions worldwide.",
              },
              {
                emoji: "🌊",
                bg: "linear-gradient(135deg, #0a1428, #0d1117)",
                tag: "EP",
                title: "Deep Blue Sessions",
                desc: "5-track ambient EP produced, mixed, and mastered in collaboration with a Grammy-nominated artist — now featured in Netflix originals.",
              },
            ].map((p, i) => (
              <div key={p.title} className={`project-card reveal reveal-delay-${(i % 3) + 1}`}>
                <div className="project-thumb" style={{ background: p.bg }}>
                  <div className="project-thumb-bg">{p.emoji}</div>
                  <div className="project-thumb-overlay" />
                  <span className="project-tag">{p.tag}</span>
                </div>
                <div className="project-body">
                  <h3 className="project-title">{p.title}</h3>
                  <p className="project-desc">{p.desc}</p>
                  <a href="#contact" className="project-link" onClick={(e) => { e.preventDefault(); scrollTo("contact"); }}>
                    Learn More →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DISCORD ─── */}
      <section className="discord-section" id="community">
        <div className="container">
          <div className="discord-card reveal">
            <div className="discord-icon">💬</div>
            <h2 className="section-title">Join the Sound_APEX Community</h2>
            <p className="section-subtitle">
              Connect with elite producers, artists, and audio professionals. Get exclusive resources, feedback, industry insights, and first access to new services.
            </p>
            <div className="discord-buttons">
              <a href="#" className="btn-primary" onClick={(e) => e.preventDefault()}>
                Join Our Discord →
              </a>
              <a href="#contact" className="btn-secondary" onClick={(e) => { e.preventDefault(); scrollTo("contact"); }}>
                Learn More
              </a>
            </div>
            <div className="member-count">
              <span className="member-count-dot" />
              <span>2,400+ members online right now</span>
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
              <h2 className="section-title reveal reveal-delay-1">Let's Create <span style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Something Extraordinary</span></h2>
              <div className="divider reveal reveal-delay-2" />
              <p className="section-subtitle reveal reveal-delay-2" style={{ marginBottom: "40px" }}>
                Ready to elevate your sound? Reach out and let's discuss how Sound_APEX can transform your creative vision into an audio masterpiece.
              </p>
              <div className="contact-info">
                {[
                  { icon: "📧", label: "Email", value: "studio@soundapex.com" },
                  { icon: "📍", label: "Location", value: "Los Angeles, CA — Remote Worldwide" },
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
                  <option>Music Production</option>
                  <option>Audio Branding</option>
                  <option>Vocal Production</option>
                  <option>Mixing & Mastering</option>
                  <option>Film & TV Scoring</option>
                  <option>Artist Development</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-textarea" placeholder="Tell us about your project, vision, and goals..." required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", border: "none", fontSize: "1rem" }}>
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
            <p>
              Premium audio production and sonic branding for artists and brands who demand excellence. Based in LA. Working globally.
            </p>
          </div>
          <div>
            <p className="footer-col-title">Services</p>
            <ul className="footer-links">
              {["Music Production", "Audio Branding", "Vocal Production", "Mixing & Mastering", "Film Scoring"].map((l) => (
                <li key={l}><a href="#services" onClick={(e) => { e.preventDefault(); scrollTo("services"); }}>{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer-col-title">Company</p>
            <ul className="footer-links">
              {["About", "Portfolio", "Community", "Contact"].map((l) => (
                <li key={l}><a href={`#${l.toLowerCase()}`} onClick={(e) => { e.preventDefault(); scrollTo(l.toLowerCase()); }}>{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer-col-title">Connect</p>
            <ul className="footer-links">
              {["Discord", "Instagram", "Twitter", "YouTube", "SoundCloud"].map((l) => (
                <li key={l}><a href="#" onClick={(e) => e.preventDefault()}>{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Sound_APEX. All rights reserved.</p>
          <div className="social-links">
            {["💬", "📷", "🐦", "▶️", "☁️"].map((icon, i) => (
              <div key={i} className="social-link" onClick={() => {}}>
                {icon}
              </div>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
