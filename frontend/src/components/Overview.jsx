import React, { useState, useEffect, useRef } from 'react';

/* ---------- Typewriter: types out text once `start` becomes true ---------- */
function Typewriter({ text, start, speed = 32, className = '' }) {
  const [displayed, setDisplayed] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (!start || started.current) return;
    started.current = true;
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [start, text, speed]);

  const done = displayed.length >= text.length;

  return (
    <span className={className}>
      {displayed}
      <span
        aria-hidden="true"
        className={`inline-block w-[0.06em] h-[0.85em] ml-1 align-middle bg-current motion-reduce:hidden transition-opacity duration-200 ${
          done ? 'opacity-0' : 'opacity-100 animate-pulse'
        }`}
      />
      {/* keeps layout/accessibility intact even before/while typing */}
      <span className="sr-only">{text}</span>
    </span>
  );
}

/* ---------- CountUp: animates a number from 0 to target once `start` is true ---------- */
function CountUp({ target, decimals = 0, prefix = '', suffix = '', start, duration = 1300 }) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!start || started.current) return;
    started.current = true;
    const startTime = performance.now();
    let frame;
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setValue(target * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, target, duration]);

  return (
    <span>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ---------- Reveal: fades + slides content up into place ---------- */
function Reveal({ visible, delay = 0, as: Tag = 'div', className = '', children }) {
  return (
    <Tag
      className={`transition-[opacity,transform] duration-700 ease-out will-change-transform motion-reduce:transition-none motion-reduce:transform-none ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </Tag>
  );
}

export default function Overview() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [revealed, setRevealed] = useState({});
  const [sidebarIn, setSidebarIn] = useState(false);
  const sectionRefs = useRef({});
  const revealRefs = useRef({});

  // Sidebar entrance, shortly after mount
  useEffect(() => {
    const t = setTimeout(() => setSidebarIn(true), 150);
    return () => clearTimeout(t);
  }, []);

  // Scroll-spy observer: tracks which section is active for the sidebar
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-30% 0px -60% 0px'
      }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // Reveal observer: fires each section's entrance animation once, the first
  // time it scrolls into view, then stops watching it
  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = Object.keys(revealRefs.current).find(
              (key) => revealRefs.current[key] === entry.target
            );
            if (id) {
              setRevealed((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
            }
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -15% 0px' }
    );

    Object.values(revealRefs.current).forEach((ref) => {
      if (ref) revealObserver.observe(ref);
    });

    return () => revealObserver.disconnect();
  }, []);

  const scrollToSection = (id) => {
    const element = sectionRefs.current[id];
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navItems = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'problem', label: 'Problem We Are Solving' },
    { id: 'solution', label: 'Solution' },
    { id: 'why-us', label: 'Why Us' }
  ];

  // Registers an element with both observers under the same id
  const registerSection = (id) => (el) => {
    sectionRefs.current[id] = el;
    revealRefs.current[id] = el;
  };

  return (
    <section className="w-full bg-transparent pt-24 pb-16 relative z-20">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div
        className="w-[95%] mx-auto w-full bg-gray-200 flex flex-col relative shadow-[0_20px_50px_rgba(255,255,255,0.05)]"
        style={{ borderRadius: '2.5rem' }}
      >
        {/* Big title: typewriter runs once the block scrolls into view */}
        <div
          ref={registerSection('overview-title')}
          className="w-full flex justify-center pt-16 md:pt-24 pb-12 md:pb-16"
        >
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-bold text-[#1e1b4b] uppercase tracking-tight text-center px-4 min-h-[1.2em]">
            <Typewriter text="Overview" start={!!revealed['overview-title']} speed={90} />
          </h2>
        </div>

        {/* 1:3 Layout Container */}
        <div className="max-w-7xl mx-auto w-full px-6 md:px-16 pb-24 md:pb-32 flex flex-col lg:flex-row gap-12 lg:gap-16 relative">
          {/* LEFT COLUMN: Sticky Sidebar */}
          <div className="w-full lg:w-1/4 self-start sticky top-32 hidden md:block">
            <nav
              className={`flex flex-col bg-white p-8 rounded-2xl shadow-sm space-y-6 border border-white/50 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
                sidebarIn ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
              }`}
            >
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`text-left text-lg font-medium transition-all duration-300 relative ${
                      isActive
                        ? 'text-blue-600 translate-x-2'
                        : 'text-slate-500 hover:text-slate-800 hover:translate-x-1'
                    }`}
                  >
                    {/* Indicator stays mounted and animates opacity/scale for a smoother handoff between items */}
                    <span
                      aria-hidden="true"
                      className={`absolute -left-8 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-600 rounded-r-full origin-center transition-all duration-500 ease-out motion-reduce:transition-none ${
                        isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50'
                      }`}
                    />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* RIGHT COLUMN: Scrollable Details */}
          <div className="w-full lg:w-3/4 flex flex-col gap-20 md:gap-32">
            {/* 1. Introduction */}
            <div id="introduction" ref={registerSection('introduction')} className="scroll-mt-32">
              <h3 className="text-2xl sm:text-4xl font-bold text-[#1e1b4b] mb-6 min-h-[1.2em]">
                <Typewriter text="Introduction" start={!!revealed['introduction']} />
              </h3>
              <Reveal visible={!!revealed['introduction']} delay={150}>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
                  The maritime shipping industry is the backbone of global trade, responsible for
                  moving over 80% of the world's cargo. However, predicting freight rates, securing
                  the optimal vessel class, and estimating port turnaround times remains a highly
                  volatile and manual process. Our SIH26006 intelligent forecaster digitizes and
                  automates this complex ecosystem.
                </p>
              </Reveal>
              <Reveal visible={!!revealed['introduction']} delay={320}>
                <img
                  src="https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&q=80&w=1200"
                  alt="Cargo ship at sea"
                  loading="lazy" decoding="async" className="w-full h-60 sm:h-80 object-cover rounded-2xl shadow-lg"
                />
              </Reveal>
            </div>

            {/* 2. Problem We Are Solving */}
            <div id="problem" ref={registerSection('problem')} className="scroll-mt-32">
              <h3 className="text-2xl sm:text-4xl font-bold text-[#1e1b4b] mb-6 min-h-[1.2em]">
                <Typewriter text="Problem We Are Solving" start={!!revealed['problem']} />
              </h3>
              <Reveal visible={!!revealed['problem']} delay={150}>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
                  Chartering a vessel involves massive financial risk. Supply chain managers often
                  scramble to secure capacity without deep visibility into shifting market rates,
                  seasonal constraints, or sudden port congestion.
                </p>
              </Reveal>
              <Reveal visible={!!revealed['problem']} delay={280}>
                <ul className="list-disc pl-6 text-base sm:text-lg text-slate-600 leading-relaxed space-y-3 mb-8">
                  <li><strong>Freight Volatility:</strong> Unpredictable spikes in spot market rates.</li>
                  <li><strong>Port Constraints:</strong> Physical limitations like draft depth and beam size that restrict certain vessels (e.g., Capesize vs. Panamax).</li>
                  <li><strong>Idle Time:</strong> Costly delays caused by unforeseen congestion or weather events at destination ports.</li>
                </ul>
              </Reveal>
              <Reveal visible={!!revealed['problem']} delay={410}>
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200"
                  alt="Stacked shipping containers at a port"
                  loading="lazy" decoding="async" className="w-full h-60 sm:h-80 object-cover rounded-2xl shadow-lg"
                />
              </Reveal>
            </div>

            {/* 3. Solution */}
            <div id="solution" ref={registerSection('solution')} className="scroll-mt-32">
              <h3 className="text-2xl sm:text-4xl font-bold text-[#1e1b4b] mb-6 min-h-[1.2em]">
                <Typewriter text="Solution" start={!!revealed['solution']} />
              </h3>
              <Reveal visible={!!revealed['solution']} delay={150}>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
                  Our dashboard ingests real-time commodity demands, global vessel availability, and
                  port analytics to output actionable insights. By feeding cargo volume and port
                  constraints into our engine, the system automatically:
                </p>
              </Reveal>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Reveal visible={!!revealed['solution']} delay={280}>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 h-full">
                    <h4 className="font-bold text-[#1e1b4b] mb-2">Vessel Matching</h4>
                    <p className="text-slate-600 text-sm sm:text-base">Recommends the most economical vessel type that physically fits the origin and destination ports.</p>
                  </div>
                </Reveal>
                <Reveal visible={!!revealed['solution']} delay={380}>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 h-full">
                    <h4 className="font-bold text-[#1e1b4b] mb-2">Rate Forecasting</h4>
                    <p className="text-slate-600 text-sm sm:text-base">Predicts future freight rates to identify the optimal time window to enter a chartering contract.</p>
                  </div>
                </Reveal>
              </div>
              <Reveal visible={!!revealed['solution']} delay={480}>
                <img
                  src="https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=1200"
                  alt="Logistics network data overlay"
                  loading="lazy" decoding="async" className="w-full h-60 sm:h-80 object-cover rounded-2xl shadow-lg"
                />
              </Reveal>
            </div>

            {/* 4. Why Us */}
            <div id="why-us" ref={registerSection('why-us')} className="scroll-mt-32">
              <h3 className="text-2xl sm:text-4xl font-bold text-[#1e1b4b] mb-6 min-h-[1.2em]">
                <Typewriter text="Why Us" start={!!revealed['why-us']} />
              </h3>
              <Reveal visible={!!revealed['why-us']} delay={150}>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
                  While existing tools offer fragmented data, we provide a unified intelligence
                  layer. We don't just show you data; our predictive model mitigates your risk by
                  alerting you to congestion and suggesting alternative employment options for your
                  cargo.
                </p>
              </Reveal>
              {/* Feature Grid: numbers count up once this block is on screen */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-slate-900 border-t border-slate-200 pt-8 mt-8">
                <Reveal visible={!!revealed['why-us']} delay={300}>
                  <div>
                    <h4 className="text-2xl sm:text-3xl font-extrabold mb-2 text-[#1e1b4b]">
                      <CountUp target={72.6} decimals={1} suffix="%" start={!!revealed['why-us']} />
                    </h4>
                    <p className="text-xs sm:text-sm font-medium text-slate-500">Prediction Accuracy vs Historicals</p>
                  </div>
                </Reveal>
                <Reveal visible={!!revealed['why-us']} delay={420}>
                  <div>
                    <h4 className="text-2xl sm:text-3xl font-extrabold mb-2 text-[#1e1b4b]">
                      <CountUp target={400} decimals={0} suffix="+" start={!!revealed['why-us']} />
                    </h4>
                    <p className="text-xs sm:text-sm font-medium text-slate-500">Global Ports Monitored</p>
                  </div>
                </Reveal>
                <Reveal visible={!!revealed['why-us']} delay={540}>
                  <div>
                    <h4 className="text-2xl sm:text-3xl font-extrabold mb-2 text-[#1e1b4b]">
                      <CountUp target={2} decimals={0} prefix="< " suffix="s" start={!!revealed['why-us']} />
                    </h4>
                    <p className="text-xs sm:text-sm font-medium text-slate-500">Inference &amp; Routing Time</p>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
