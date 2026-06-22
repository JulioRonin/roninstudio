"use client";

import { useState } from "react";
import { content, type Lang } from "@/lib/content";

const GENBA_APP_URL = "#"; // TODO: enlace a registro/demo de GENBA
const KANRI_URL = "#"; // TODO: enlace a Kanri / solicitar demo

export default function Home() {
  const [lang, setLang] = useState<Lang>("es");
  const t = content[lang];

  return (
    <main className="relative">
      <Nav t={t.nav} lang={lang} setLang={setLang} />
      <Hero t={t.hero} />
      <Pillars t={t.pillars} />
      <Products t={t.products} />
      <CaseStudy t={t.caseStudy} />
      <Founder t={t.founder} />
      <FinalCta t={t.finalCta} />
      <Footer t={t.footer} nav={t.nav} />
    </main>
  );
}

/* ---------------- NAV ---------------- */
function Nav({
  t,
  lang,
  setLang,
}: {
  t: (typeof content)["es"]["nav"];
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-line)] bg-[var(--color-bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <a href="#top" className="flex items-center gap-2 font-extrabold tracking-tight">
          <Logo />
          <span className="text-lg">Ronin<span className="text-accent-gradient"> Studio</span></span>
        </a>
        <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--color-ink-soft)] md:flex">
          <a href="#productos" className="hover:text-[var(--color-accent)]">{t.products}</a>
          <a href="#caso" className="hover:text-[var(--color-accent)]">{t.case}</a>
          <a href="#about" className="hover:text-[var(--color-accent)]">{t.about}</a>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            className="pill px-3 py-1.5 text-xs font-semibold text-[var(--color-ink-soft)] transition hover:text-[var(--color-accent)]"
            aria-label="Toggle language"
          >
            {lang === "es" ? "EN" : "ES"}
          </button>
          <a
            href="mailto:ibarra.julio800@gmail.com"
            className="rounded-full accent-gradient px-4 py-2 text-sm font-semibold text-[var(--color-bg)] shadow-[var(--shadow-soft)] transition hover:opacity-90"
          >
            {t.cta}
          </a>
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl accent-gradient text-[var(--color-bg)] font-black">
      廾
    </span>
  );
}

/* ---------------- HERO ---------------- */
function Hero({ t }: { t: (typeof content)["es"]["hero"] }) {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
        <div className="animate-rise">
          <span className="pill inline-block px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)]">
            {t.badge}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-[3.4rem]">
            {t.title} <span className="text-accent-gradient">{t.titleAccent}</span> {t.titleEnd}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-[var(--color-muted)]">{t.sub}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#productos" className="rounded-full accent-gradient px-6 py-3 font-semibold text-[var(--color-bg)] shadow-[var(--shadow-soft)] transition hover:opacity-90">
              {t.ctaPrimary}
            </a>
            <a href="mailto:ibarra.julio800@gmail.com" className="rounded-full border border-[var(--color-line)] bg-white/[0.03] px-6 py-3 font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)]">
              {t.ctaSecondary}
            </a>
          </div>
          <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
            <Stat big={t.stat1} label={t.stat1Label} />
            <Stat big={t.stat2} label={t.stat2Label} />
            <Stat big={t.stat3} label={t.stat3Label} />
          </div>
        </div>

        <div className="relative animate-rise">
          <HeroMock />
        </div>
      </div>
    </section>
  );
}

function Stat({ big, label }: { big: string; label: string }) {
  return (
    <div>
      <div className="text-xl font-extrabold text-[var(--color-ink)]">{big}</div>
      <div className="mt-1 text-xs leading-snug text-[var(--color-muted)]">{label}</div>
    </div>
  );
}

