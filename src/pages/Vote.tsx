import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Fingerprint,
  CheckCircle,
  Lock,
  Shield,
  Vote as VoteIcon,
  AlertTriangle,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  Navigation,
  User,
  Hash,
  Calendar,
  MapPin,
  Radio,
  Download,
} from 'lucide-react'
import {
  findVoterById,
  markVoterAsVoted,
  type VoterRecord,
} from '../lib/voterStore'
import { recordVote } from '../lib/voteStore'
import { verifyFingerprint } from '../lib/webauthn'
import VotingMap from '../components/VotingMap'
import VvpatReceipt from '../components/VvpatReceipt'

interface Candidate {
  id: string
  name: string
  party: string
  symbol: string
}

const candidates: Candidate[] = [
  { id: 'C1', name: 'Dr. Elena Vasquez', party: 'Progressive Alliance', symbol: '🌿' },
  { id: 'C2', name: 'James Whitfield', party: 'Liberty Front', symbol: '⚡' },
  { id: 'C3', name: 'Amara Osei', party: 'Unity Coalition', symbol: '☮️' },
  { id: 'C4', name: 'Rafael Kim', party: 'Future Forward', symbol: '🚀' },
]

export default function Vote() {
  const [step, setStep] = useState<'login' | 'welcome' | 'stations' | 'auth' | 'select' | 'confirm' | 'success'>('login')
  const [voterIdInput, setVoterIdInput] = useState('')
  const [currentVoter, setCurrentVoter] = useState<VoterRecord | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [error, setError] = useState('')
  const [txHash, setTxHash] = useState('')
  const [showReceipt, setShowReceipt] = useState(false)

  const handleLogin = () => {
    setError('')
    if (!voterIdInput.trim()) {
      setError('Please enter your Voter ID')
      return
    }
    const voter = findVoterById(voterIdInput.trim().toUpperCase())
    if (!voter) {
      setError('Voter ID not found. Please register your identity first.')
      return
    }
    if (voter.hasVoted) {
      setError('This Voter ID has already cast a vote.')
      return
    }
    setCurrentVoter(voter)
    setStep('welcome')
  }

  const handleAuth = async () => {
    if (!currentVoter) return
    setError('')
    setScanProgress(0)

    const result = await verifyFingerprint(
      currentVoter.fingerprintCredentialId,
      (pct) => setScanProgress(pct)
    )

    if (!result.success) {
      setScanProgress(0)
      setError(result.error || 'Fingerprint verification failed.')
      return
    }

    setTimeout(() => {
      setScanProgress(0)
      setStep('select')
    }, 400)
  }

  const handleSelect = (id: string) => {
    setSelectedCandidate(id)
    setStep('confirm')
  }

  const handleConfirm = () => {
    if (selectedCandidate) {
      recordVote(selectedCandidate)
    }
    setTxHash(
      '0x' +
        Array.from(crypto.getRandomValues(new Uint8Array(16)))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
    )
    if (currentVoter) {
      markVoterAsVoted(currentVoter.voterId)
    }
    setStep('success')
  }

  const handleReset = () => {
    setStep('login')
    setVoterIdInput('')
    setCurrentVoter(null)
    setSelectedCandidate(null)
    setError('')
    setTxHash('')
    setScanProgress(0)
    setShowReceipt(false)
  }

  const selected = candidates.find((c) => c.id === selectedCandidate)

  const stepLabels = ['Login', 'Welcome', 'Stations', 'Verify', 'Select', 'Confirm', 'Cast']
  const stepKeys: Array<typeof step> = ['login', 'welcome', 'stations', 'auth', 'select', 'confirm', 'success']

  return (
    <div className="min-h-[calc(100vh-80px)] px-6 py-12 relative">
      {/* Step Indicator */}
      {step !== 'login' && step !== 'welcome' && (
        <div className="flex items-center justify-center gap-1 md:gap-3 mb-8 flex-wrap">
          {stepLabels.map((label, i) => {
            const stepIndex = stepKeys.indexOf(step)
            const isActive = i === stepIndex
            const isDone = i < stepIndex
            if (label === 'Login' || label === 'Welcome') return null
            return (
              <div key={label} className="flex items-center gap-1 md:gap-3">
                <div
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[0.6rem] font-bold tracking-wider uppercase ${
                    isActive
                      ? 'bg-cyan-glow/10 text-cyan-glow border border-cyan-glow/30'
                      : isDone
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-nexus-800 text-slate-600 border border-nexus-700'
                  }`}
                >
                  {isDone ? <CheckCircle className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full bg-current opacity-50" />}
                  {label}
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`w-3 md:w-6 h-px ${isDone ? 'bg-emerald-500/30' : 'bg-nexus-700'}`} />
                )}
              </div>
            )
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* LOGIN: Enter Voter ID */}
        {step === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto pt-16"
          >
            {/* Status Badge */}
            <div className="flex justify-center mb-10">
              <div className="flex items-center gap-3 px-5 py-2.5 glass rounded-md border border-cyan-glow/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-[0.65rem] font-bold tracking-[0.2em] text-cyan-glow/80 uppercase">Network Secured</span>
                <span className="text-cyan-glow/40">•</span>
                <span className="text-[0.65rem] font-bold tracking-[0.2em] text-cyan-glow/80 uppercase">VVPAT Active</span>
              </div>
            </div>

            <div className="glass rounded-xl p-8 border border-cyan-glow/10">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-cyan-glow/10 flex items-center justify-center border border-cyan-glow/20">
                  <KeyRound className="w-8 h-8 text-cyan-glow" />
                </div>
              </div>
              <h3 className="text-white font-bold text-xl text-center mb-1">Enter Voting Enclave</h3>
              <p className="text-slate-400 text-sm text-center mb-6">Input your registered Voter ID to proceed.</p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Voter ID</label>
                  <input
                    type="text"
                    value={voterIdInput}
                    onChange={(e) => setVoterIdInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="e.g. VID-A3F9B2"
                    className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-glow/40 transition-colors font-mono tracking-wider uppercase"
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/5 rounded-lg p-3 border border-red-500/10">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}
                <button
                  onClick={handleLogin}
                  className="w-full py-3 bg-cyan-glow text-nexus-950 font-bold text-sm rounded hover:bg-cyan-300 transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Authenticate
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* WELCOME: Post-login landing matching the photo aesthetic */}
        {step === 'welcome' && currentVoter && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 relative"
          >
            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 px-5 py-2.5 glass rounded-md border border-cyan-glow/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-[0.65rem] font-bold tracking-[0.2em] text-cyan-glow/80 uppercase">Identity Verified</span>
                <span className="text-cyan-glow/40">•</span>
                <span className="text-[0.65rem] font-bold tracking-[0.2em] text-cyan-glow/80 uppercase">Ready to Vote</span>
              </div>
            </motion.div>

            {/* Big Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black text-center tracking-tight mb-8"
            >
              <span className="text-white">THE </span>
              <span className="text-cyan-glow text-glow">ENCLAVE</span>
              <span className="text-white"> OF</span>
              <br />
              <span className="text-white">DEMOCRACY</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-slate-400 text-center max-w-2xl text-base md:text-lg leading-relaxed mb-12"
            >
              Welcome, {currentVoter.firstName} {currentVoter.lastName}. Your identity has been cryptographically verified.
              You are now inside the secure voting enclave. Select a polling station to proceed with casting your ballot.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <button
                onClick={() => setStep('stations')}
                className="group flex items-center gap-3 px-8 py-4 bg-cyan-glow text-nexus-950 font-black text-sm tracking-[0.15em] uppercase hover:bg-cyan-300 transition-all hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]"
              >
                <Navigation className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Select Polling Station
              </button>
              <button
                onClick={handleReset}
                className="group flex items-center gap-3 px-8 py-4 bg-nexus-800/80 border border-cyan-glow/20 text-cyan-glow font-black text-sm tracking-[0.15em] uppercase hover:border-cyan-glow/40 hover:bg-nexus-700/80 transition-all"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Exit Enclave
              </button>
            </motion.div>

            {/* Voter Info Summary */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16"
            >
              {[
                { label: 'Voter ID', value: currentVoter.voterId },
                { label: 'Age', value: `${currentVoter.age} yrs` },
                { label: 'Location', value: `${currentVoter.address.city}` },
                { label: 'Status', value: 'Verified' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="text-2xl font-black text-white">{stat.value}</span>
                  <span className="text-[0.6rem] tracking-[0.2em] text-slate-500 uppercase">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* STATIONS: Map */}
        {step === 'stations' && (
          <VotingMap
            key="stations"
            onProceed={() => setStep('auth')}
            onBack={() => setStep('welcome')}
          />
        )}

        {/* AUTH: Fingerprint Verification */}
        {step === 'auth' && currentVoter && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto pt-10"
          >
            <div className="glass rounded-xl p-8 border border-cyan-glow/10 text-center">
              <div className="flex items-center gap-2 justify-center mb-2">
                <Shield className="w-4 h-4 text-cyan-glow" />
                <span className="text-cyan-glow text-xs font-bold uppercase tracking-wider">{currentVoter.firstName} {currentVoter.lastName}</span>
              </div>
              <p className="text-slate-500 text-xs font-mono mb-6">{currentVoter.voterId}</p>

              <div className="relative w-40 h-40 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-glow/20" />
                <div className="absolute inset-2 rounded-full border border-cyan-glow/10" />
                <div className="absolute inset-4 rounded-full border border-dashed border-cyan-glow/20 animate-spin" style={{ animationDuration: '8s' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Fingerprint className="w-14 h-14 text-cyan-glow" />
                </div>
                {scanProgress > 0 && scanProgress < 100 && (
                  <div className="scan-line" style={{ borderRadius: '50%' }} />
                )}
              </div>

              <h3 className="text-white font-bold text-lg mb-2">Biometric Verification</h3>
              <p className="text-slate-400 text-sm mb-5">Place your registered finger on the sensor to verify identity.</p>

              {scanProgress > 0 && (
                <div className="w-full h-2 bg-nexus-700 rounded-full overflow-hidden mb-4">
                  <motion.div className="h-full bg-cyan-glow rounded-full" style={{ width: `${scanProgress}%` }} />
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/5 rounded-lg p-3 border border-red-500/10 mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('stations')}
                  className="flex-1 py-2.5 bg-nexus-800 text-slate-400 font-bold text-sm rounded hover:bg-nexus-700 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleAuth}
                  disabled={scanProgress > 0 && scanProgress < 100}
                  className="flex-1 py-2.5 bg-cyan-glow text-nexus-950 font-bold text-sm rounded hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Fingerprint className="w-4 h-4" />
                  {scanProgress > 0 && scanProgress < 100 ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* SELECT: Candidate Selection */}
        {step === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-8">
              <h3 className="text-white font-bold text-2xl mb-2">Select Your Candidate</h3>
              <p className="text-slate-400 text-sm">Cast your vote for the candidate of your choice.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {candidates.map((candidate, i) => (
                <motion.button
                  key={candidate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleSelect(candidate.id)}
                  className="glass rounded-xl p-6 text-left hover:border-cyan-glow/30 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-nexus-700 to-nexus-800 flex items-center justify-center text-2xl border border-cyan-glow/10 group-hover:border-cyan-glow/30 transition-all">
                      {candidate.symbol}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">{candidate.name}</h3>
                      <p className="text-cyan-glow/70 text-sm">{candidate.party}</p>
                    </div>
                    <VoteIcon className="w-5 h-5 text-slate-600 group-hover:text-cyan-glow transition-colors" />
                  </div>
                </motion.button>
              ))}
            </div>
            <div className="text-center mt-6">
              <button onClick={handleReset} className="text-xs text-slate-500 hover:text-cyan-glow transition-colors flex items-center gap-1 mx-auto">
                <ArrowLeft className="w-3 h-3" /> Exit Enclave
              </button>
            </div>
          </motion.div>
        )}

        {/* CONFIRM */}
        {step === 'confirm' && selected && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-md mx-auto pt-10"
          >
            <div className="glass rounded-xl p-8 text-center border border-cyan-glow/10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-nexus-700 to-nexus-800 flex items-center justify-center text-4xl mx-auto mb-6 border border-cyan-glow/10">
                {selected.symbol}
              </div>
              <h3 className="text-white font-bold text-xl mb-1">{selected.name}</h3>
              <p className="text-cyan-glow/70 mb-6">{selected.party}</p>

              <div className="flex items-center gap-2 justify-center text-amber-400 text-sm mb-6 bg-amber-500/5 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4" />
                <span>This action is irreversible on the blockchain.</span>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('select')} className="flex-1 py-3 bg-nexus-800 text-slate-400 font-bold text-sm rounded hover:bg-nexus-700 transition-all">Cancel</button>
                <button onClick={handleConfirm} className="flex-1 py-3 bg-cyan-glow text-nexus-950 font-bold text-sm rounded hover:bg-cyan-300 transition-all flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" /> Confirm Vote
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUCCESS */}
        {step === 'success' && selected && currentVoter && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center pt-10"
          >
            <div className="glass rounded-xl p-10 border border-emerald-500/20">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </motion.div>
              <h3 className="text-white font-bold text-xl mb-2">Vote Cast Successfully</h3>
              <p className="text-slate-400 text-sm mb-4">Your vote has been encrypted and recorded on the blockchain.</p>
              <div className="bg-nexus-900 rounded-lg p-4 mb-6">
                <div className="text-xs text-slate-500 mb-1">Transaction Hash</div>
                <div className="text-emerald-400 font-mono text-xs break-all">{txHash}</div>
              </div>
              <div className="flex items-center gap-2 justify-center text-emerald-400 text-sm mb-6">
                <Shield className="w-4 h-4" /> <span>VVPAT receipt generated</span>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowReceipt(true)}
                  className="w-full py-3 bg-cyan-glow text-nexus-950 font-bold text-sm rounded hover:bg-cyan-300 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  View & Download VVPAT Receipt
                </button>
                <button
                  onClick={handleReset}
                  className="w-full py-3 bg-nexus-800 border border-cyan-glow/20 text-cyan-glow font-bold text-sm rounded hover:bg-nexus-700 transition-all"
                >
                  Return to Enclave
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VVPAT Receipt Modal */}
      {showReceipt && currentVoter && selected && (
        <VvpatReceipt
          voterName={`${currentVoter.firstName} ${currentVoter.middleName} ${currentVoter.lastName}`}
          voterId={currentVoter.voterId}
          age={currentVoter.age}
          gender={currentVoter.gender}
          address={currentVoter.address}
          candidateName={selected.name}
          candidateParty={selected.party}
          candidateSymbol={selected.symbol}
          txHash={txHash}
          timestamp={new Date().toISOString()}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  )
}
