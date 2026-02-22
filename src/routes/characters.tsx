import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { Search, X } from 'lucide-react'

import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { CharacterProfile } from '@/types/character'

export const Route = createFileRoute('/characters')({
  component: CharacterBrowser,
})

// ─── Constants ───────────────────────────────────────────────────────────────

const ERA_ORDER = [
  'Ancient Greece',
  'Ancient Rome',
  'Renaissance Italy',
  '16th Century',
  '17th Century',
  '18th Century',
  '19th Century',
  '20th Century',
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchCharacters(): Promise<CharacterProfile[]> {
  const res = await fetch('/api/characters')
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

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

// ─── CharacterCard ───────────────────────────────────────────────────────────

interface CardProps {
  character: CharacterProfile
  onClick: () => void
}

function CharacterCard({ character, onClick }: CardProps) {
  const colors = getMonogramColors(character.id)
  const quote = character.sampleQuotes?.[0]

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full text-left rounded overflow-hidden',
        'bg-[#231d12] border border-[#3e3020]',
        'transition-all duration-300 ease-out',
        'hover:border-[#c9a458]/50 hover:bg-[#281f13]',
        'hover:shadow-[0_4px_32px_rgba(201,164,88,0.07)]',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c9a458]/40',
      )}
    >
      {/* Top accent line — reveals on hover */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a458]/0 to-transparent transition-all duration-500 group-hover:via-[#c9a458]/40" />

      <div className="p-6">
        {/* Monogram */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-4 border transition-all duration-300 group-hover:scale-105"
          style={{
            background: colors.bg,
            borderColor: colors.border,
            boxShadow: '0 0 0 0 rgba(201,164,88,0)',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 14px rgba(201,164,88,0.15)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 0 rgba(201,164,88,0)'
          }}
        >
          <span
            className="text-[#e8c97a] text-sm tracking-[0.1em]"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 }}
          >
            {getMonogram(character.name)}
          </span>
        </div>

        {/* Name */}
        <h3
          className="text-[#f0e8d8] text-lg leading-tight mb-1 transition-colors duration-200 group-hover:text-[#e8c97a]"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, letterSpacing: '0.01em' }}
        >
          {character.name}
        </h3>

        {/* Years · Era */}
        <div className="mb-3 space-y-0.5">
          <p
            className="text-[#9e8e72] leading-none"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '12px', letterSpacing: '0.06em' }}
          >
            {character.years}
          </p>
          <p
            className="text-[#c9a458]/60 leading-none"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '11px', letterSpacing: '0.08em' }}
          >
            {character.era}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {character.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 border border-[#46382a] text-[#a89880] rounded-sm"
              style={{ fontFamily: '"EB Garamond", serif', fontSize: '10px', letterSpacing: '0.04em' }}
            >
              {tag}
            </span>
          ))}
          {character.tags.length > 3 && (
            <span
              className="px-1 py-0.5 text-[#8e7e66]"
              style={{ fontFamily: '"EB Garamond", serif', fontSize: '10px' }}
            >
              +{character.tags.length - 3}
            </span>
          )}
        </div>

        {/* Quote */}
        {quote && (
          <div className="border-t border-[#352c1c] pt-3 transition-colors duration-200 group-hover:border-[#46382a]">
            <p
              className="text-[#a89880] leading-relaxed italic line-clamp-2"
              style={{ fontFamily: '"EB Garamond", serif', fontSize: '12px' }}
            >
              "{quote.length > 90 ? quote.slice(0, 87) + '…' : quote}"
            </p>
          </div>
        )}
      </div>

      {/* Corner arrow */}
      <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="text-[#c9a458]/60 text-xs">→</span>
      </div>
    </button>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="w-full bg-[#231d12] border border-[#352c1c] rounded p-6 animate-pulse">
      <div className="w-12 h-12 rounded-full bg-[#352c1c] mb-4" />
      <div className="h-5 bg-[#352c1c] rounded w-3/4 mb-1.5" />
      <div className="h-3 bg-[#30261a] rounded w-1/2 mb-0.5" />
      <div className="h-3 bg-[#30261a] rounded w-2/5 mb-4" />
      <div className="flex gap-1 mb-4">
        <div className="h-4 bg-[#30261a] rounded w-16" />
        <div className="h-4 bg-[#30261a] rounded w-12" />
        <div className="h-4 bg-[#30261a] rounded w-14" />
      </div>
      <div className="border-t border-[#30261a] pt-3 space-y-1.5">
        <div className="h-3 bg-[#30261a] rounded w-full" />
        <div className="h-3 bg-[#30261a] rounded w-4/5" />
      </div>
    </div>
  )
}

