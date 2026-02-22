import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { Loader2, Sparkles, Check, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CharacterProfile } from '@/types/character'
import type { DebateFormat } from '@/types/debate'

export const Route = createFileRoute('/debate/new')({
  component: DebateSetup,
  validateSearch: (search: Record<string, unknown>) => ({
    characters: typeof search.characters === 'string' ? search.characters : undefined,
    topic: typeof search.topic === 'string' ? search.topic : undefined,
    format: typeof search.format === 'string' ? (search.format as DebateFormat) : undefined,
  }),
})

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  { num: 'I', label: 'Participants' },
  { num: 'II', label: 'Motion' },
  { num: 'III', label: 'Format' },
  { num: 'IV', label: 'Options' },
  { num: 'V', label: 'Convene' },
] as const

const FORMATS: {
  id: DebateFormat
  name: string
  description: string
  diagram: string[]
}[] = [
  {
    id: 'oxford',
    name: 'Oxford',
    description:
      'Parliamentary and formal. Each side delivers opening statements, structured rebuttals, and closing summaries before a verdict.',
    diagram: ['Opening', '→ Rebuttal', '→ Closing'],
  },
  {
    id: 'lincoln-douglas',
    name: 'Lincoln-Douglas',
    description:
      'One-on-one value debate. The Affirmative defends a resolution; the Negative attacks it. Philosophical and precise.',
    diagram: ['Affirm.', '↔ Negative', '(Values)'],
  },
  {
    id: 'socratic',
    name: 'Socratic',
    description:
      'Dialogue-driven dialectic. Ideas are examined through probing questions and counter-questioning rather than declarations.',
    diagram: ['Question', '→ Answer', '→ Counter'],
  },
  {
    id: 'townhall',
    name: 'Town Hall',
    description:
      'Open forum with multiple voices. No strict order of argument — ideas surface and clash as the conversation demands.',
    diagram: ['A ↔ B', '↔ C', '(Open)'],
  },
]

const RESPONSE_LENGTHS = [
  { id: 'brief' as const, label: 'Brief', desc: '1–2 paragraphs' },
  { id: 'standard' as const, label: 'Standard', desc: '3–4 paragraphs' },
  { id: 'detailed' as const, label: 'Detailed', desc: '5–7 paragraphs' },
]

type ResponseLength = 'brief' | 'standard' | 'detailed'

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
    { bg: 'oklch(0.20 0.04 38)', border: 'oklch(0.60 0.11 42)' },
    { bg: 'oklch(0.20 0.04 55)', border: 'oklch(0.60 0.11 58)' },
    { bg: 'oklch(0.20 0.03 30)', border: 'oklch(0.60 0.10 34)' },
    { bg: 'oklch(0.20 0.05 45)', border: 'oklch(0.62 0.12 48)' },
    { bg: 'oklch(0.20 0.04 25)', border: 'oklch(0.60 0.10 28)' },
  ]
  return palettes[hash % palettes.length]
}

// ─── Monogram circle ─────────────────────────────────────────────────────────

