import { createFileRoute, Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { FEATURED_DEBATES, type FeaturedDebate } from '@/data/featured-debates'

export const Route = createFileRoute('/')({ component: HomePage })

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMonogram(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getMonogramColors(id: string) {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const palettes = [
    { bg: 'oklch(0.30 0.04 38)', border: 'oklch(0.60 0.11 42)' },
    { bg: 'oklch(0.30 0.04 55)', border: 'oklch(0.60 0.11 58)' },
    { bg: 'oklch(0.30 0.03 30)', border: 'oklch(0.60 0.10 34)' },
    { bg: 'oklch(0.30 0.05 45)', border: 'oklch(0.62 0.12 48)' },
    { bg: 'oklch(0.30 0.04 25)', border: 'oklch(0.60 0.10 28)' },
  ]
  return palettes[hash % palettes.length]
}

// ─── FeaturedDebateCard ───────────────────────────────────────────────────────

function FeaturedDebateCard({ debate }: { debate: FeaturedDebate }) {
  const [idA, idB] = debate.characterIds
  const [nameA, nameB] = debate.characterNames
  const colorsA = getMonogramColors(idA)
  const colorsB = getMonogramColors(idB)

  const params = new URLSearchParams({
    characters: debate.characterIds.join(','),
    topic: debate.topic,
    format: debate.format,
  })

  return (
    <a
      href={`/debate/new?${params}`}
      className={cn(
        'group relative flex flex-col gap-5 p-6 rounded border',
        'bg-[#231d12] border-[#3e3020]',
        'transition-all duration-300 ease-out',
        'hover:border-[#c9a458]/40 hover:bg-[#281f13]',
        'hover:shadow-[0_4px_40px_rgba(201,164,88,0.06)]',
      )}
    >
      {/* Top accent on hover */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a458]/0 to-transparent transition-all duration-500 group-hover:via-[#c9a458]/35" />

      {/* Character pair */}
      <div className="flex items-center gap-3">
        {/* Overlapping monograms */}
        <div className="relative flex-shrink-0">
          <div
            className="w-11 h-11 rounded-full border flex items-center justify-center"
            style={{ background: colorsA.bg, borderColor: colorsA.border }}
          >
            <span
              className="text-[#e8c97a] tracking-[0.08em]"
              style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: '13px' }}
            >
              {getMonogram(nameA)}
            </span>
          </div>
          <div
            className="absolute -right-3 top-0 w-11 h-11 rounded-full border flex items-center justify-center"
            style={{ background: colorsB.bg, borderColor: colorsB.border }}
          >
            <span
              className="text-[#e8c97a] tracking-[0.08em]"
              style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: '13px' }}
            >
              {getMonogram(nameB)}
            </span>
          </div>
        </div>

        {/* Names */}
        <div className="ml-6">
          <p
            className="text-[#d0c8b8] leading-tight"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '17px' }}
          >
            {nameA}
          </p>
          <p
            className="text-[#8e7e66] leading-tight"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '12px', letterSpacing: '0.12em' }}
          >
            vs. {nameB}
          </p>
        </div>

        {/* Format badge */}
        <span
          className="ml-auto flex-shrink-0 px-2 py-0.5 border border-[#46382a] text-[#8e7e66] rounded-sm tracking-[0.18em] uppercase hidden sm:block"
          style={{ fontFamily: '"EB Garamond", serif', fontSize: '9px' }}
        >
          {debate.format === 'lincoln-douglas' ? 'L-D' : debate.format}
        </span>
      </div>

      {/* Topic */}
      <div className="border-t border-[#30261a] pt-4">
        <p
          className="text-[#f0e8d8] leading-snug italic mb-2 transition-colors group-hover:text-[#e8d8b0]"
          style={{ fontFamily: '"EB Garamond", serif', fontSize: '15px', lineHeight: 1.55 }}
        >
          "{debate.topic}"
        </p>
        <p
          className="text-[#a09070] leading-relaxed"
          style={{ fontFamily: '"EB Garamond", serif', fontSize: '13px', lineHeight: 1.6 }}
        >
          {debate.description}
        </p>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-end mt-auto">
        <span
          className="text-[#7c6c54] group-hover:text-[#c9a458]/70 transition-colors"
          style={{ fontFamily: '"EB Garamond", serif', fontSize: '12px', letterSpacing: '0.1em' }}
        >
          Start this debate →
        </span>
      </div>
    </a>
  )
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

