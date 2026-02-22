import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Copy, Check, Download, ChevronRight, ScrollText, Columns2, Loader2, AlertCircle, Send, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useDebateTurn } from '@/lib/hooks/useDebateTurn'
import { exportDebateMarkdown, downloadMarkdown } from '@/lib/export'
import type { CharacterProfile } from '@/types/character'
import type { Debate, DebateTurn, DebateFormat, TurnRole } from '@/types/debate'

export const Route = createFileRoute('/debate/$debateId')({
  component: DebateStageWrapper,
})

// ─── Constants ────────────────────────────────────────────────────────────────

const TURN_SEQUENCES: Record<DebateFormat, TurnRole[]> = {
  oxford: ['opening', 'argument', 'rebuttal', 'closing'],
  'lincoln-douglas': ['opening', 'cross-examination', 'rebuttal', 'closing'],
  socratic: ['opening', 'cross-examination', 'cross-examination', 'cross-examination', 'closing'],
  townhall: ['opening', 'argument', 'argument', 'argument', 'closing'],
}

const ROLE_LABELS: Record<TurnRole, string> = {
  opening: 'Opening Statement',
  argument: 'Argument',
  rebuttal: 'Rebuttal',
  'cross-examination': 'Cross-Examination',
  closing: 'Closing Statement',
}

const FORMAT_LABELS: Record<DebateFormat, string> = {
  oxford: 'Oxford',
  'lincoln-douglas': 'Lincoln-Douglas',
  socratic: 'Socratic',
  townhall: 'Town Hall',
}

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

function computeNextTurn(
  format: DebateFormat,
  participantIds: string[],
  completedTurns: number,
): { characterId: string; role: TurnRole; turnNumber: number } | null {
  const phases = TURN_SEQUENCES[format]
  const n = participantIds.length
  const phaseIndex = Math.floor(completedTurns / n)
  const participantIndex = completedTurns % n
  if (phaseIndex >= phases.length) return null
  return {
    characterId: participantIds[participantIndex],
    role: phases[phaseIndex],
    turnNumber: completedTurns + 1,
  }
}

function handleExport(
  debate: Debate,
  turns: DebateTurn[],
  characters: Map<string, CharacterProfile>,
) {
  const markdown = exportDebateMarkdown(debate, turns, characters)
  downloadMarkdown(markdown, `grand-council-${debate.id.slice(0, 8)}.md`)
  toast.success('Transcript exported')
}

// ─── MonogramCircle ───────────────────────────────────────────────────────────

function MonogramCircle({
  id,
  name,
  size = 'md',
  active = false,
}: {
  id: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  active?: boolean
}) {
  const colors = getMonogramColors(id)
  const dims = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-14 h-14', xl: 'w-20 h-20' }[size]
  const fs = { sm: '9px', md: '11px', lg: '16px', xl: '22px' }[size]
  return (
    <div
      className={cn(dims, 'rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-500')}
      style={{
        background: colors.bg,
        borderColor: active ? 'oklch(0.65 0.12 45)' : colors.border,
        boxShadow: active ? '0 0 20px rgba(201,164,88,0.25)' : 'none',
      }}
    >
      <span
        className={cn('tracking-[0.08em] transition-colors', active ? 'text-[#e8c97a]' : 'text-[#c9a070]')}
        style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: fs }}
      >
        {getMonogram(name)}
      </span>
    </div>
  )
}

// ─── StreamingText ────────────────────────────────────────────────────────────

function StreamingText({ text, streaming }: { text: string; streaming: boolean }) {
  return (
    <span>
      {text}
      {streaming && (
        <span
          className="inline-block w-px h-[1em] bg-[#c9a458] ml-0.5 align-middle animate-pulse"
          aria-hidden
        />
      )}
    </span>
  )
}

// ─── CopyButton ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover/bubble:opacity-100 transition-opacity p-1 text-[#8e7e66] hover:text-[#9e8e72]"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-[#c9a458]" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

// ─── TurnBubble ──────────────────────────────────────────────────────────────