function MonogramCircle({ id, name, size = 'md' }: { id: string; name: string; size?: 'sm' | 'md' | 'lg' }) {
  const colors = getMonogramColors(id)
  const dims = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-12 h-12' : 'w-9 h-9'
  const fontSize = size === 'sm' ? '9px' : size === 'lg' ? '14px' : '11px'
  return (
    <div
      className={cn(dims, 'rounded-full flex items-center justify-center flex-shrink-0 border')}
      style={{ background: colors.bg, borderColor: colors.border }}
    >
      <span
        className="text-[#e8c97a] tracking-[0.08em]"
        style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize }}
      >
        {getMonogram(name)}
      </span>
    </div>
  )
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const idx = i + 1
        const done = idx < current
        const active = idx === current

        return (
          <div key={step.num} className="flex items-center">
            {i > 0 && (
              <div
                className={cn(
                  'h-px w-8 sm:w-12 transition-colors duration-500',
                  done ? 'bg-[#c9a458]/40' : 'bg-[#1e1810]',
                )}
              />
            )}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300',
                  done && 'bg-[#c9a458]/15 border-[#c9a458]/50',
                  active && 'border-[#c9a458] shadow-[0_0_14px_rgba(201,164,88,0.18)]',
                  !done && !active && 'border-[#1e1810]',
                )}
              >
                {done ? (
                  <Check className="w-3 h-3 text-[#c9a458]" />
                ) : (
                  <span
                    className={cn('transition-colors', active ? 'text-[#c9a458]' : 'text-[#3a3020]')}
                    style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '12px' }}
                  >
                    {step.num}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-center transition-colors leading-none',
                  active ? 'text-[#c9a458]/70' : done ? 'text-[#4a4030]' : 'text-[#2a2018]',
                )}
                style={{ fontFamily: '"EB Garamond", serif', fontSize: '10px', letterSpacing: '0.08em' }}
              >
                {step.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Roster strip ─────────────────────────────────────────────────────────────

function RosterStrip({
  selected,
  onRemove,
  compact = false,
}: {
  selected: CharacterProfile[]
  onRemove: (id: string) => void
  compact?: boolean
}) {
  const MAX = 4
  const empty = MAX - selected.length

  return (
    <div
      className={cn(
        'flex items-center gap-3 border border-[#241c12] rounded',
        compact ? 'px-4 py-2' : 'px-5 py-3',
      )}
    >
      <span
        className="text-[#4a4030] tracking-[0.18em] uppercase flex-shrink-0"
        style={{ fontFamily: '"EB Garamond", serif', fontSize: '10px' }}
      >
        Council
      </span>
      <div className="w-px h-4 bg-[#1e1810]" />

      <div className="flex items-center gap-2.5 flex-1 flex-wrap">
        {selected.map((char) => (
          <div key={char.id} className="flex items-center gap-1.5 group">
            <MonogramCircle id={char.id} name={char.name} size="sm" />
            {!compact && (
              <span
                className="text-[#9e8e72] hidden sm:block max-w-[90px] truncate"
                style={{ fontFamily: '"EB Garamond", serif', fontSize: '12px' }}
              >
                {char.name.split(' ').at(-1)}
              </span>
            )}
            <button
              onClick={() => onRemove(char.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[#4a4030] hover:text-[#9e8e72]"
              aria-label={`Remove ${char.name}`}
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}

        {Array.from({ length: empty }).map((_, i) => (
          <div
            key={`slot-${i}`}
            className="w-7 h-7 rounded-full border border-dashed border-[#1e1810] flex items-center justify-center"
          >
            <span className="text-[#1e1810] text-[9px]">+</span>
          </div>
        ))}
      </div>

      <span
        className={cn('flex-shrink-0', selected.length >= 2 ? 'text-[#c9a458]/50' : 'text-[#4a4030]')}
        style={{ fontFamily: '"EB Garamond", serif', fontSize: '11px' }}
      >
        {selected.length >= 2 ? `${selected.length}/4` : `Need ${2 - selected.length} more`}
      </span>
    </div>
  )
}

// ─── Step 1: Participants ─────────────────────────────────────────────────────

function StepParticipants({
  characters,
  loading,
  selectedIds,
  onToggle,
  selected,
}: {
  characters: CharacterProfile[]
  loading: boolean
  selectedIds: string[]
  onToggle: (id: string) => void
  selected: CharacterProfile[]
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-[#f0e8d8] leading-tight"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontWeight: 300,
            fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)',
          }}
        >
          I. Assemble the Council
        </h2>
        <p
          className="text-[#9e8e72] mt-1.5 leading-relaxed"
          style={{ fontFamily: '"EB Garamond", serif', fontSize: '16px' }}
        >
          Select 2–4 historical minds to convene. You may select at most four figures.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-[100px] bg-[#0f0d0a] border border-[#1a1510] rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {characters.map((char) => {
            const sel = selectedIds.includes(char.id)
            const maxed = selectedIds.length >= 4 && !sel
            return (
              <button
                key={char.id}
                onClick={() => onToggle(char.id)}
                disabled={maxed}
                className={cn(
                  'relative text-left p-3 rounded border transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c9a458]/40',
                  sel
                    ? 'bg-[#191208] border-[#c9a458]/55 shadow-[0_0_14px_rgba(201,164,88,0.07)]'
                    : maxed
                      ? 'bg-[#0d0b08] border-[#181410] opacity-40 cursor-not-allowed'
                      : 'bg-[#0f0d0a] border-[#241c12] hover:border-[#c9a458]/22 hover:bg-[#121008]',
                )}
              >
                {sel && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#c9a458] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-[#0c0a08]" />
                  </div>
                )}
                <MonogramCircle id={char.id} name={char.name} size="md" />
                <p
                  className={cn('mt-2 leading-tight transition-colors', sel ? 'text-[#e8c97a]' : 'text-[#d0c8b8]')}
                  style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '13px' }}
                >
                  {char.name}
                </p>
                <p
                  className="text-[#5a5040] leading-none mt-0.5"
                  style={{ fontFamily: '"EB Garamond", serif', fontSize: '10px' }}
                >
                  {char.era}
                </p>
              </button>
            )
          })}
        </div>
      )}

      {selected.length > 0 && (
        <RosterStrip selected={selected} onRemove={onToggle} />
      )}
    </div>
  )
}

