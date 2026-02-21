import type { DebateFormat, TurnRole } from '../types/debate'

const TURN_SEQUENCES: Record<DebateFormat, TurnRole[]> = {
  oxford: ['opening', 'argument', 'rebuttal', 'closing'],
  'lincoln-douglas': ['opening', 'cross-examination', 'rebuttal', 'closing'],
  socratic: ['opening', 'cross-examination', 'cross-examination', 'cross-examination', 'closing'],
  townhall: ['opening', 'argument', 'argument', 'argument', 'closing'],
}

export function getTurnSequence(format: DebateFormat): TurnRole[] {
  return TURN_SEQUENCES[format]
}

export function getTurnInstruction(
  format: DebateFormat,
  role: TurnRole,
  _turnNumber: number,
  speakerName: string,
  opponentNames: string[],
): string {
  const opponents = opponentNames.join(' and ')

  switch (role) {
    case 'opening':
      if (format === 'oxford') {
        return `${speakerName}, you are delivering your opening statement in an Oxford-style debate. Clearly state your position on the topic and present your strongest initial argument. Be concise and compelling. Address the audience and the motion directly.`
      }
      if (format === 'lincoln-douglas') {
        return `${speakerName}, you are delivering your opening constructive speech in a Lincoln-Douglas debate. Establish your value premise and criterion, then present your contentions. Be systematic and persuasive.`
      }
      if (format === 'socratic') {
        return `${speakerName}, open the Socratic dialogue by stating your initial position on the topic. Make a clear, examinable claim and invite rigorous questioning.`
      }
      return `${speakerName}, deliver your opening statement for the Town Hall. Address the assembled audience and state your position clearly. Make it accessible and direct.`

    case 'argument':
      if (format === 'oxford') {
        return `${speakerName}, develop your main argument in this Oxford debate. Build logically on your opening, introduce new evidence or reasoning, and preemptively address obvious counterarguments. Your opponent is ${opponents}.`
      }
      return `${speakerName}, present your argument to the Town Hall. Engage with both the audience and respond to any points raised by ${opponents}. Be persuasive and specific.`

    case 'cross-examination':
      if (format === 'lincoln-douglas') {
        return `${speakerName}, you are cross-examining ${opponents}. Ask sharp, focused questions to expose weaknesses in their arguments. Do not make speeches — ask questions that force admissions or reveal contradictions. One question at a time.`
      }
      return `${speakerName}, engage in Socratic questioning with ${opponents}. Probe their assumptions with precise, targeted questions. Expose inconsistencies through careful dialectic. Do not lecture — question.`

    case 'rebuttal':
      return `${speakerName}, deliver your rebuttal. Directly address the strongest arguments made by ${opponents}. Challenge their reasoning, expose logical flaws, and reinforce your own position. Be specific — reference what they actually said, not a strawman version.`

    case 'closing':
      if (format === 'oxford') {
        return `${speakerName}, deliver your closing statement in the Oxford debate. Summarize why your position has prevailed, acknowledge any valid points from the opposition, and make a final appeal to the audience. Leave a lasting impression.`
      }
      if (format === 'lincoln-douglas') {
        return `${speakerName}, deliver your final rebuttal and closing. Crystallize the debate around the key issues. Explain why your value framework and arguments should prevail. Make every word count.`
      }
      return `${speakerName}, deliver your closing statement. Synthesize the key points of the debate, explain why your position is most defensible, and leave the audience with something meaningful to consider.`

    default:
      return `${speakerName}, it is your turn to speak. Respond thoughtfully to what has been said in the debate so far.`
  }
}

export function isUserTurn(_format: DebateFormat, _role: TurnRole): boolean {
  // User participation is determined by debate.userParticipating and which character the user chose.
  // The format itself does not determine user turns — the debate engine handles this.
  return false
}