function TurnBubble({
  turn,
  character,
  streaming = false,
  streamText = '',
}: {
  turn: DebateTurn
  character: CharacterProfile | undefined
  streaming?: boolean
  streamText?: string
}) {
  const name = character?.name ?? (turn.characterId ? turn.characterId : 'You')
  const role = ROLE_LABELS[turn.role as TurnRole] ?? turn.role
  const content = streaming ? streamText : turn.content
  const isUser = !turn.characterId

  return (
    <div className="group/bubble flex gap-4 py-5 border-b border-[#28201a] last:border-0">
      {/* Avatar column */}
      <div className="flex-shrink-0 pt-1">
        {character ? (
          <MonogramCircle id={character.id} name={character.name} size="md" active={streaming} />
        ) : (
          <div className="w-9 h-9 rounded-full border border-[#46382a] bg-[#241e16] flex items-center justify-center">
            <span className="text-[#9e8e72]" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '11px' }}>
              You
            </span>
          </div>
        )}
      </div>

      {/* Content column */}
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-baseline gap-3 mb-2">
          <span
            className={cn('leading-none', isUser ? 'text-[#9e8e72]' : 'text-[#d0c8b8]')}
            style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '16px' }}
          >
            {name}
          </span>
          <span
            className="text-[#c9a458]/50 tracking-[0.18em] uppercase leading-none"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '10px' }}
          >
            {role}
          </span>
          <span
            className="text-[#705e48] ml-auto flex-shrink-0"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '11px' }}
          >
            #{turn.turnNumber}
          </span>
          <CopyButton text={content} />
        </div>

        {/* Text */}
        <p
          className="text-[#b8a88a] leading-relaxed"
          style={{ fontFamily: '"EB Garamond", serif', fontSize: '16px', lineHeight: 1.75 }}
        >
          <StreamingText text={content} streaming={streaming} />
        </p>
      </div>
    </div>
  )
}

// ─── TranscriptView ───────────────────────────────────────────────────────────

function TranscriptView({
  turns,
  characters,
  streaming,
  streamText,
  currentSpeakerId,
  nextTurnInfo,
}: {
  turns: DebateTurn[]
  characters: Map<string, CharacterProfile>
  streaming: boolean
  streamText: string
  currentSpeakerId: string | null
  nextTurnInfo: { characterId: string; role: TurnRole; turnNumber: number } | null
}) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [turns.length, streamText])

  const streamingChar = currentSpeakerId ? characters.get(currentSpeakerId) : undefined

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-4">
        {turns.length === 0 && !streaming && (
          <div className="text-center py-16">
            <p
              className="text-[#7c6c54]"
              style={{ fontFamily: '"EB Garamond", serif', fontSize: '16px', fontStyle: 'italic' }}
            >
              The chamber awaits. Press Next Turn to begin.
            </p>
          </div>
        )}

        {turns.map((turn) => (
          <TurnBubble
            key={turn.id}
            turn={turn}
            character={characters.get(turn.characterId ?? '')}
          />
        ))}

        {/* Live streaming turn */}
        {streaming && nextTurnInfo && (
          <TurnBubble
            turn={{
              id: 'streaming',
              debateId: '',
              characterId: nextTurnInfo.characterId,
              role: nextTurnInfo.role,
              content: streamText,
              turnNumber: nextTurnInfo.turnNumber,
              createdAt: new Date().toISOString(),
            }}
            character={streamingChar}
            streaming={true}
            streamText={streamText}
          />
        )}

        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  )
}

// ─── PodiumView ───────────────────────────────────────────────────────────────