// ─── Step 2: Motion ──────────────────────────────────────────────────────────

function StepMotion({
  topic,
  onTopicChange,
  selectedIds,
  suggestedTopics,
  loadingSuggestions,
  onSuggest,
  selected,
  onRemove,
}: {
  topic: string
  onTopicChange: (t: string) => void
  selectedIds: string[]
  suggestedTopics: string[]
  loadingSuggestions: boolean
  onSuggest: () => void
  selected: CharacterProfile[]
  onRemove: (id: string) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-[#f0e8d8] leading-tight"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontWeight: 300,
            fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)',
          }}
        >
          II. State the Motion
        </h2>
        <p
          className="text-[#9e8e72] mt-1.5 leading-relaxed"
          style={{ fontFamily: '"EB Garamond", serif', fontSize: '16px' }}
        >
          What question shall be put before the council? Frame it as a resolution or provocative inquiry.
        </p>
      </div>

      <RosterStrip selected={selected} onRemove={onRemove} compact />

      {/* Textarea */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a458]/15 to-transparent" />
        <textarea
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          placeholder="e.g. Does the end justify the means in matters of state?"
          rows={4}
          className={cn(
            'w-full bg-[#0f0d0a] border border-[#241c12] rounded',
            'text-[#f0e8d8] placeholder:text-[#3a3020]',
            'px-5 py-4 resize-none outline-none',
            'focus:border-[#c9a458]/28 transition-colors duration-200',
          )}
          style={{ fontFamily: '"EB Garamond", serif', fontSize: '18px', lineHeight: 1.65 }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a458]/8 to-transparent" />
      </div>

      {/* Suggest button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onSuggest}
          disabled={loadingSuggestions || selectedIds.length < 2}
          className={cn(
            'flex items-center gap-2 px-4 py-2 border rounded-sm transition-all duration-200',
            'tracking-[0.14em] uppercase',
            selectedIds.length >= 2 && !loadingSuggestions
              ? 'border-[#c9a458]/25 text-[#c9a458]/60 hover:border-[#c9a458]/50 hover:text-[#c9a458]'
              : 'border-[#1e1810] text-[#2a2018] cursor-not-allowed',
          )}
          style={{ fontFamily: '"EB Garamond", serif', fontSize: '11px' }}
        >
          {loadingSuggestions ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          {loadingSuggestions ? 'Consulting the oracle…' : 'Suggest from characters'}
        </button>
        {selectedIds.length < 2 && (
          <span className="text-[#3a3020]" style={{ fontFamily: '"EB Garamond", serif', fontSize: '12px' }}>
            Select participants first
          </span>
        )}
      </div>

      {/* Suggested topics */}
      {suggestedTopics.length > 0 && (
        <div className="space-y-2">
          <p
            className="text-[#4a4030] tracking-[0.2em] uppercase"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '10px' }}
          >
            Suggested motions
          </p>
          <div className="space-y-1.5">
            {suggestedTopics.map((t, i) => (
              <button
                key={i}
                onClick={() => onTopicChange(t)}
                className={cn(
                  'w-full text-left px-4 py-3 rounded border transition-all duration-150',
                  topic === t
                    ? 'bg-[#191208] border-[#c9a458]/50 text-[#e8c97a]'
                    : 'bg-[#0f0d0a] border-[#241c12] text-[#9e8e72] hover:border-[#c9a458]/22 hover:text-[#c9a458]/70',
                )}
                style={{ fontFamily: '"EB Garamond", serif', fontSize: '15px', lineHeight: 1.55 }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Step 3: Format ──────────────────────────────────────────────────────────

function StepFormat({
  format,
  onFormatChange,
  selected,
  onRemove,
}: {
  format: DebateFormat
  onFormatChange: (f: DebateFormat) => void
  selected: CharacterProfile[]
  onRemove: (id: string) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-[#f0e8d8] leading-tight"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontWeight: 300,
            fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)',
          }}
        >
          III. Rules of Engagement
        </h2>
        <p
          className="text-[#9e8e72] mt-1.5 leading-relaxed"
          style={{ fontFamily: '"EB Garamond", serif', fontSize: '16px' }}
        >
          Choose the structure that governs how arguments shall unfold.
        </p>
      </div>

      <RosterStrip selected={selected} onRemove={onRemove} compact />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FORMATS.map((f) => {
          const active = format === f.id
          return (
            <button
              key={f.id}
              onClick={() => onFormatChange(f.id)}
              className={cn(
                'text-left p-5 rounded border transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c9a458]/40',
                active
                  ? 'bg-[#191208] border-[#c9a458]/55 shadow-[0_0_20px_rgba(201,164,88,0.06)]'
                  : 'bg-[#0f0d0a] border-[#241c12] hover:border-[#c9a458]/22 hover:bg-[#121008]',
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <h3
                  className={cn('transition-colors', active ? 'text-[#e8c97a]' : 'text-[#f0e8d8]')}
                  style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '21px' }}
                >
                  {f.name}
                </h3>
                {active && (
                  <div className="w-4 h-4 rounded-full bg-[#c9a458] flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-2.5 h-2.5 text-[#0c0a08]" />
                  </div>
                )}
              </div>
              <p
                className="text-[#7a6e5c] leading-relaxed mb-4"
                style={{ fontFamily: '"EB Garamond", serif', fontSize: '13px', lineHeight: 1.65 }}
              >
                {f.description}
              </p>
              <div className="flex items-center gap-1.5 border-t border-[#1a1510] pt-3">
                {f.diagram.map((seg, i) => (
                  <span
                    key={i}
                    className={cn(
                      'transition-colors',
                      i === 0 && active ? 'text-[#c9a458]/50' : 'text-[#3a3020]',
                    )}
                    style={{ fontFamily: '"EB Garamond", serif', fontSize: '11px', letterSpacing: '0.04em' }}
                  >
                    {seg}
                  </span>
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 4: Options ─────────────────────────────────────────────────────────

function StepOptions({
  userParticipating,
  onUserParticipatingChange,
  responseLength,
  onResponseLengthChange,
  selected,
  onRemove,
}: {
  userParticipating: boolean
  onUserParticipatingChange: (v: boolean) => void
  responseLength: ResponseLength
  onResponseLengthChange: (v: ResponseLength) => void
  selected: CharacterProfile[]
  onRemove: (id: string) => void
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2
          className="text-[#f0e8d8] leading-tight"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontWeight: 300,
            fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)',
          }}
        >
          IV. Your Role
        </h2>
        <p
          className="text-[#9e8e72] mt-1.5 leading-relaxed"
          style={{ fontFamily: '"EB Garamond", serif', fontSize: '16px' }}
        >
          Shall you observe from the gallery, or take the floor alongside the council?
        </p>
      </div>

      <RosterStrip selected={selected} onRemove={onRemove} compact />

      {/* Participation toggle */}
      <button
        onClick={() => onUserParticipatingChange(!userParticipating)}
        className={cn(
          'w-full flex items-center justify-between p-5 rounded border text-left transition-all duration-200',
          userParticipating
            ? 'bg-[#191208] border-[#c9a458]/55'
            : 'bg-[#0f0d0a] border-[#241c12] hover:border-[#c9a458]/20',
        )}
      >
        <div>
          <p
            className={cn('mb-1 transition-colors', userParticipating ? 'text-[#e8c97a]' : 'text-[#f0e8d8]')}
            style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '19px' }}
          >
            Join as Participant
          </p>
          <p
            className="text-[#7a6e5c]"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '13px' }}
          >
            Submit arguments alongside the historical figures, entering the debate yourself.
          </p>
        </div>
        {/* Custom toggle */}
        <div
          className={cn(
            'relative w-10 h-[22px] rounded-full border transition-all duration-300 flex-shrink-0 ml-6',
            userParticipating ? 'bg-[#c9a458] border-[#c9a458]' : 'bg-[#161210] border-[#2a2018]',
          )}
        >
          <div
            className={cn(
              'absolute top-[3px] w-4 h-4 rounded-full transition-all duration-300',
              userParticipating ? 'left-[22px] bg-[#0c0a08]' : 'left-[3px] bg-[#4a4030]',
            )}
          />
        </div>
      </button>

      {/* Response length */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <p
            className="text-[#4a4030] tracking-[0.2em] uppercase"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '10px' }}
          >
            Response Length
          </p>
          <div className="flex-1 h-px bg-[#1a1510]" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {RESPONSE_LENGTHS.map((opt) => {
            const active = responseLength === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => onResponseLengthChange(opt.id)}
                className={cn(
                  'p-4 rounded border text-center transition-all duration-200',
                  active
                    ? 'bg-[#191208] border-[#c9a458]/55'
                    : 'bg-[#0f0d0a] border-[#241c12] hover:border-[#c9a458]/20',
                )}
              >
                <p
                  className={cn('mb-1 transition-colors', active ? 'text-[#e8c97a]' : 'text-[#d0c8b8]')}
                  style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '17px' }}
                >
                  {opt.label}
                </p>
                <p
                  className="text-[#4a4030]"
                  style={{ fontFamily: '"EB Garamond", serif', fontSize: '11px' }}
                >
                  {opt.desc}
                </p>
              </button>
            )
          })}
        </div>
        <p className="text-[#2a2018]" style={{ fontFamily: '"EB Garamond", serif', fontSize: '11px' }}>
          * Response length configuration is reserved for a future release.
        </p>
      </div>
    </div>
  )
}

