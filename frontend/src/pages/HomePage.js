import React, { useState, useEffect } from 'react';
import AuthPage from './AuthPage';
import './HomePage.css';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Contact Us', href: '#contact' },
];

const FEATURES = [
  { icon: '🧮', title: 'Carbon Footprint Calculator', desc: 'Accurately calculate monthly emissions from transport, energy, food, and waste using verified emission factors.' },
  { icon: '💡', title: 'Personalized Recommendations', desc: 'Receive AI-driven, actionable suggestions tailored to your actual lifestyle data to lower your impact.' },
  { icon: '📊', title: 'Progress Tracking Dashboard', desc: 'Visualize trends with beautiful charts. Compare your footprint against national and global averages.' },
  { icon: '📚', title: 'Sustainability Tips', desc: 'Access a curated library of articles, guides, and interactive quizzes about sustainable living.' },
  { icon: '🎯', title: 'Goal Setting', desc: 'Set carbon reduction goals, track milestones, and earn achievement badges as you progress.' },
  { icon: '📈', title: 'Reports & Analytics', desc: 'Generate detailed weekly and monthly reports with downloadable visual analytics.' },
];

const PILLARS = [
  { icon: '🌱', title: 'Sustainability', desc: 'Promoting long-term eco-friendly habits and decisions in everyday life.' },
  { icon: '☀️', title: 'Renewable Energy', desc: 'Educating users on solar, wind, and clean energy alternatives.' },
  { icon: '♻️', title: 'Carbon Reduction', desc: 'Tracking and reducing personal carbon emissions step by step.' },
  { icon: '🌍', title: 'Environmental Protection', desc: 'Empowering communities to protect ecosystems and biodiversity.' },
];

const STEPS = [
  { num: '1', icon: '✏️', title: 'Enter Your Daily Activities', desc: 'Input your transportation, energy, food habits, and waste generation into our simple guided form.' },
  { num: '2', icon: '⚡', title: 'Calculate Carbon Emissions', desc: 'Our platform instantly computes your carbon footprint using verified scientific emission factors.' },
  { num: '3', icon: '🌿', title: 'Get Personalized Suggestions', desc: 'Receive a tailored action plan to reduce your footprint and track your improvement month by month.' },
];



