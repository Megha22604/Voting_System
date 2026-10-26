export interface Address {
  country: string
  state: string
  city: string
  taluka: string
}

export interface VoterRecord {
  id: string
  firstName: string
  middleName: string
  lastName: string
  age: number
  gender: string
  phone: string
  email: string
  address: Address
  voterId: string
  fingerprintCredentialId: string
  registeredAt: string
  hasVoted: boolean
  isNri?: boolean
  passportNumber?: string
  countryOfResidence?: string
  documentType: string
  documentNumber: string
  documentFileName?: string
}

const STORAGE_KEY = 'voterena_voters'

export function getVoters(): VoterRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveVoter(voter: VoterRecord): void {
  const voters = getVoters()
  voters.push(voter)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(voters))
}

export function findVoterById(voterId: string): VoterRecord | undefined {
  return getVoters().find((v) => v.voterId === voterId)
}

export function markVoterAsVoted(voterId: string): void {
  const voters = getVoters()
  const idx = voters.findIndex((v) => v.voterId === voterId)
  if (idx !== -1) {
    voters[idx].hasVoted = true
    localStorage.setItem(STORAGE_KEY, JSON.stringify(voters))
  }
}

export function deleteVoterById(voterId: string): boolean {
  const voters = getVoters()
  const idx = voters.findIndex((v) => v.voterId === voterId)
  if (idx === -1) return false
  voters.splice(idx, 1)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(voters))
  return true
}

export function updateVoter(voterId: string, updates: Partial<VoterRecord>): boolean {
  const voters = getVoters()
  const idx = voters.findIndex((v) => v.voterId === voterId)
  if (idx === -1) return false
  voters[idx] = { ...voters[idx], ...updates }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(voters))
  return true
}

export function generateVoterId(): string {
  const prefix = 'VID'
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  const timestamp = Date.now().toString(36).substring(-4).toUpperCase()
  return `${prefix}-${random}${timestamp}`
}

export function clearVoters(): void {
  localStorage.removeItem(STORAGE_KEY)
}
