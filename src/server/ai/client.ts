import Anthropic from '@anthropic-ai/sdk'

export function getAnthropicClient(apiKey: string): Anthropic {
  return new Anthropic({ apiKey })
}