export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSent, setContactSent] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openLogin = () => { setAuthTab('login'); setShowAuth(true); setMenuOpen(false); };
  const openSignup = () => { setAuthTab('register'); setShowAuth(true); setMenuOpen(false); };

  const scrollTo = (href) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleContact = e => {
    e.preventDefault();
    setContactLoading(true);
    setTimeout(() => { setContactLoading(false); setContactSent(true); setContactForm({ name: '', email: '', message: '' }); }, 1200);
  };

  return (
    <div className="lp" style={{ fontFamily: "'Inter',sans-serif", color: '#1a1a1a', overflowX: 'hidden' }}>

      {/* ══ NAVBAR ══ */}
      <nav className={`lp-nav ${scrolled ? 'scrolled' : 'top'}`}>
        <a className="lp-logo" href="#home" onClick={e => { e.preventDefault(); scrollTo('#home'); }}>
          <div className="lp-logo-icon">🌿</div>
          <span>EcoTrack</span>
        </a>

        <div className="lp-nav-links">
          {NAV_LINKS.map(l => (
            <button key={l.label} className="lp-nav-link" onClick={() => scrollTo(l.href)}>{l.label}</button>
          ))}
          <button className="lp-btn-outline" onClick={openLogin}>Login</button>
          <button className="lp-btn-solid" onClick={openSignup}>Sign Up</button>
        </div>

        <button className="lp-hamburger" style={{ color: scrolled ? '#166534' : 'white' }} onClick={() => setMenuOpen(o => !o)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      <div className={`lp-mobile-menu ${menuOpen ? 'open' : ''}`}>
        {NAV_LINKS.map(l => (
          <button key={l.label} className="lp-mobile-link" onClick={() => scrollTo(l.href)}>{l.label}</button>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="lp-btn-outline" style={{ flex: 1, border: '2px solid #16a34a', color: '#16a34a' }} onClick={openLogin}>Login</button>
          <button className="lp-btn-solid" style={{ flex: 1 }} onClick={openSignup}>Sign Up</button>
        </div>
      </div>

      {/* ══ HERO ══ */}
      <section id="home" className="lp-hero">
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '880px', width: '100%' }}>
          <h1>
            Carbon Footprint<br />
            <span className="accent">Awareness Platform</span>
          </h1>

          <p className="lp-hero-sub">Understand, Track, and Reduce Your Carbon Footprint</p>

          <p className="lp-hero-desc">
            This platform helps individuals measure their environmental impact, monitor carbon emissions
            from daily activities, and receive personalized recommendations for living a more sustainable
            lifestyle. By making small changes in transportation, energy consumption, food choices, and
            waste management, users can contribute to a healthier planet.
          </p>

          <div className="lp-hero-btns">
            <button className="lp-hero-btn-primary" onClick={openSignup}>🚀 Get Started</button>
            <button className="lp-hero-btn-secondary" onClick={() => scrollTo('#features')}>🧮 Calculate My Footprint</button>
          </div>


        </div>
      </section>

      {/* ══ ABOUT US ══ */}
      <section id="about" className="lp-section" style={{ background: 'white' }}>
        <div className="lp-section-inner">
          <div className="lp-about-grid">
            <div className="lp-about-img">
              <img
                src="https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80"
                alt="Green forest representing sustainability"
              />
              <div className="lp-about-img-badge">
                <span style={{ fontSize: 32 }}>🌱</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#166534' }}>Est. 2024</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Building a greener future</div>
                </div>
              </div>
            </div>

            <div>
              <span className="lp-section-tag">About Us</span>
              <h2 className="lp-section-title">Empowering a Sustainable Future</h2>
              <p className="lp-section-sub" style={{ marginBottom: 16 }}>
                Our mission is to raise awareness about climate change and empower people to make
                environmentally responsible decisions.
              </p>
              <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.8, marginBottom: 28 }}>
                The Carbon Footprint Awareness Platform provides easy-to-understand insights, carbon
                emission tracking, sustainability education, and actionable recommendations to help
                users reduce their environmental impact. We believe small individual actions, when
                multiplied across millions of people, create extraordinary global change.
              </p>

              <div className="lp-about-pillars">
                {PILLARS.map(p => (
                  <div key={p.title} className="lp-pillar">
                    <span className="lp-pillar-icon">{p.icon}</span>
                    <div>
                      <h4>{p.title}</h4>
                      <p>{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" className="lp-section" style={{ background: '#f0fdf4' }}>
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <span className="lp-section-tag">Features</span>
            <h2 className="lp-section-title">Everything You Need to Go Green</h2>
            <p className="lp-section-sub">A complete toolkit to understand, track, and reduce your environmental impact.</p>
          </div>
          <div className="lp-features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="lp-feature-card">
                <div className="lp-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="lp-section" style={{ background: 'white' }}>
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <span className="lp-section-tag">How It Works</span>
            <h2 className="lp-section-title">Start Reducing in 3 Simple Steps</h2>
            <p className="lp-section-sub">Get up and running in minutes. No technical knowledge required.</p>
          </div>
          <div className="lp-steps">
            {STEPS.map(s => (
              <div key={s.num} className="lp-step">
                <div className="lp-step-num">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA inside section */}
          <div style={{ textAlign: 'center', marginTop: 56 }}>
            <button className="lp-hero-btn-primary" onClick={openSignup} style={{ padding: '14px 40px', fontSize: 15 }}>
              Start For Free — It Takes 1 Minute →
            </button>
          </div>
        </div>
      </section>

      {/* ══ CONTACT US ══ */}
      <section id="contact" className="lp-section" style={{ background: 'white' }}>
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <span className="lp-section-tag">Contact Us</span>
            <h2 className="lp-section-title">Get in Touch</h2>
            <p className="lp-section-sub">Have questions or feedback? We'd love to hear from you.</p>
          </div>

          <div className="lp-contact-grid">
            {/* Contact info */}
            <div>
              <div className="lp-contact-info-item">
                <div className="lp-contact-info-icon">📧</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1f2937', marginBottom: 4 }}>Email Us</div>
                  <div style={{ color: '#6b7280', fontSize: 14 }}>hello@ecotrack.io</div>
                  <div style={{ color: '#6b7280', fontSize: 14 }}>support@ecotrack.io</div>
                </div>
              </div>
              <div className="lp-contact-info-item">
                <div className="lp-contact-info-icon lp-contact-info-icon-blue">📞</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1f2937', marginBottom: 4 }}>Call Us</div>
                  <div style={{ color: '#6b7280', fontSize: 14 }}>+1 (555) 123-4567</div>
                  <div style={{ color: '#6b7280', fontSize: 14 }}>Mon–Fri, 9am–6pm EST</div>
                </div>
              </div>
              <div className="lp-contact-info-item">
                <div className="lp-contact-info-icon" style={{ background: 'linear-gradient(135deg,#8b5cf6,#a78bfa)' }}>📍</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1f2937', marginBottom: 4 }}>Visit Us</div>
                  <div style={{ color: '#6b7280', fontSize: 14 }}>123 Green Street, Eco City</div>
                  <div style={{ color: '#6b7280', fontSize: 14 }}>San Francisco, CA 94102</div>
                </div>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#374151', marginBottom: 12 }}>Follow Us</div>
                <div className="lp-contact-social">
                  {[
                    { icon: '🐦', label: 'Twitter' },
                    { icon: '💼', label: 'LinkedIn' },
                    { icon: '📸', label: 'Instagram' },
                    { icon: '👥', label: 'Facebook' },
                    { icon: '▶️', label: 'YouTube' },
                  ].map(s => (
                    <a key={s.label} href="#" className="lp-social-btn" title={s.label}>{s.icon}</a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className="lp-contact-form">
              <h3 style={{ fontWeight: 700, fontSize: 20, color: '#1f2937', marginBottom: 24 }}>Send a Message</h3>
              {contactSent ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                  <h3 style={{ fontWeight: 700, color: '#166534', marginBottom: 8 }}>Message Sent!</h3>
                  <p style={{ color: '#6b7280', fontSize: 14 }}>We'll get back to you within 24 hours.</p>
                  <button onClick={() => setContactSent(false)} style={{ marginTop: 20, padding: '10px 24px', borderRadius: 8, border: 'none', background: '#f0fdf4', color: '#16a34a', fontWeight: 600, cursor: 'pointer' }}>Send Another</button>
                </div>
              ) : (
                <form onSubmit={handleContact}>
                  <div className="lp-form-group">
                    <label className="lp-form-label">Your Name *</label>
                    <input className="lp-form-input" placeholder="John Doe" required value={contactForm.name}
                      onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="lp-form-group">
                    <label className="lp-form-label">Email Address *</label>
                    <input type="email" className="lp-form-input" placeholder="john@example.com" required value={contactForm.email}
                      onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="lp-form-group">
                    <label className="lp-form-label">Message *</label>
                    <textarea className="lp-form-textarea" placeholder="How can we help you?" required value={contactForm.message}
                      onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))} />
                  </div>
                  <button type="submit" className="lp-submit-btn" disabled={contactLoading}>
                    {contactLoading ? '⏳ Sending...' : '📨 Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══ */}
      <section className="lp-cta">
        <div className="lp-cta-orb" style={{ width: 500, height: 500, top: -200, right: -150 }} />
        <div className="lp-cta-orb" style={{ width: 300, height: 300, bottom: -100, left: -80 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🌍</div>
          <h2>Ready to Make a Difference?</h2>
          <p>Join thousands already reducing their carbon footprint. Free, simple, and the planet will thank you.</p>
          <div className="lp-cta-btns">
            <button className="lp-cta-btn-primary" onClick={openSignup}>Create Free Account →</button>
            <button className="lp-cta-btn-secondary" onClick={openLogin}>Log In</button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="lp-footer">
        <div className="lp-footer-grid">
          <div className="lp-footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#16a34a,#22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🌿</div>
              <span style={{ fontWeight: 800, fontSize: 17, color: 'white' }}>EcoTrack</span>
            </div>
            <p>Empowering individuals to understand, track, and reduce their carbon footprint for a healthier planet.</p>
            <div className="lp-contact-social" style={{ marginTop: 16 }}>
              {['🐦','💼','📸','👥'].map(i => <a key={i} href="#" className="lp-social-btn" style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)' }}>{i}</a>)}
            </div>
          </div>

          <div className="lp-footer-col">
            <h4>Quick Links</h4>
            {['Home','About Us','Features','How It Works','Contact Us'].map(l => (
              <a key={l} href="#" className="lp-footer-link">{l}</a>
            ))}
          </div>

          <div className="lp-footer-col">
            <h4>Platform</h4>
            {['Dashboard','Calculator','Recommendations','Goal Tracking','Community'].map(l => (
              <a key={l} href="#" className="lp-footer-link" onClick={e => { e.preventDefault(); openLogin(); }}>{l}</a>
            ))}
          </div>

          <div className="lp-footer-col">
            <h4>Legal</h4>
            {['Privacy Policy','Terms of Service','Cookie Policy','Data Security','GDPR Compliance'].map(l => (
              <a key={l} href="#" className="lp-footer-link">{l}</a>
            ))}
          </div>
        </div>

        <div className="lp-footer-bottom">
          <span>© 2024 EcoTrack — Carbon Footprint Awareness Platform. All rights reserved.</span>
          <span>🌱 Built for a sustainable future</span>
        </div>
      </footer>

      {/* ══ AUTH MODAL ══ */}
      {showAuth && (
        <div className="lp-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAuth(false); }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '460px' }}>
            <button className="lp-modal-close" onClick={() => setShowAuth(false)}>✕</button>
            <AuthPage defaultTab={authTab} onSuccess={() => setShowAuth(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
