import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Fingerprint,
  CheckCircle,
  AlertCircle,
  User,
  Hash,
  MapPin,
  Calendar,
  Shield,
  RotateCcw,
  Copy,
  Check,
  Laptop,
  X,
  Phone,
  Mail,
  Upload,
  FileText,
  ChevronDown,
} from 'lucide-react'
import {
  saveVoter,
  generateVoterId,
  type VoterRecord,
} from '../lib/voterStore'
import {
  isPlatformAuthenticatorAvailable,
  registerFingerprint,
} from '../lib/webauthn'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
}

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say']
const documentOptions = ['Aadhaar Card', 'PAN Card', 'Passport', 'Driving License', 'Voter ID Card']

export default function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [taluka, setTaluka] = useState('')
  const [documentType, setDocumentType] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')
  const [documentFileName, setDocumentFileName] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [registeredVoter, setRegisteredVoter] = useState<VoterRecord | null>(null)
  const [copied, setCopied] = useState(false)
  const [sensorAvailable, setSensorAvailable] = useState<boolean | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (isOpen) {
      isPlatformAuthenticatorAvailable().then(setSensorAvailable)
      resetAll()
    }
  }, [isOpen])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.25)'
    ctx.lineWidth = 1.2
    const cx = w / 2
    const cy = h / 2
    for (let i = 0; i < 22; i++) {
      ctx.beginPath()
      const r = 12 + i * 5.5
      const sa = Math.random() * Math.PI
      const ea = sa + Math.PI * 1.6
      ctx.arc(cx, cy, r, sa, ea)
      ctx.stroke()
    }
    for (let i = 0; i < 35; i++) {
      ctx.beginPath()
      const x1 = Math.random() * w
      const y1 = Math.random() * h
      ctx.moveTo(x1, y1)
      ctx.lineTo(x1 + (Math.random() - 0.5) * 35, y1 + (Math.random() - 0.5) * 35)
      ctx.stroke()
    }
  }, [registeredVoter, scanning])

  const resetAll = () => {
    setRegisteredVoter(null)
    setFirstName(''); setMiddleName(''); setLastName('')
    setAge(''); setGender(''); setPhone(''); setEmail('')
    setCountry(''); setState(''); setCity(''); setTaluka('')
    setDocumentType(''); setDocumentNumber(''); setDocumentFileName('')
    setErrors({})
    setScanning(false)
    setScanProgress(0)
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!firstName.trim()) e.firstName = 'First name is required'
    if (!lastName.trim()) e.lastName = 'Last name is required'
    if (!age.trim()) e.age = 'Age is required'
    else {
      const n = Number(age)
      if (isNaN(n) || n < 18) e.age = 'Must be 18 years or older'
      if (n > 120) e.age = 'Please enter a valid age'
    }
    if (!gender) e.gender = 'Gender is required'
    if (!phone.trim()) e.phone = 'Phone number is required'
    else if (!/^\d{10}$/.test(phone.trim())) e.phone = 'Enter a valid 10-digit phone number'
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email address'
    if (!country.trim()) e.country = 'Country is required'
    if (!state.trim()) e.state = 'State is required'
    if (!city.trim()) e.city = 'City is required'
    if (!taluka.trim()) e.taluka = 'Taluka is required'
    if (!documentType) e.documentType = 'Document type is required'
    if (!documentNumber.trim()) e.documentNumber = 'Document number is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDocumentFileName(file.name)
    }
  }

  const handleRegisterFingerprint = async () => {
    if (!validate()) return
    if (sensorAvailable === false) {
      setErrors({ general: 'No platform authenticator detected. Please enroll your fingerprint in Windows Hello / Touch ID / system settings first.' })
      return
    }

    setScanning(true)
    setScanProgress(0)
    setErrors({})

    const fullName = `${firstName.trim()} ${middleName.trim()} ${lastName.trim()}`.replace(/\s+/g, ' ').trim()
    const result = await registerFingerprint(fullName, (pct) => setScanProgress(pct))

    if (!result.success) {
      setScanning(false)
      setScanProgress(0)
      setErrors({ general: result.error || 'Registration failed.' })
      return
    }

    const voterId = generateVoterId()
    const newVoter: VoterRecord = {
      id: `V-${Date.now().toString(36).toUpperCase()}`,
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      age: Number(age),
      gender,
      phone: phone.trim(),
      email: email.trim(),
      address: { country: country.trim(), state: state.trim(), city: city.trim(), taluka: taluka.trim() },
      voterId,
      fingerprintCredentialId: result.credentialId,
      registeredAt: new Date().toISOString(),
      hasVoted: false,
      documentType,
      documentNumber: documentNumber.trim(),
      documentFileName: documentFileName || undefined,
    }

    saveVoter(newVoter)
    setRegisteredVoter(newVoter)
    setTimeout(() => { setScanning(false); setScanProgress(0) }, 600)
  }

  const copyVoterId = () => {
    if (registeredVoter) {
      navigator.clipboard.writeText(registeredVoter.voterId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const fullName = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ').trim()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-nexus-950/80 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto glass-strong rounded-2xl border border-cyan-glow/20 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-cyan-glow/10 sticky top-0 bg-nexus-950/90 backdrop-blur-md z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-cyan-glow" />
                <h2 className="text-white font-bold text-lg tracking-wide">Initialize Identity</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-nexus-800 transition-colors text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <AnimatePresence mode="wait">
                {registeredVoter ? (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </motion.div>
                    <h3 className="text-white font-bold text-xl mb-1">Identity Registered</h3>
                    <p className="text-slate-400 text-sm mb-6">Your biometric profile has been cryptographically sealed.</p>

                    <div className="bg-nexus-900 rounded-lg p-5 mb-6 border border-cyan-glow/10">
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Your Voter ID</div>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-cyan-glow font-mono text-lg font-bold tracking-wider">{registeredVoter.voterId}</span>
                        <button onClick={copyVoterId} className="p-1.5 rounded hover:bg-cyan-glow/10 transition-colors" title="Copy Voter ID">
                          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-glow/60" />}
                        </button>
                      </div>
                      <p className="text-xs text-amber-400/70 mt-2">Save this ID. You will need it to enter the voting enclave.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-left mb-6">
                      <div className="glass rounded-lg p-3">
                        <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><User className="w-3 h-3" /> Name</div>
                        <div className="text-white font-semibold text-sm">{registeredVoter.firstName} {registeredVoter.middleName} {registeredVoter.lastName}</div>
                      </div>
                      <div className="glass rounded-lg p-3">
                        <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><Calendar className="w-3 h-3" /> Age / Gender</div>
                        <div className="text-white font-semibold text-sm">{registeredVoter.age} yrs / {registeredVoter.gender}</div>
                      </div>
                      <div className="glass rounded-lg p-3">
                        <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><Phone className="w-3 h-3" /> Phone</div>
                        <div className="text-white font-semibold text-sm">{registeredVoter.phone}</div>
                      </div>
                      <div className="glass rounded-lg p-3">
                        <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><Mail className="w-3 h-3" /> Email</div>
                        <div className="text-white font-semibold text-sm truncate">{registeredVoter.email}</div>
                      </div>
                      <div className="glass rounded-lg p-3 col-span-2">
                        <div className="flex items-center gap-2 text-slate-500 text-xs mb-1"><MapPin className="w-3 h-3" /> Address</div>
                        <div className="text-white font-semibold text-sm">{registeredVoter.address.taluka}, {registeredVoter.address.city}, {registeredVoter.address.state}, {registeredVoter.address.country}</div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={resetAll} className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-nexus-800 border border-cyan-glow/20 text-cyan-glow font-bold text-sm rounded hover:bg-nexus-700 transition-all">
                        <RotateCcw className="w-4 h-4" /> Register Another
                      </button>
                      <button onClick={onClose} className="flex-1 px-6 py-2.5 bg-cyan-glow text-nexus-950 font-bold text-sm rounded hover:bg-cyan-300 transition-all">Done</button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                    {/* Sensor Status */}
                    {sensorAvailable === false && (
                      <div className="flex items-center gap-3 text-amber-400 text-sm bg-amber-500/5 rounded-lg p-4 border border-amber-500/10">
                        <Laptop className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="font-semibold">Platform authenticator not detected</p>
                          <p className="text-xs text-amber-400/70 mt-0.5">Please enroll a fingerprint in your system settings (Windows Hello / Touch ID) and refresh this page.</p>
                        </div>
                      </div>
                    )}
                    {sensorAvailable === true && (
                      <div className="flex items-center gap-3 text-emerald-400 text-sm bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/10">
                        <Fingerprint className="w-4 h-4 shrink-0" />
                        <span className="font-semibold">Platform authenticator ready</span>
                      </div>
                    )}

                    {/* Name Section */}
                    <div>
                      <label className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider mb-2"><User className="w-3 h-3" /> Full Name</label>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name *" className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-glow/40 transition-colors" />
                          {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
                        </div>
                        <div>
                          <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Middle Name" className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-glow/40 transition-colors" />
                        </div>
                        <div>
                          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name *" className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-glow/40 transition-colors" />
                          {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Age & Gender */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider mb-1.5"><Calendar className="w-3 h-3" /> Age</label>
                        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Must be 18+" min={18} className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-glow/40 transition-colors" />
                        {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age}</p>}
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider mb-1.5"><User className="w-3 h-3" /> Gender</label>
                        <div className="relative">
                          <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-glow/40 transition-colors appearance-none cursor-pointer">
                            <option value="" className="bg-nexus-900">Select Gender</option>
                            {genderOptions.map((g) => <option key={g} value={g} className="bg-nexus-900">{g}</option>)}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {errors.gender && <p className="text-red-400 text-xs mt-1">{errors.gender}</p>}
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider mb-1.5"><Phone className="w-3 h-3" /> Phone</label>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="10-digit mobile number" maxLength={10} className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-glow/40 transition-colors" />
                        {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider mb-1.5"><Mail className="w-3 h-3" /> Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-glow/40 transition-colors" />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider mb-2"><MapPin className="w-3 h-3" /> Residential Address</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country *" className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-glow/40 transition-colors" />
                          {errors.country && <p className="text-red-400 text-xs mt-1">{errors.country}</p>}
                        </div>
                        <div>
                          <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="State *" className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-glow/40 transition-colors" />
                          {errors.state && <p className="text-red-400 text-xs mt-1">{errors.state}</p>}
                        </div>
                        <div>
                          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City *" className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-glow/40 transition-colors" />
                          {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                        </div>
                        <div>
                          <input type="text" value={taluka} onChange={(e) => setTaluka(e.target.value)} placeholder="Taluka *" className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-glow/40 transition-colors" />
                          {errors.taluka && <p className="text-red-400 text-xs mt-1">{errors.taluka}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Identity Document */}
                    <div>
                      <label className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider mb-2"><FileText className="w-3 h-3" /> Identity Document</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="relative">
                            <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-glow/40 transition-colors appearance-none cursor-pointer">
                              <option value="" className="bg-nexus-900">Select Document Type</option>
                              {documentOptions.map((d) => <option key={d} value={d} className="bg-nexus-900">{d}</option>)}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                          {errors.documentType && <p className="text-red-400 text-xs mt-1">{errors.documentType}</p>}
                        </div>
                        <div>
                          <input type="text" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} placeholder="Document Number *" className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-glow/40 transition-colors" />
                          {errors.documentNumber && <p className="text-red-400 text-xs mt-1">{errors.documentNumber}</p>}
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="flex items-center gap-2 px-4 py-3 bg-nexus-900/80 border border-dashed border-nexus-600 rounded-lg cursor-pointer hover:border-cyan-glow/40 transition-colors group">
                          <Upload className="w-4 h-4 text-slate-500 group-hover:text-cyan-glow transition-colors" />
                          <span className="text-slate-400 text-sm group-hover:text-cyan-glow transition-colors">
                            {documentFileName || 'Upload document scan (PDF/JPG/PNG)'}
                          </span>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
                        </label>
                      </div>
                    </div>

                    {/* Fingerprint Scanner */}
                    <div className="relative bg-nexus-900 rounded-xl p-6 border border-cyan-glow/10 overflow-hidden">
                      <div className="flex flex-col items-center">
                        <div className="relative w-36 h-36 mb-4">
                          <canvas ref={canvasRef} width={144} height={144} className="w-full h-full" />
                          {scanning && (
                            <>
                              <div className="scan-line" />
                              <div className="absolute inset-0 bg-cyan-glow/5 rounded-full" />
                            </>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Fingerprint className={`w-10 h-10 transition-all ${scanning ? 'text-cyan-glow scale-110' : 'text-slate-600'}`} />
                          </div>
                        </div>
                        {scanning ? (
                          <div className="w-full max-w-xs">
                            <div className="flex justify-between text-xs text-cyan-glow mb-1"><span>Capturing biometric...</span><span>{scanProgress}%</span></div>
                            <div className="w-full h-1.5 bg-nexus-700 rounded-full overflow-hidden"><div className="h-full bg-cyan-glow rounded-full" style={{ width: `${scanProgress}%` }} /></div>
                            <p className="text-xs text-slate-500 mt-2 text-center">Touch your fingerprint sensor now</p>
                          </div>
                        ) : (
                          <button onClick={handleRegisterFingerprint} disabled={scanning || sensorAvailable === false} className="flex items-center gap-2 px-8 py-3 bg-cyan-glow text-nexus-950 font-bold text-sm rounded hover:bg-cyan-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                            <Fingerprint className="w-4 h-4" /> Register Fingerprint
                          </button>
                        )}
                      </div>
                    </div>

                    {errors.general && (
                      <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/5 rounded-lg p-3 border border-red-500/10">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {errors.general}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