function PodiumCard({
  character,
  turns,
  active,
  streaming,
  streamText,
  nextTurnInfo,
}: {
  character: CharacterProfile
  turns: DebateTurn[]
  active: boolean
  streaming: boolean
  streamText: string
  nextTurnInfo: { characterId: string; role: TurnRole } | null
}) {
  const isCurrentSpeaker = active && streaming
  const charTurns = turns.filter((t) => t.characterId === character.id)
  const latestTurn = charTurns.at(-1)

  const displayText = isCurrentSpeaker ? streamText : (latestTurn?.content ?? null)
  const displayRole = isCurrentSpeaker
    ? nextTurnInfo?.role
    : latestTurn?.role ?? null

  return (
    <div
      className={cn(
        'flex flex-col rounded border transition-all duration-500',
        'bg-[#221c11]',
        isCurrentSpeaker
          ? 'border-[#c9a458]/50 shadow-[0_0_40px_rgba(201,164,88,0.08)]'
          : active
            ? 'border-[#46382a]'
            : 'border-[#2c2418]',
      )}
    >
      {/* Podium header */}
      <div
        className={cn(
          'flex flex-col items-center gap-3 px-5 py-6 border-b transition-all duration-500',
          isCurrentSpeaker ? 'border-[#c9a458]/20 bg-[#261e10]' : 'border-[#28201a]',
        )}
      >
        <MonogramCircle id={character.id} name={character.name} size="lg" active={isCurrentSpeaker} />
        <div className="text-center">
          <p
            className={cn('leading-tight transition-colors', isCurrentSpeaker ? 'text-[#e8c97a]' : 'text-[#d0c8b8]')}
            style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '17px' }}
          >
            {character.name}
          </p>
          <p
            className="text-[#8e7e66] mt-0.5"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '11px' }}
          >
            {character.era}
          </p>
        </div>
        {displayRole && (
          <span
            className={cn(
              'tracking-[0.18em] uppercase px-2.5 py-0.5 rounded-sm border',
              isCurrentSpeaker
                ? 'text-[#c9a458]/80 border-[#c9a458]/25 bg-[#2c2010]'
                : 'text-[#8e7e66] border-[#352c1c]',
            )}
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '9px' }}
          >
            {ROLE_LABELS[displayRole] ?? displayRole}
          </span>
        )}
      </div>

      {/* Speech area */}
      <div className="flex-1 overflow-y-auto max-h-72 p-5">
        {displayText ? (
          <p
            className={cn(
              'leading-relaxed transition-colors',
              isCurrentSpeaker ? 'text-[#c9b888]' : 'text-[#b0a080]',
            )}
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '14px', lineHeight: 1.8 }}
          >
            <StreamingText text={displayText} streaming={isCurrentSpeaker} />
          </p>
        ) : (
          <p
            className="text-[#46382a] italic text-center pt-6"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '13px' }}
          >
            awaiting…
          </p>
        )}
      </div>
    </div>
  )
}

function PodiumView({
  participants,
  turns,
  streaming,
  streamText,
  currentSpeakerId,
  nextTurnInfo,
}: {
  participants: CharacterProfile[]
  turns: DebateTurn[]
  streaming: boolean
  streamText: string
  currentSpeakerId: string | null
  nextTurnInfo: { characterId: string; role: TurnRole; turnNumber: number } | null
}) {
  const n = participants.length
  const gridClass =
    n <= 2 ? 'grid-cols-1 sm:grid-cols-2' : n === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className={cn('grid gap-4 h-full', gridClass)}>
        {participants.map((char) => (
          <PodiumCard
            key={char.id}
            character={char}
            turns={turns}
            active={currentSpeakerId === char.id || (!streaming && turns.at(-1)?.characterId === char.id)}
            streaming={streaming}
            streamText={streamText}
            nextTurnInfo={nextTurnInfo}
          />
        ))}
      </div>
    </div>
  )
}

// ─── DebateHeader ─────────────────────────────────────────────────────────────

