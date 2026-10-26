export interface VoteCount {
  candidateId: string
  candidateName: string
  party: string
  votes: number
  color: string
}

const VOTE_KEY = 'voterena_votes'

const defaultCandidates: VoteCount[] = [
  { candidateId: 'C1', candidateName: 'Dr. Elena Vasquez', party: 'Progressive Alliance', votes: 0, color: '#10b981' },
  { candidateId: 'C2', candidateName: 'James Whitfield', party: 'Liberty Front', votes: 0, color: '#f59e0b' },
  { candidateId: 'C3', candidateName: 'Amara Osei', party: 'Unity Coalition', votes: 0, color: '#0ea5e9' },
  { candidateId: 'C4', candidateName: 'Rafael Kim', party: 'Future Forward', votes: 0, color: '#8b5cf6' },
]

export function getVoteCounts(): VoteCount[] {
  try {
    const data = localStorage.getItem(VOTE_KEY)
    if (data) return JSON.parse(data)
  } catch { /* ignore */ }
  localStorage.setItem(VOTE_KEY, JSON.stringify(defaultCandidates))
  return [...defaultCandidates]
}

export function recordVote(candidateId: string): void {
  const counts = getVoteCounts()
  const idx = counts.findIndex((c) => c.candidateId === candidateId)
  if (idx !== -1) {
    counts[idx].votes += 1
    localStorage.setItem(VOTE_KEY, JSON.stringify(counts))
  }
}

export function getTotalVotes(): number {
  return getVoteCounts().reduce((sum, c) => sum + c.votes, 0)
}

export function getRegisteredVoterCount(): number {
  try {
    const data = localStorage.getItem('voterena_voters')
    return data ? JSON.parse(data).length : 0
  } catch {
    return 0
  }
}

export function getVotedCount(): number {
  try {
    const data = localStorage.getItem('voterena_voters')
    if (!data) return 0
    return JSON.parse(data).filter((v: any) => v.hasVoted).length
  } catch {
    return 0
  }
}

export function resetVotes(): void {
  localStorage.setItem(VOTE_KEY, JSON.stringify(defaultCandidates))
}
