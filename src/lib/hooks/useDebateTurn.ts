import { useState, useCallback } from 'react'

export interface UseDebateTurnReturn {
  streaming: boolean
  streamText: string
  error: string | null
  startTurn: (debateId: string, characterId: string, onComplete: (fullText: string) => void) => Promise<void>
}

export function useDebateTurn(): UseDebateTurnReturn {
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const startTurn = useCallback(
    async (debateId: string, characterId: string, onComplete: (fullText: string) => void) => {
      setStreaming(true)
      setStreamText('')
      setError(null)

      try {
        const res = await fetch(
          `/api/debate/turn?debateId=${encodeURIComponent(debateId)}&characterId=${encodeURIComponent(characterId)}`,
        )

        if (!res.ok) {
          const err = (await res.json()) as { error?: string }
          throw new Error(err.error ?? `HTTP ${res.status}`)
        }

        if (!res.body) throw new Error('No response body')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let fullText = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const payload = line.slice(6).trim()

            if (payload === '[DONE]') {
              // Call onComplete first, then clear streaming so the UI transitions atomically
              onComplete(fullText)
              setStreaming(false)
              return
            }

            try {
              const data = JSON.parse(payload) as { delta?: string; error?: string }
              if (data.error) throw new Error(data.error)
              if (data.delta) {
                fullText += data.delta
                setStreamText(fullText)
              }
            } catch (parseErr) {
              // Re-throw real errors, ignore JSON parse glitches on partial chunks
              if (parseErr instanceof Error && parseErr.message !== 'Unexpected token') {
                throw parseErr
              }
            }
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Streaming failed'
        setError(message)
      } finally {
        setStreaming(false)
      }
    },
    [],
  )

  return { streaming, streamText, error, startTurn }
}