function DebateHeader({
  debate,
  participants,
  totalTurns,
  completedTurns,
  view,
  onViewChange,
}: {
  debate: Debate
  participants: CharacterProfile[]
  totalTurns: number
  completedTurns: number
  view: 'transcript' | 'podium'
  onViewChange: (v: 'transcript' | 'podium') => void
}) {
  const format = debate.format as DebateFormat

  return (
    <div className="flex-none border-b border-[#30261a] bg-[#221c11]">
      {/* Top bar */}
      <div className="flex items-center gap-2 sm:gap-4 px-4 sm:px-6 py-3">
        <a
          href="/characters"
          className="text-[#7c6c54] hover:text-[#9e8e72] transition-colors flex-shrink-0"
          style={{ fontFamily: '"EB Garamond", serif', fontSize: '11px', letterSpacing: '0.15em' }}
        >
          ◆ Grand Council
        </a>
        <div className="flex-1 min-w-0">
          <p
            className="text-[#f0e8d8] truncate italic"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: '15px' }}
          >
            {debate.topic}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Format badge */}
          <span
            className="px-2.5 py-0.5 border border-[#46382a] text-[#c9a458]/60 rounded-sm tracking-[0.2em] uppercase hidden sm:block"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '9px' }}
          >
            {FORMAT_LABELS[format] ?? format}
          </span>
          {/* Participant monograms */}
          <div className="flex -space-x-1.5">
            {participants.map((p) => (
              <MonogramCircle key={p.id} id={p.id} name={p.name} size="sm" />
            ))}
          </div>
          {/* Turn counter */}
          <span
            className="text-[#8e7e66] tabular-nums"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '12px' }}
          >
            {completedTurns}/{totalTurns}
          </span>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 px-6 pb-2.5">
        {(['transcript', 'podium'] as const).map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-all duration-150 text-xs tracking-[0.12em] uppercase',
              view === v
                ? 'bg-[#2c2010] border border-[#c9a458]/30 text-[#c9a458]/80'
                : 'border border-transparent text-[#7c6c54] hover:text-[#a89880]',
            )}
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '10px' }}
          >
            {v === 'transcript' ? <ScrollText className="w-3 h-3" /> : <Columns2 className="w-3 h-3" />}
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── DebateControls ───────────────────────────────────────────────────────────