function HomePage() {
  return (
    <div className="min-h-screen bg-[#1c1710]">
      {/* Top rule */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#c9a458]/20 to-transparent" />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#30261a]">
        <div className="flex items-center gap-2">
          <span className="text-[#c9a458]/50 text-xs">◆</span>
          <span
            className="text-[#9e8e72] tracking-[0.2em] uppercase"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '12px' }}
          >
            Grand Council
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/characters"
            className="text-[#8e7e66] hover:text-[#9e8e72] transition-colors"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '13px', letterSpacing: '0.08em' }}
          >
            The Summoned
          </Link>
          <Link
            to="/debate/new"
            className={cn(
              'px-4 py-1.5 border border-[#c9a458]/30 rounded-sm',
              'text-[#c9a458]/70 hover:text-[#c9a458] hover:border-[#c9a458]/60',
              'transition-all duration-200',
            )}
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '12px', letterSpacing: '0.15em' }}
          >
            Begin Debate →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative px-6 pt-20 pb-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_0%,rgba(201,164,88,0.05),transparent)]" />
        <div className="relative max-w-3xl mx-auto">

          {/* Ornamental header */}
          <div className="flex items-center justify-center gap-5 mb-7">
            <div className="flex-1 max-w-24 h-px bg-gradient-to-r from-transparent to-[#c9a458]/20" />
            <span className="text-[#c9a458]/35 text-[11px] tracking-[0.6em]">✦ ✦ ✦</span>
            <div className="flex-1 max-w-24 h-px bg-gradient-to-l from-transparent to-[#c9a458]/20" />
          </div>

          <p
            className="text-[#c9a458]/50 mb-4 tracking-[0.5em] uppercase"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '11px' }}
          >
            Est. Since Antiquity
          </p>

          <h1
            className="text-[#f0e8d8] mb-6"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 300,
              fontSize: 'clamp(3.5rem, 9vw, 6.5rem)',
              letterSpacing: '-0.015em',
              lineHeight: 0.95,
            }}
          >
            Grand Council
          </h1>

          <p
            className="text-[#9e8e72] max-w-xl mx-auto leading-relaxed mb-10"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '19px', lineHeight: 1.65 }}
          >
            Watch history's greatest minds argue — or take the floor yourself.
            Philosophy, theology, science, and politics collide across the centuries.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/debate/new"
              className={cn(
                'px-8 py-3.5 bg-[#c9a458] rounded-sm text-[#1c1710]',
                'hover:bg-[#d4b46a] transition-all duration-200',
                'hover:shadow-[0_0_40px_rgba(201,164,88,0.25)]',
                'tracking-[0.18em] uppercase',
              )}
              style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: '13px' }}
            >
              Begin a Debate
            </Link>
            <Link
              to="/characters"
              className={cn(
                'px-8 py-3.5 border border-[#46382a] rounded-sm',
                'text-[#9e8e72] hover:text-[#c9a458]/80 hover:border-[#c9a458]/30',
                'transition-all duration-200',
                'tracking-[0.18em] uppercase',
              )}
              style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '13px' }}
            >
              Browse the Summoned
            </Link>
          </div>

          {/* Stat strip */}
          <div className="flex items-center justify-center gap-8 mt-12 pt-10 border-t border-[#30261a]">
            {[
              { value: '34', label: 'Historical Figures' },
              { value: '4', label: 'Debate Formats' },
              { value: '∞', label: 'Possible Debates' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p
                  className="text-[#c9a458]/70 leading-none mb-1"
                  style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 300, fontSize: '28px' }}
                >
                  {value}
                </p>
                <p
                  className="text-[#7c6c54] tracking-[0.2em] uppercase"
                  style={{ fontFamily: '"EB Garamond", serif', fontSize: '10px' }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Section divider */}
      <div className="flex items-center gap-4 px-6 max-w-7xl mx-auto mb-10">
        <div className="flex-1 h-px bg-[#352c1c]" />
        <p
          className="text-[#c9a458]/40 tracking-[0.4em] uppercase flex-shrink-0"
          style={{ fontFamily: '"EB Garamond", serif', fontSize: '10px' }}
        >
          Featured Debates
        </p>
        <div className="flex-1 h-px bg-[#352c1c]" />
      </div>

      {/* Featured debates grid */}
      <main className="px-6 max-w-7xl mx-auto pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURED_DEBATES.map((debate) => (
            <FeaturedDebateCard key={debate.id} debate={debate} />
          ))}
        </div>

        {/* Browse CTA */}
        <div className="text-center mt-14">
          <p
            className="text-[#8e7e66] mb-4"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '15px' }}
          >
            Or build your own from 34 historical minds across philosophy, theology, science, and politics.
          </p>
          <Link
            to="/debate/new"
            className={cn(
              'inline-flex items-center gap-2 px-6 py-2.5 border border-[#c9a458]/25 rounded-sm',
              'text-[#c9a458]/60 hover:text-[#c9a458] hover:border-[#c9a458]/50',
              'transition-all duration-200',
              'tracking-[0.15em] uppercase',
            )}
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '12px' }}
          >
            Compose a new debate →
          </Link>
        </div>
      </main>

      {/* Footer rule */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#c9a458]/10 to-transparent" />

      {/* Footer */}
      <footer className="px-6 py-8 text-center">
        <p
          className="text-[#46382a]"
          style={{ fontFamily: '"EB Garamond", serif', fontSize: '12px', letterSpacing: '0.08em' }}
        >
          Grand Council — Historical Debate Simulator
        </p>
      </footer>
    </div>
  )
}
