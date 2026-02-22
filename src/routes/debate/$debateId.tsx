import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Copy, Check, Download, ChevronRight, ScrollText, Columns2, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebateTurn } from '@/lib/hooks/useDebateTurn'
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
    { bg: 'oklch(0.20 0.04 38)', border: 'oklch(0.60 0.11 42)' },
    { bg: 'oklch(0.20 0.04 55)', border: 'oklch(0.60 0.11 58)' },
    { bg: 'oklch(0.20 0.03 30)', border: 'oklch(0.60 0.10 34)' },
    { bg: 'oklch(0.20 0.05 45)', border: 'oklch(0.62 0.12 48)' },
    { bg: 'oklch(0.20 0.04 25)', border: 'oklch(0.60 0.10 28)' },
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

function exportTranscript(
  debate: Debate,
  turns: DebateTurn[],
  characters: Map<string, CharacterProfile>,
) {
  const format = debate.format as DebateFormat
  const lines = [
    `# ${debate.title}`,
    ``,
    `**Topic:** ${debate.topic}`,
    `**Format:** ${FORMAT_LABELS[format] ?? format}`,
    `**Date:** ${new Date(debate.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    ``,
    `---`,
    ``,
    ...turns.map((turn) => {
      const char = characters.get(turn.characterId ?? '')
      const name = char?.name ?? (turn.characterId ? turn.characterId : 'You')
      const role = ROLE_LABELS[turn.role as TurnRole] ?? turn.role
      return `## ${name} — ${role}\n\n${turn.content}\n`
    }),
  ]

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `grand-council-${debate.id.slice(0, 8)}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
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
      className="opacity-0 group-hover/bubble:opacity-100 transition-opacity p-1 text-[#5a5040] hover:text-[#9e8e72]"
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
    <div className="group/bubble flex gap-4 py-5 border-b border-[#141210] last:border-0">
      {/* Avatar column */}
      <div className="flex-shrink-0 pt-1">
        {character ? (
          <MonogramCircle id={character.id} name={character.name} size="md" active={streaming} />
        ) : (
          <div className="w-9 h-9 rounded-full border border-[#2a2018] bg-[#151210] flex items-center justify-center">
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
            className="text-[#3a3020] ml-auto flex-shrink-0"
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
              className="text-[#4a4030]"
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
        'bg-[#0e0c09]',
        isCurrentSpeaker
          ? 'border-[#c9a458]/50 shadow-[0_0_40px_rgba(201,164,88,0.08)]'
          : active
            ? 'border-[#2a2018]'
            : 'border-[#181410]',
      )}
    >
      {/* Podium header */}
      <div
        className={cn(
          'flex flex-col items-center gap-3 px-5 py-6 border-b transition-all duration-500',
          isCurrentSpeaker ? 'border-[#c9a458]/20 bg-[#0f0c08]' : 'border-[#141210]',
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
            className="text-[#5a5040] mt-0.5"
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
                ? 'text-[#c9a458]/80 border-[#c9a458]/25 bg-[#1a1408]'
                : 'text-[#5a5040] border-[#1e1810]',
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
              isCurrentSpeaker ? 'text-[#c9b888]' : 'text-[#8a7a62]',
            )}
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '14px', lineHeight: 1.8 }}
          >
            <StreamingText text={displayText} streaming={isCurrentSpeaker} />
          </p>
        ) : (
          <p
            className="text-[#2a2018] italic text-center pt-6"
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
    <div className="flex-none border-b border-[#1a1510] bg-[#0e0c09]">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 py-3">
        <a
          href="/characters"
          className="text-[#4a4030] hover:text-[#9e8e72] transition-colors flex-shrink-0"
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
            className="px-2.5 py-0.5 border border-[#2a2018] text-[#c9a458]/60 rounded-sm tracking-[0.2em] uppercase hidden sm:block"
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
            className="text-[#5a5040] tabular-nums"
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
                ? 'bg-[#1a1408] border border-[#c9a458]/30 text-[#c9a458]/80'
                : 'border border-transparent text-[#4a4030] hover:text-[#7a6e5c]',
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
  debateComplete,
  onNextTurn,
}: {
  debate: Debate
  turns: DebateTurn[]
  characters: Map<string, CharacterProfile>
  nextTurnInfo: { characterId: string; role: TurnRole; turnNumber: number } | null
  streaming: boolean
  error: string | null
  debateComplete: boolean
  onNextTurn: () => void
}) {
  const nextChar = nextTurnInfo ? characters.get(nextTurnInfo.characterId) : null

  return (
    <div className="flex-none border-t border-[#1a1510] bg-[#0e0c09]">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2.5 px-6 py-2.5 bg-red-950/30 border-b border-red-900/20">
          <AlertCircle className="w-3.5 h-3.5 text-red-400/70 flex-shrink-0" />
          <p className="text-red-400/70" style={{ fontFamily: '"EB Garamond", serif', fontSize: '13px' }}>
            {error}
          </p>
        </div>
      )}

      <div className="flex items-center gap-4 px-6 py-4">
        {/* Next speaker hint */}
        <div className="flex-1 min-w-0">
          {debateComplete ? (
            <p
              className="text-[#5a5040] italic"
              style={{ fontFamily: '"EB Garamond", serif', fontSize: '14px' }}
            >
              The debate has concluded.
            </p>
          ) : nextChar ? (
            <div className="flex items-center gap-2.5">
              <MonogramCircle id={nextChar.id} name={nextChar.name} size="sm" />
              <div>
                <p
                  className="text-[#7a6e5c] leading-none"
                  style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '14px' }}
                >
                  {nextChar.name}
                </p>
                <p
                  className="text-[#4a4030] leading-none mt-0.5"
                  style={{ fontFamily: '"EB Garamond", serif', fontSize: '10px', letterSpacing: '0.12em' }}
                >
                  {nextTurnInfo ? (ROLE_LABELS[nextTurnInfo.role] ?? nextTurnInfo.role) : ''}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Secondary actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportTranscript(debate, turns, characters)}
            disabled={turns.length === 0}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 border border-[#241c12] rounded-sm transition-all duration-150',
              turns.length > 0
                ? 'text-[#7a6e5c] hover:border-[#c9a458]/25 hover:text-[#9e8e72]'
                : 'text-[#2a2018] cursor-not-allowed',
            )}
            style={{ fontFamily: '"EB Garamond", serif', fontSize: '11px', letterSpacing: '0.1em' }}
            title="Export transcript as Markdown"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>

        {/* Primary action */}
        {debateComplete ? (
          <a
            href="/debate/new"
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#c9a458] hover:bg-[#d4b46a] text-[#0c0a08] rounded-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(201,164,88,0.2)]"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: '12px', letterSpacing: '0.15em' }}
          >
            New Debate
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        ) : (
          <button
            onClick={onNextTurn}
            disabled={streaming}
            className={cn(
              'flex items-center gap-1.5 px-5 py-2.5 rounded-sm border transition-all duration-200',
              'tracking-[0.12em] uppercase',
              streaming
                ? 'bg-[#1a1408] border-[#c9a458]/20 text-[#c9a458]/40 cursor-not-allowed'
                : 'bg-[#c9a458] border-[#c9a458] text-[#0c0a08] font-semibold hover:bg-[#d4b46a] hover:shadow-[0_0_20px_rgba(201,164,88,0.2)]',
            )}
            style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: '12px' }}
          >
            {streaming ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Speaking…
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
  const { streaming, streamText, error, startTurn } = useDebateTurn()

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

  const nextTurnInfo = useMemo(
    () => computeNextTurn(format, participantIds, turns.length),
    [format, participantIds, turns.length],
  )

  const debateComplete = nextTurnInfo === null

  const handleNextTurn = useCallback(async () => {
    if (!nextTurnInfo || streaming) return
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
    })
    setCurrentSpeakerId(null)
  }, [nextTurnInfo, streaming, startTurn, debate.id])

  return (
    <div className="flex flex-col h-screen bg-[#0c0a08] overflow-hidden">
      <div className="h-px bg-gradient-to-r from-transparent via-[#c9a458]/15 to-transparent" />

      <DebateHeader
        debate={debate}
        participants={participants}
        totalTurns={totalTurns}
        completedTurns={turns.length}
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
        debateComplete={debateComplete}
        onNextTurn={handleNextTurn}
      />
    </div>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function DebateStageSkeleton() {
  return (
    <div className="flex flex-col h-screen bg-[#0c0a08] animate-pulse">
      <div className="h-px bg-[#1e1810]" />
      <div className="border-b border-[#1a1510] bg-[#0e0c09] px-6 py-3 flex items-center gap-4">
        <div className="h-3 bg-[#1e1810] rounded w-24" />
        <div className="flex-1 h-4 bg-[#1e1810] rounded w-64" />
        <div className="h-5 bg-[#1e1810] rounded w-16" />
      </div>
      <div className="flex-1 p-6 space-y-6 max-w-3xl mx-auto w-full">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-9 h-9 rounded-full bg-[#1e1810] flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-[#1e1810] rounded w-32" />
              <div className="h-3 bg-[#181410] rounded w-full" />
              <div className="h-3 bg-[#181410] rounded w-5/6" />
              <div className="h-3 bg-[#181410] rounded w-4/5" />
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-[#1a1510] bg-[#0e0c09] px-6 py-4 flex items-center justify-between">
        <div className="h-8 bg-[#1e1810] rounded w-32" />
        <div className="h-9 bg-[#1e1810] rounded w-28" />
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
      <div className="min-h-screen bg-[#0c0a08] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p
            className="text-[#9e8e72]"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '22px', fontWeight: 300 }}
          >
            The debate cannot be found.
          </p>
          <p className="text-[#5a5040]" style={{ fontFamily: '"EB Garamond", serif', fontSize: '14px' }}>
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