function DebateControls({
  debate,
  turns,
  characters,
  nextTurnInfo,
  streaming,
  error,
  userTurnError,
  debateComplete,
  waitingForUser,
  onNextTurn,
  onRetry,
  onSubmitUserTurn,
}: {
  debate: Debate
  turns: DebateTurn[]
  characters: Map<string, CharacterProfile>
  nextTurnInfo: { characterId: string; role: TurnRole; turnNumber: number } | null
  streaming: boolean
  error: string | null
  userTurnError: string | null
  debateComplete: boolean
  waitingForUser: boolean
  onNextTurn: () => void
  onRetry: () => void
  onSubmitUserTurn: (text: string) => Promise<void>
}) {
  const [userInput, setUserInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const nextChar = nextTurnInfo ? characters.get(nextTurnInfo.characterId) : null

  async function handleSubmit() {
    if (!userInput.trim() || submitting) return
    setSubmitting(true)
    try {
      await onSubmitUserTurn(userInput.trim())
      setUserInput('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-none border-t border-[#30261a] bg-[#221c11]">
      {/* Error banners */}
      {error && (
        <div className="flex items-center gap-2.5 px-6 py-2.5 bg-red-950/30 border-b border-red-900/20">
          <AlertCircle className="w-3.5 h-3.5 text-red-400/70 flex-shrink-0" />
          <p className="flex-1 text-red-400/70" style={{ fontFamily: '"EB Garamond", serif', fontSize: '13px' }}>
            {error}
          </p>
          <button
            onClick={onRetry}
            className="flex items-center gap-1 text-red-400/60 hover:text-red-300/80 transition-colors flex-shrink-0"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '12px', letterSpacing: '0.08em' }}
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}
      {userTurnError && (
        <div className="flex items-center gap-2.5 px-6 py-2.5 bg-red-950/30 border-b border-red-900/20">
          <AlertCircle className="w-3.5 h-3.5 text-red-400/70 flex-shrink-0" />
          <p className="text-red-400/70" style={{ fontFamily: '"EB Garamond", serif', fontSize: '13px' }}>
            {userTurnError}
          </p>
        </div>
      )}

      {/* User input area */}
      {waitingForUser && !debateComplete && (
        <div className="px-4 sm:px-6 pt-4 pb-2 space-y-3 border-b border-[#30261a]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full border border-[#46382a] bg-[#241e16] flex items-center justify-center flex-shrink-0">
              <span
                className="text-[#9e8e72]"
                style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '10px' }}
              >
                You
              </span>
            </div>
            <span
              className="text-[#8e7e66] tracking-[0.18em] uppercase"
              style={{ fontFamily: '"EB Garamond", serif', fontSize: '10px' }}
            >
              Your Response
            </span>
          </div>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
            }}
            placeholder="State your position…"
            rows={3}
            className={cn(
              'w-full bg-[#2c2418] border border-[#3e3020] rounded-sm resize-none outline-none',
              'text-[#f0e8d8] placeholder:text-[#705e48]',
              'px-4 py-3 transition-colors duration-200',
              'focus:border-[#c9a458]/30',
            )}
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '15px', lineHeight: 1.65 }}
          />
          <div className="flex items-center justify-between pb-1">
            <span
              className="text-[#46382a]"
              style={{ fontFamily: '"EB Garamond", serif', fontSize: '11px' }}
            >
              ⌘↵ to submit
            </span>
            <button
              onClick={handleSubmit}
              disabled={!userInput.trim() || submitting}
              className={cn(
                'flex items-center gap-1.5 px-4 min-h-[40px] rounded-sm border transition-all duration-200',
                'tracking-[0.12em] uppercase',
                userInput.trim() && !submitting
                  ? 'bg-[#c9a458] border-[#c9a458] text-[#1c1710] font-semibold hover:bg-[#d4b46a] hover:shadow-[0_0_16px_rgba(201,164,88,0.2)]'
                  : 'border-[#352c1c] text-[#46382a] cursor-not-allowed',
              )}
              style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: '12px' }}
            >
              {submitting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
              Submit
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4">
        {/* Next speaker hint — hidden on mobile when action buttons need space */}
        <div className="flex-1 min-w-0 hidden sm:block">
          {debateComplete ? (
            <p
              className="text-[#8e7e66] italic"
              style={{ fontFamily: '"EB Garamond", serif', fontSize: '14px' }}
            >
              The debate has concluded.
            </p>
          ) : waitingForUser ? (
            <p
              className="text-[#a89880] italic"
              style={{ fontFamily: '"EB Garamond", serif', fontSize: '14px' }}
            >
              The floor is yours.
            </p>
          ) : nextChar ? (
            <div className="flex items-center gap-2.5">
              <MonogramCircle id={nextChar.id} name={nextChar.name} size="sm" />
              <div>
                <p
                  className="text-[#a89880] leading-none"
                  style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '14px' }}
                >
                  {nextChar.name}
                </p>
                <p
                  className="text-[#7c6c54] leading-none mt-0.5"
                  style={{ fontFamily: '"EB Garamond", serif', fontSize: '10px', letterSpacing: '0.12em' }}
                >
                  {nextTurnInfo ? (ROLE_LABELS[nextTurnInfo.role] ?? nextTurnInfo.role) : ''}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* On mobile: spacer so actions stay right-aligned */}
        <div className="flex-1 sm:hidden" />

        {/* Secondary actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport(debate, turns, characters)}
            disabled={turns.length === 0}
            className={cn(
              'flex items-center gap-1.5 px-3 min-h-[40px] sm:min-h-0 sm:py-1.5 border border-[#3e3020] rounded-sm transition-all duration-150',
              turns.length > 0
                ? 'text-[#a89880] hover:border-[#c9a458]/25 hover:text-[#9e8e72]'
                : 'text-[#46382a] cursor-not-allowed',
            )}
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '11px', letterSpacing: '0.1em' }}
            title="Export transcript as Markdown"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>

        {/* Primary action */}
        {debateComplete ? (
          <a
            href="/debate/new"
            className="flex items-center gap-1.5 px-4 sm:px-5 min-h-[40px] sm:min-h-0 sm:py-2.5 bg-[#c9a458] hover:bg-[#d4b46a] text-[#1c1710] rounded-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(201,164,88,0.2)]"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: '12px', letterSpacing: '0.15em' }}
          >
            New Debate
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        ) : waitingForUser ? null : (
          <button
            onClick={onNextTurn}
            disabled={streaming}
            className={cn(
              'flex items-center gap-1.5 px-4 sm:px-5 min-h-[40px] sm:min-h-0 sm:py-2.5 rounded-sm border transition-all duration-200',
              'tracking-[0.12em] uppercase',
              streaming
                ? 'bg-[#2c2010] border-[#c9a458]/20 text-[#c9a458]/40 cursor-not-allowed'
                : 'bg-[#c9a458] border-[#c9a458] text-[#1c1710] font-semibold hover:bg-[#d4b46a] hover:shadow-[0_0_20px_rgba(201,164,88,0.2)]',
            )}
            style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: '12px' }}
          >
            {streaming ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Speaking…</span>
              </>
            ) : (
              <>
                Next Turn
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── DebateStage ──────────────────────────────────────────────────────────────

function DebateStage({
  initialDebate,
  initialTurns,
  allCharacters,
}: {
  initialDebate: Debate
  initialTurns: DebateTurn[]
  allCharacters: CharacterProfile[]
}) {
  const [turns, setTurns] = useState<DebateTurn[]>(initialTurns)
  const [view, setView] = useState<'transcript' | 'podium'>('transcript')
  const [currentSpeakerId, setCurrentSpeakerId] = useState<string | null>(null)
  const [waitingForUser, setWaitingForUser] = useState(false)
  const [userTurnError, setUserTurnError] = useState<string | null>(null)
  const { streaming, streamText, error, startTurn } = useDebateTurn()

  // Toast on SSE error
  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  const debate = initialDebate
  const format = debate.format as DebateFormat
  const participantIds = debate.participantIds as string[]

  // Build character map
  const characters = useMemo(() => {
    const map = new Map<string, CharacterProfile>()
    allCharacters.forEach((c) => map.set(c.id, c))
    return map
  }, [allCharacters])

  const participants = useMemo(
    () => participantIds.map((id) => characters.get(id)).filter(Boolean) as CharacterProfile[],
    [participantIds, characters],
  )

  const totalTurns = TURN_SEQUENCES[format].length * participantIds.length

  // Only AI turns count toward turn scheduling (user turns are interleaved separately)
  const aiTurnsCount = useMemo(
    () => turns.filter((t) => t.characterId !== null).length,
    [turns],
  )

  const nextTurnInfo = useMemo(
    () => computeNextTurn(format, participantIds, aiTurnsCount),
    [format, participantIds, aiTurnsCount],
  )

  const debateComplete = nextTurnInfo === null

  const handleNextTurn = useCallback(async () => {
    if (!nextTurnInfo || streaming || waitingForUser) return
    const { characterId, role, turnNumber } = nextTurnInfo
    setCurrentSpeakerId(characterId)
    await startTurn(debate.id, characterId, (fullText) => {
      setTurns((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          debateId: debate.id,
          characterId,
          role,
          content: fullText,
          turnNumber,
          createdAt: new Date().toISOString(),
        },
      ])
      // After AI turn completes, prompt user to respond if participating
      if (debate.userParticipating) {
        setWaitingForUser(true)
      }
    })
    setCurrentSpeakerId(null)
  }, [nextTurnInfo, streaming, waitingForUser, startTurn, debate.id, debate.userParticipating])

  const handleSubmitUserTurn = useCallback(async (text: string) => {
    if (!text.trim() || !nextTurnInfo || streaming) return
    setUserTurnError(null)

    // Capture AI turn to trigger after user submits
    const aiTurn = nextTurnInfo

    try {
      const res = await fetch(`/api/debates/${debate.id}/turns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })
      if (!res.ok) {
        const err = (await res.json()) as { error?: string }
        throw new Error(err.error ?? 'Failed to save your response')
      }
      const { turn } = (await res.json()) as { turn: DebateTurn }
      setTurns((prev) => [...prev, turn])
      setWaitingForUser(false)

      // Auto-trigger the next AI character's turn (M9-03)
      if (!debateComplete) {
        setCurrentSpeakerId(aiTurn.characterId)
        await startTurn(debate.id, aiTurn.characterId, (fullText) => {
          setTurns((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              debateId: debate.id,
              characterId: aiTurn.characterId,
              role: aiTurn.role,
              content: fullText,
              turnNumber: aiTurn.turnNumber,
              createdAt: new Date().toISOString(),
            },
          ])
          if (debate.userParticipating) {
            setWaitingForUser(true)
          }
        })
        setCurrentSpeakerId(null)
      }
    } catch (err) {
      setUserTurnError(err instanceof Error ? err.message : 'Failed to submit response')
    }
  }, [nextTurnInfo, streaming, debate.id, debate.userParticipating, debateComplete, startTurn])

  return (
    <div className="flex flex-col h-screen bg-[#1c1710] overflow-hidden">
      <div className="h-px bg-gradient-to-r from-transparent via-[#c9a458]/15 to-transparent" />

      <DebateHeader
        debate={debate}
        participants={participants}
        totalTurns={totalTurns}
        completedTurns={aiTurnsCount}
        view={view}
        onViewChange={setView}
      />

      {/* Main content */}
      {view === 'transcript' ? (
        <TranscriptView
          turns={turns}
          characters={characters}
          streaming={streaming}
          streamText={streamText}
          currentSpeakerId={currentSpeakerId}
          nextTurnInfo={nextTurnInfo}
        />
      ) : (
        <PodiumView
          participants={participants}
          turns={turns}
          streaming={streaming}
          streamText={streamText}
          currentSpeakerId={currentSpeakerId}
          nextTurnInfo={nextTurnInfo}
        />
      )}

      <DebateControls
        debate={debate}
        turns={turns}
        characters={characters}
        nextTurnInfo={nextTurnInfo}
        streaming={streaming}
        error={error}
        userTurnError={userTurnError}
        debateComplete={debateComplete}
        waitingForUser={waitingForUser}
        onNextTurn={handleNextTurn}
        onRetry={handleNextTurn}
        onSubmitUserTurn={handleSubmitUserTurn}
      />
    </div>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function DebateStageSkeleton() {
  return (
    <div className="flex flex-col h-screen bg-[#1c1710]">
      <div className="h-px bg-[#352c1c]" />
      <div className="border-b border-[#30261a] bg-[#221c11] px-6 py-3 flex items-center gap-4">
        <Skeleton className="h-3 w-24 bg-[#352c1c]" />
        <Skeleton className="flex-1 h-4 bg-[#352c1c]" />
        <Skeleton className="h-5 w-16 bg-[#352c1c]" />
      </div>
      <div className="flex-1 p-6 space-y-6 max-w-3xl mx-auto w-full">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="w-9 h-9 rounded-full bg-[#352c1c] flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-32 bg-[#352c1c]" />
              <Skeleton className="h-3 w-full bg-[#2c2418]" />
              <Skeleton className="h-3 w-5/6 bg-[#2c2418]" />
              <Skeleton className="h-3 w-4/5 bg-[#2c2418]" />
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-[#30261a] bg-[#221c11] px-6 py-4 flex items-center justify-between">
        <Skeleton className="h-8 w-32 bg-[#352c1c]" />
        <Skeleton className="h-9 w-28 bg-[#352c1c]" />
      </div>
    </div>
  )
}

// ─── Route wrapper (data loading) ─────────────────────────────────────────────

function DebateStageWrapper() {
  const { debateId } = Route.useParams()
  const [debate, setDebate] = useState<Debate | null>(null)
  const [turns, setTurns] = useState<DebateTurn[]>([])
  const [characters, setCharacters] = useState<CharacterProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [debateRes, charsRes] = await Promise.all([
          fetch(`/api/debates/${debateId}`),
          fetch('/api/characters'),
        ])

        if (!debateRes.ok) {
          const err = (await debateRes.json()) as { error?: string }
          throw new Error(err.error ?? `Debate not found (${debateRes.status})`)
        }

        const debateData = (await debateRes.json()) as {
          debate: Debate
          turns: DebateTurn[]
        }
        const charsData = (await charsRes.json()) as CharacterProfile[]

        setDebate(debateData.debate)
        setTurns(debateData.turns)
        setCharacters(charsData)
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load debate')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [debateId])

  if (loading) return <DebateStageSkeleton />

  if (loadError || !debate) {
    return (
      <div className="min-h-screen bg-[#1c1710] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p
            className="text-[#9e8e72]"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '22px', fontWeight: 300 }}
          >
            The debate cannot be found.
          </p>
          <p className="text-[#8e7e66]" style={{ fontFamily: '"EB Garamond", serif', fontSize: '14px' }}>
            {loadError}
          </p>
          <a
            href="/debate/new"
            className="inline-block mt-4 px-5 py-2 border border-[#c9a458]/30 text-[#c9a458]/70 hover:text-[#c9a458] hover:border-[#c9a458]/60 transition-colors rounded-sm"
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '13px', letterSpacing: '0.12em' }}
          >
            Begin a new debate →
          </a>
        </div>
      </div>
    )
  }

  return <DebateStage initialDebate={debate} initialTurns={turns} allCharacters={characters} />
}