// ─── Step 5: Convene ─────────────────────────────────────────────────────────

function StepConvene({
  selected,
  topic,
  format,
  userParticipating,
  creating,
  error,
  onConvene,
}: {
  selected: CharacterProfile[]
  topic: string
  format: DebateFormat
  userParticipating: boolean
  creating: boolean
  error: string | null
  onConvene: () => void
}) {
  const formatLabel = FORMATS.find((f) => f.id === format)?.name ?? format

  return (
    <div className="space-y-8">
      <div>
        <h2
          className="text-[#f0e8d8] leading-tight"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontWeight: 300,
            fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)',
          }}
        >
          V. Convene the Council
        </h2>
        <p
          className="text-[#9e8e72] mt-1.5 leading-relaxed"
          style={{ fontFamily: '"EB Garamond", serif', fontSize: '16px' }}
        >
          Review the terms. When all is in order, bring these minds together.
        </p>
      </div>

      {/* Summary */}
      <div className="border border-[#2a2018] rounded overflow-hidden">
        {/* Motion */}
        <div className="px-6 py-5 border-b border-[#1a1510]">
          <p
            className="text-[#4a4030] tracking-[0.2em] uppercase mb-2"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '10px' }}
          >
            The Motion
          </p>
          <p
            className="text-[#f0e8d8] leading-relaxed italic"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '18px' }}
          >
            "{topic}"
          </p>
        </div>

        {/* Participants */}
        <div className="px-6 py-5 border-b border-[#1a1510]">
          <p
            className="text-[#4a4030] tracking-[0.2em] uppercase mb-3"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '10px' }}
          >
            The Council
          </p>
          <div className="flex flex-wrap gap-4">
            {selected.map((char) => (
              <div key={char.id} className="flex items-center gap-2.5">
                <MonogramCircle id={char.id} name={char.name} size="md" />
                <div>
                  <p
                    className="text-[#d0c8b8] leading-tight"
                    style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '15px' }}
                  >
                    {char.name}
                  </p>
                  <p
                    className="text-[#5a5040]"
                    style={{ fontFamily: '"EB Garamond", serif', fontSize: '11px' }}
                  >
                    {char.era}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Format + Role */}
        <div className="px-6 py-5 grid grid-cols-2 gap-6">
          <div>
            <p
              className="text-[#4a4030] tracking-[0.2em] uppercase mb-1.5"
              style={{ fontFamily: '"EB Garamond", serif', fontSize: '10px' }}
            >
              Format
            </p>
            <p
              className="text-[#c9a458]"
              style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '18px' }}
            >
              {formatLabel}
            </p>
          </div>
          <div>
            <p
              className="text-[#4a4030] tracking-[0.2em] uppercase mb-1.5"
              style={{ fontFamily: '"EB Garamond", serif', fontSize: '10px' }}
            >
              Your Role
            </p>
            <p
              className="text-[#c9a458]"
              style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '18px' }}
            >
              {userParticipating ? 'Participant' : 'Observer'}
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 border border-red-900/30 bg-red-950/20 rounded">
          <p className="text-red-400/70" style={{ fontFamily: '"EB Garamond", serif', fontSize: '14px' }}>
            {error}
          </p>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={onConvene}
        disabled={creating}
        className={cn(
          'w-full py-4 rounded-sm text-[#0c0a08] tracking-[0.2em] uppercase',
          'transition-all duration-200',
          creating
            ? 'bg-[#c9a458]/50 cursor-not-allowed'
            : 'bg-[#c9a458] hover:bg-[#d4b46a] hover:shadow-[0_0_36px_rgba(201,164,88,0.22)]',
        )}
        style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: '14px' }}
      >
        {creating ? (
          <span className="flex items-center justify-center gap-2.5">
            <Loader2 className="w-4 h-4 animate-spin" />
            Convening…
          </span>
        ) : (
          'Convene the Council'
        )}
      </button>
    </div>
  )
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