function HeroMock() {
  return (
    <div className="card-solid relative animate-floaty p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-red)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-amber)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-green)]" />
        </div>
        <span className="pill px-2.5 py-1 text-[10px] font-semibold text-[var(--color-muted)]">GENBA · Yamazumi</span>
      </div>
      <div className="mt-5 flex items-end gap-3" aria-hidden>
        {[
          { h: 60, c: "var(--color-green)", l: "Est.1" },
          { h: 92, c: "var(--color-red)", l: "Est.2" },
          { h: 48, c: "var(--color-green)", l: "Est.3" },
          { h: 74, c: "var(--color-amber)", l: "Est.4" },
          { h: 55, c: "var(--color-green)", l: "Est.5" },
        ].map((b, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-44 w-full items-end overflow-hidden rounded-xl bg-[var(--color-surface-2)]">
              <div className="w-full rounded-xl transition-all" style={{ height: `${b.h}%`, background: b.c }} />
            </div>
            <span className="text-[10px] font-semibold text-[var(--color-muted)]">{b.l}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <MiniKpi k="Takt" v="92 s" />
        <MiniKpi k="Cuello" v="Est. 2" />
        <MiniKpi k="Efic." v="78%" />
      </div>
    </div>
  );
}

function MiniKpi({ k, v }: { k: string; v: string }) {
  return (
    <div className="surface rounded-2xl px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wide text-[var(--color-muted)]">{k}</div>
      <div className="text-base font-extrabold text-[var(--color-ink)]">{v}</div>
    </div>
  );
}

/* ---------------- PILLARS ---------------- */
function Pillars({ t }: { t: (typeof content)["es"]["pillars"] }) {
  return (
    <section className="border-y border-[var(--color-line)] bg-white/[0.015]">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="max-w-xl text-2xl font-extrabold tracking-tight md:text-3xl">{t.title}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {t.items.map((it) => (
            <div key={it.t} className="card p-6">
              <h3 className="text-lg font-bold text-[var(--color-ink)]">{it.t}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- PRODUCTS ---------------- */
function Products({ t }: { t: (typeof content)["es"]["products"] }) {
  const g = t.genba;
  const k = t.kanri;
  return (
    <section id="productos" className="mx-auto max-w-6xl px-5 py-20">
      <Kicker>{t.kicker}</Kicker>
      <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight md:text-4xl">{t.title}</h2>
      <p className="mt-3 max-w-2xl text-[var(--color-muted)]">{t.sub}</p>

      {/* GENBA — principal */}
      <div className="ring-accent mt-10 rounded-[1.25rem] bg-[var(--color-surface)] p-7 md:p-9">
        <div className="grid gap-8 md:grid-cols-[1fr_0.9fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-full accent-gradient px-3 py-1 text-xs font-bold text-[var(--color-bg)]">{g.tag}</span>
              <span className="text-2xl font-extrabold tracking-tight">{g.name}</span>
            </div>
            <p className="mt-4 text-xl font-semibold leading-snug text-[var(--color-ink)]">{g.tagline}</p>
            <p className="mt-2 text-sm text-[var(--color-accent)]">{g.forWho}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href={GENBA_APP_URL} className="rounded-full accent-gradient px-6 py-3 font-semibold text-[var(--color-bg)] transition hover:opacity-90">
                {g.cta}
              </a>
              <span className="text-sm text-[var(--color-muted)]">{g.price}</span>
            </div>
          </div>
          <div className="grid gap-3">
            {g.steps.map((s) => (
              <div key={s.n} className="surface flex gap-4 rounded-2xl p-4">
                <span className="text-accent-gradient text-xl font-extrabold">{s.n}</span>
                <div>
                  <div className="font-bold">{s.t}</div>
                  <div className="text-sm text-[var(--color-muted)]">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kanri — secundario */}
      <div className="card mt-6 p-7 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="pill px-3 py-1 text-xs font-bold text-[var(--color-muted)]">{k.tag}</span>
              <span className="text-xl font-extrabold tracking-tight">{k.name}</span>
            </div>
            <p className="mt-3 text-[var(--color-ink-soft)]">{k.tagline}</p>
            <a href={KANRI_URL} className="mt-5 inline-block rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
              {k.cta} →
            </a>
          </div>
          <div>
            <div className="surface rounded-xl px-4 py-3 text-xs font-semibold text-[var(--color-ink-soft)]">
              {k.flow}
            </div>
            <ul className="mt-4 space-y-2">
              {k.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- CASE STUDY ---------------- */
function CaseStudy({ t }: { t: (typeof content)["es"]["caseStudy"] }) {
  return (
    <section id="caso" className="border-y border-[var(--color-line)] bg-white/[0.015]">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <Kicker>{t.kicker}</Kicker>
        <h2 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight md:text-4xl">{t.title}</h2>
        <p className="mt-3 max-w-2xl text-[var(--color-muted)]">{t.sub}</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {t.points.map((p) => (
            <div key={p.t} className="card p-6">
              <h3 className="font-bold text-[var(--color-ink)]">{p.t}</h3>
              <p className="mt-1.5 text-sm text-[var(--color-muted)]">{p.d}</p>
            </div>
          ))}
        </div>
        <div className="card-solid mt-8 p-7 md:p-9">
          <p className="text-xl font-semibold leading-snug text-[var(--color-ink)] md:text-2xl">{t.quote}</p>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FOUNDER ---------------- */
function Founder({ t }: { t: (typeof content)["es"]["founder"] }) {
  return (
    <section id="about" className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 md:grid-cols-[0.8fr_1.2fr]">
      <div className="card-solid flex aspect-square items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl accent-gradient text-5xl font-extrabold text-[var(--color-bg)]">JR</div>
          <div className="mt-4 text-lg font-extrabold">Julio Ronin</div>
          <div className="text-sm text-[var(--color-muted)]">Ronin Studio · Cd. Juárez</div>
        </div>
      </div>
      <div>
        <Kicker>{t.kicker}</Kicker>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">{t.title}</h2>
        <p className="mt-1 font-semibold text-[var(--color-accent)]">{t.role}</p>
        <p className="mt-4 text-[var(--color-muted)]">{t.body}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {t.tags.map((tag) => (
            <span key={tag} className="pill px-3 py-1.5 text-xs font-semibold text-[var(--color-ink-soft)]">{tag}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FINAL CTA ---------------- */
function FinalCta({ t }: { t: (typeof content)["es"]["finalCta"] }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <div className="card-solid relative overflow-hidden p-10 text-center md:p-16">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full accent-gradient opacity-25 blur-3xl" />
        <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">{t.title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-[var(--color-muted)]">{t.sub}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={GENBA_APP_URL} className="rounded-full accent-gradient px-7 py-3 font-semibold text-[var(--color-bg)] shadow-[var(--shadow-soft)] transition hover:opacity-90">
            {t.ctaPrimary}
          </a>
          <a href="mailto:ibarra.julio800@gmail.com" className="rounded-full border border-[var(--color-line)] bg-white/[0.03] px-7 py-3 font-semibold transition hover:border-[var(--color-accent)]">
            {t.ctaSecondary}
          </a>
        </div>
        <p className="mt-6 text-sm text-[var(--color-muted)]">{t.contact}</p>
      </div>
    </section>
  );
}

/* ---------------- FOOTER ---------------- */
function Footer({
  t,
  nav,
}: {
  t: (typeof content)["es"]["footer"];
  nav: (typeof content)["es"]["nav"];
}) {
  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-bg-2)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 font-extrabold">
            <Logo />
            Ronin Studio
          </div>
          <p className="mt-3 max-w-xs text-sm text-[var(--color-muted)]">{t.tagline}</p>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">{t.products}</div>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-ink-soft)]">
            <li><a href="#productos" className="hover:text-[var(--color-accent)]">GENBA</a></li>
            <li><a href="#productos" className="hover:text-[var(--color-accent)]">Kanri</a></li>
            <li><a href="#caso" className="hover:text-[var(--color-accent)]">{nav.case}</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">{t.company}</div>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-ink-soft)]">
            <li><a href="#about" className="hover:text-[var(--color-accent)]">{nav.about}</a></li>
            <li><a href="mailto:ibarra.julio800@gmail.com" className="hover:text-[var(--color-accent)]">Contacto</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--color-line)]">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-[var(--color-muted)]">
          © {new Date().getFullYear()} Ronin Studio · Ciudad Juárez, Chihuahua, México. {t.rights}
        </p>
      </div>
    </footer>
  );
}

/* ---------------- shared ---------------- */
function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <span className="pill inline-block px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-accent)]">
      {children}
    </span>
  );
}