// ─── Bio sub-components ───────────────────────────────────────────────────────

function BioSection({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-[#c9a458]/50 text-[10px]">{icon}</span>
        <span
          className="text-[#c9a458]/80 tracking-[0.22em] uppercase"
          style={{ fontFamily: '"EB Garamond", serif', fontSize: '10px', fontWeight: 500 }}
        >
          {label}
        </span>
        <div className="flex-1 h-px bg-[#352c1c]" />
      </div>
      {children}
    </div>
  )
}

function Ornament() {
  return (
    <div className="flex items-center gap-3 py-0.5">
      <div className="flex-1 h-px bg-[#30261a]" />
      <span className="text-[#46382a] text-[8px]">◆</span>
      <div className="flex-1 h-px bg-[#30261a]" />
    </div>
  )
}

// ─── CharacterBio ─────────────────────────────────────────────────────────────

function CharacterBio({
  character,
  open,
  onClose,
}: {
  character: CharacterProfile | null
  open: boolean
  onClose: () => void
}) {
  if (!character) return null
  const colors = getMonogramColors(character.id)

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        className="flex flex-col p-0 gap-0 border-l border-[#46382a] bg-[#1c1710] sm:max-w-lg"
        side="right"
      >
        {/* Accessibility labels (visually hidden) */}
        <SheetTitle className="sr-only">{character.name} — Character Profile</SheetTitle>
        <SheetDescription className="sr-only">
          Historical figure profile, beliefs, and debate topics for {character.name}
        </SheetDescription>

        {/* Header */}
        <div className="relative flex-none bg-[#231d12] border-b border-[#46382a] px-8 pt-12 pb-8 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(201,164,88,0.04),transparent_60%)]" />

          {/* Monogram */}
          <div
            className="relative w-14 h-14 rounded-full flex items-center justify-center mb-5 border"
            style={{ background: colors.bg, borderColor: colors.border }}
          >
            <span
              className="text-[#e8c97a] text-base tracking-[0.1em]"
              style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 }}
            >
              {getMonogram(character.name)}
            </span>
          </div>

          <h2
            className="text-[#f0e8d8] text-2xl leading-tight mb-2 relative"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400 }}
          >
            {character.name}
          </h2>

          <div className="flex items-baseline gap-2.5 relative mb-4">
            <span
              className="text-[#9e8e72]"
              style={{ fontFamily: '"EB Garamond", serif', fontSize: '14px', letterSpacing: '0.04em' }}
            >
              {character.years}
            </span>
            <span className="text-[#3a2f1e] text-xs">·</span>
            <span
              className="text-[#c9a458]/70"
              style={{ fontFamily: '"EB Garamond", serif', fontSize: '13px', letterSpacing: '0.05em' }}
            >
              {character.era}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 relative">
            {character.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 border border-[#46382a] text-[#a89880] rounded-sm"
                style={{ fontFamily: '"EB Garamond", serif', fontSize: '11px', letterSpacing: '0.04em' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-8 py-7 space-y-7">
            {/* Rhetorical style */}
            <BioSection icon="✦" label="Rhetorical Style">
              <p
                className="text-[#b8a88a] leading-relaxed italic"
                style={{ fontFamily: '"EB Garamond", serif', fontSize: '15px' }}
              >
                {character.rhetoricalStyle}
              </p>
            </BioSection>

            <Ornament />

            {/* Core beliefs */}
            <BioSection icon="◆" label="Core Beliefs">
              <ul className="space-y-2.5">
                {character.coreBeliefs.map((belief, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-[#c9a458]/30 mt-[3px] flex-shrink-0 text-[10px]">▸</span>
                    <p
                      className="text-[#a89878] leading-relaxed"
                      style={{ fontFamily: '"EB Garamond", serif', fontSize: '14px' }}
                    >
                      {belief}
                    </p>
                  </li>
                ))}
              </ul>
            </BioSection>

            {character.sampleQuotes?.length > 0 && (
              <>
                <Ornament />
                <BioSection icon="❝" label="In Their Words">
                  <div className="space-y-4">
                    {character.sampleQuotes.slice(0, 3).map((quote, i) => (
                      <blockquote
                        key={i}
                        className="border-l-2 border-[#c9a458]/25 pl-4 text-[#9e8e72] italic leading-relaxed"
                        style={{ fontFamily: '"EB Garamond", serif', fontSize: '14px' }}
                      >
                        "{quote}"
                      </blockquote>
                    ))}
                  </div>
                </BioSection>
              </>
            )}

            {character.keyWorks?.length > 0 && (
              <>
                <Ornament />
                <BioSection icon="◈" label="Key Works">
                  <ul className="space-y-1.5">
                    {character.keyWorks.map((work, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-[#9e8e72]"
                        style={{ fontFamily: '"EB Garamond", serif', fontSize: '14px' }}
                      >
                        <span className="text-[#c9a458]/30 flex-shrink-0">—</span>
                        {work}
                      </li>
                    ))}
                  </ul>
                </BioSection>
              </>
            )}

            {character.suggestedTopics?.length > 0 && (
              <>
                <Ornament />
                <BioSection icon="◉" label="Debate Topics">
                  <ul className="space-y-2">
                    {character.suggestedTopics.map((topic, i) => (
                      <li
                        key={i}
                        className="p-3 bg-[#231d12] border border-[#352c1c] rounded text-[#a89878] leading-snug"
                        style={{ fontFamily: '"EB Garamond", serif', fontSize: '14px' }}
                      >
                        {topic}
                      </li>
                    ))}
                  </ul>
                </BioSection>
              </>
            )}

            {/* Bottom breathing room */}
            <div className="h-2" />
          </div>
        </ScrollArea>

        {/* CTA */}
        <div className="flex-none border-t border-[#46382a] px-8 py-5 bg-[#1c1710]">
          <button
            className={cn(
              'w-full py-3 rounded-sm text-[#1c1710] text-sm font-semibold',
              'bg-[#c9a458] hover:bg-[#d4b46a]',
              'transition-all duration-200',
              'hover:shadow-[0_0_24px_rgba(201,164,88,0.25)]',
              'tracking-[0.18em] uppercase',
            )}
            style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: '13px' }}
          >
            Summon to Debate
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

function CharacterBrowser() {
  const [characters, setCharacters] = useState<CharacterProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedEra, setSelectedEra] = useState('All')
  const [selected, setSelected] = useState<CharacterProfile | null>(null)
  const [bioOpen, setBioOpen] = useState(false)

  useEffect(() => {
    fetchCharacters()
      .then(setCharacters)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const eras = useMemo(() => {
    const found = new Set(characters.map((c) => c.era))
    const ordered = ERA_ORDER.filter((e) => found.has(e))
    const rest = Array.from(found).filter((e) => !ERA_ORDER.includes(e))
    return ['All', ...ordered, ...rest]
  }, [characters])

  const filtered = useMemo(() => {
    return characters.filter((c) => {
      if (selectedEra !== 'All' && c.era !== selectedEra) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          c.name.toLowerCase().includes(q) ||
          c.era.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [characters, selectedEra, search])

  function openBio(character: CharacterProfile) {
    setSelected(character)
    setBioOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#1c1710]">
      {/* Top rule */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#c9a458]/20 to-transparent" />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#30261a]">
        <Link
          to="/"
          className="flex items-center gap-2 text-[#9e8e72] hover:text-[#c9a458] transition-colors duration-200"
        >
          <span className="text-[#c9a458]/50 text-xs">◆</span>
          <span
            className="tracking-[0.2em] uppercase"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '12px' }}
          >
            Grand Council
          </span>
        </Link>
        <button
          className={cn(
            'px-4 py-1.5 border border-[#c9a458]/30 rounded-sm',
            'text-[#c9a458]/70 hover:text-[#c9a458] hover:border-[#c9a458]/60',
            'transition-all duration-200',
          )}
          style={{ fontFamily: '"EB Garamond", serif', fontSize: '12px', letterSpacing: '0.15em' }}
        >
          Begin Debate →
        </button>
      </nav>

      {/* Hero */}
      <header className="relative px-6 pt-16 pb-14 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(201,164,88,0.04),transparent)]" />
        <div className="relative">
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="flex-1 max-w-20 h-px bg-gradient-to-r from-transparent to-[#c9a458]/25" />
            <span className="text-[#c9a458]/40 text-[10px] tracking-[0.5em]">✦ ✦ ✦</span>
            <div className="flex-1 max-w-20 h-px bg-gradient-to-l from-transparent to-[#c9a458]/25" />
          </div>
          <p
            className="text-[#c9a458]/50 mb-3 tracking-[0.45em] uppercase"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '11px' }}
          >
            Historical Archives
          </p>
          <h1
            className="text-[#f0e8d8] mb-4"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 300,
              fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
              letterSpacing: '-0.01em',
              lineHeight: 1.1,
            }}
          >
            The Summoned
          </h1>
          <p
            className="text-[#9e8e72] max-w-md mx-auto leading-relaxed"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '17px' }}
          >
            Thirty-four minds across millennia. Select a figure to examine their convictions and summon them to debate.
          </p>
        </div>
      </header>

      {/* Divider */}
      <div className="flex items-center gap-4 px-6 max-w-7xl mx-auto mb-9">
        <div className="flex-1 h-px bg-[#352c1c]" />
        <span className="text-[#46382a] text-[9px] tracking-[0.4em]">◆</span>
        <div className="flex-1 h-px bg-[#352c1c]" />
      </div>

      {/* Controls */}
      <div className="px-6 max-w-7xl mx-auto mb-9 space-y-4">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8e7e66]" />
          <input
            type="text"
            placeholder="Search name, era, or discipline…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              'w-full bg-[#231d12] border border-[#3e3020] rounded-sm',
              'text-[#f0e8d8] placeholder:text-[#8e7e66]',
              'pl-10 pr-9 py-2.5 text-sm outline-none',
              'focus:border-[#c9a458]/35 transition-colors duration-200',
            )}
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '15px' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e7e66] hover:text-[#9e8e72] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Era pills */}
        {!loading && eras.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {eras.map((era) => (
              <button
                key={era}
                onClick={() => setSelectedEra(era)}
                className={cn(
                  'px-3 py-1 border rounded-sm transition-all duration-200',
                  'tracking-[0.12em] uppercase',
                  selectedEra === era
                    ? 'bg-[#c9a458] border-[#c9a458] text-[#1c1710] font-semibold'
                    : 'bg-transparent border-[#3e3020] text-[#a89880] hover:border-[#c9a458]/30 hover:text-[#c9a458]/60',
                )}
                style={{ fontFamily: '"EB Garamond", serif', fontSize: '10px' }}
              >
                {era}
              </button>
            ))}
          </div>
        )}

        {/* Count */}
        {!loading && !error && (
          <p
            className="text-[#8e7e66]"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '13px' }}
          >
            {filtered.length} {filtered.length === 1 ? 'figure' : 'figures'}
            {selectedEra !== 'All' && ` · ${selectedEra}`}
            {search && ` matching "${search}"`}
          </p>
        )}
      </div>

      {/* Grid */}
      <main className="px-6 max-w-7xl mx-auto pb-24">
        {error ? (
          <div className="text-center py-24 space-y-2">
            <p
              className="text-[#9e8e72]"
              style={{ fontFamily: '"EB Garamond", serif', fontSize: '16px' }}
            >
              The archives are momentarily inaccessible.
            </p>
            <p
              className="text-[#8e7e66]"
              style={{ fontFamily: '"EB Garamond", serif', fontSize: '13px' }}
            >
              {error}
            </p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p
              className="text-[#9e8e72]"
              style={{ fontFamily: '"EB Garamond", serif', fontSize: '16px' }}
            >
              No figures match your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((char) => (
              <CharacterCard key={char.id} character={char} onClick={() => openBio(char)} />
            ))}
          </div>
        )}
      </main>

      {/* Bottom rule */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#c9a458]/15 to-transparent" />

      {/* Bio sheet */}
      <CharacterBio character={selected} open={bioOpen} onClose={() => setBioOpen(false)} />
    </div>
  )
}