function DebateSetup() {
  const [step, setStep] = useState(1)
  const [characters, setCharacters] = useState<CharacterProfile[]>([])
  const [loadingChars, setLoadingChars] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [topic, setTopic] = useState('')
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [format, setFormat] = useState<DebateFormat>('oxford')
  const [userParticipating, setUserParticipating] = useState(false)
  const [responseLength, setResponseLength] = useState<ResponseLength>('standard')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/characters')
      .then((r) => r.json())
      .then((data) => setCharacters(data as CharacterProfile[]))
      .catch(() => {})
      .finally(() => setLoadingChars(false))
  }, [])

  const selected = useMemo(
    () => selectedIds.map((id) => characters.find((c) => c.id === id)).filter(Boolean) as CharacterProfile[],
    [selectedIds, characters],
  )

  function toggleCharacter(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 4) return prev
      return [...prev, id]
    })
  }

  async function suggestTopics() {
    if (selectedIds.length < 2) return
    setLoadingSuggestions(true)
    try {
      const res = await fetch('/api/debates/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterIds: selectedIds }),
      })
      const data = (await res.json()) as { topics?: string[] }
      setSuggestedTopics(data.topics ?? [])
    } catch {
      // silently fail — oracle is unavailable
    } finally {
      setLoadingSuggestions(false)
    }
  }

  async function convene() {
    if (!topic.trim() || selectedIds.length < 2) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/debates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          format,
          participantIds: selectedIds,
          userParticipating,
        }),
      })
      if (!res.ok) {
        const err = (await res.json()) as { error?: string }
        throw new Error(err.error ?? 'Failed to create debate')
      }
      const { debateId } = (await res.json()) as { debateId: string }
      window.location.href = `/debate/${debateId}`
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setCreating(false)
    }
  }

  function canAdvance() {
    if (step === 1) return selectedIds.length >= 2
    if (step === 2) return topic.trim().length > 0
    return true
  }

  function advance() {
    if (canAdvance()) setStep((s) => s + 1)
  }

  return (
    <div className="min-h-screen bg-[#0c0a08]">
      <div className="h-px bg-gradient-to-r from-transparent via-[#c9a458]/20 to-transparent" />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#1a1510]">
        <a
          href="/characters"
          className="flex items-center gap-2 text-[#9e8e72] hover:text-[#c9a458] transition-colors duration-200"
        >
          <span className="text-[#c9a458]/50 text-xs">◆</span>
          <span
            className="tracking-[0.2em] uppercase"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '12px' }}
          >
            The Summoned
          </span>
        </a>
        <span
          className="text-[#3a3020] tracking-[0.18em] uppercase"
          style={{ fontFamily: '"EB Garamond", serif', fontSize: '12px' }}
        >
          New Debate
        </span>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Step indicator */}
        <div className="flex justify-center mb-12">
          <StepIndicator current={step} />
        </div>

        {/* Animated step content */}
        <div key={step} className="animate-in fade-in-0 slide-in-from-bottom-1 duration-250">
          {step === 1 && (
            <StepParticipants
              characters={characters}
              loading={loadingChars}
              selectedIds={selectedIds}
              onToggle={toggleCharacter}
              selected={selected}
            />
          )}
          {step === 2 && (
            <StepMotion
              topic={topic}
              onTopicChange={setTopic}
              selectedIds={selectedIds}
              suggestedTopics={suggestedTopics}
              loadingSuggestions={loadingSuggestions}
              onSuggest={suggestTopics}
              selected={selected}
              onRemove={toggleCharacter}
            />
          )}
          {step === 3 && (
            <StepFormat
              format={format}
              onFormatChange={setFormat}
              selected={selected}
              onRemove={toggleCharacter}
            />
          )}
          {step === 4 && (
            <StepOptions
              userParticipating={userParticipating}
              onUserParticipatingChange={setUserParticipating}
              responseLength={responseLength}
              onResponseLengthChange={setResponseLength}
              selected={selected}
              onRemove={toggleCharacter}
            />
          )}
          {step === 5 && (
            <StepConvene
              selected={selected}
              topic={topic}
              format={format}
              userParticipating={userParticipating}
              creating={creating}
              error={error}
              onConvene={convene}
            />
          )}
        </div>

        {/* Navigation footer */}
        <div className="mt-10 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-[#7a6e5c] hover:text-[#9e8e72] transition-colors"
              style={{ fontFamily: '"EB Garamond", serif', fontSize: '15px' }}
            >
              ← {step === 5 ? 'Revise' : 'Back'}
            </button>
          ) : (
            <div />
          )}

          {step < 5 && (
            <button
              onClick={advance}
              disabled={!canAdvance()}
              className={cn(
                'flex items-center gap-1.5 px-6 py-2.5 rounded-sm border transition-all duration-200',
                'tracking-[0.14em] uppercase',
                canAdvance()
                  ? 'bg-[#c9a458] border-[#c9a458] text-[#0c0a08] font-semibold hover:bg-[#d4b46a] hover:shadow-[0_0_20px_rgba(201,164,88,0.18)]'
                  : 'bg-transparent border-[#1e1810] text-[#2a2018] cursor-not-allowed',
              )}
              style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: '13px' }}
            >
              {step === 4 ? 'Review' : 'Continue'}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[#c9a458]/10 to-transparent mt-8" />
    </div>
  )
}
