import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trash2,
  Edit3,
  Globe,
  Fingerprint,
  AlertCircle,
  CheckCircle,
  X,
  Shield,
  User,
  Calendar,
  MapPin,
  Hash,
  Save,
  Laptop,
  Phone,
  Mail,
  FileText,
  Upload,
  ChevronDown,
} from 'lucide-react'
import {
  findVoterById,
  deleteVoterById,
  updateVoter,
  saveVoter,
  generateVoterId,
  type VoterRecord,
} from '../lib/voterStore'
import {
  isPlatformAuthenticatorAvailable,
  registerFingerprint,
  verifyFingerprint,
} from '../lib/webauthn'

const services = [
  {
    id: 'delete',
    title: 'Delete Registration',
    description: 'Permanently remove your voter identity from the system.',
    icon: Trash2,
    color: 'text-red-400',
    bgColor: 'from-red-500/10 to-red-600/5',
    borderColor: 'border-red-500/20',
    hoverBorder: 'hover:border-red-500/40',
  },
  {
    id: 'edit',
    title: 'Edit Registration',
    description: 'Update your personal details after biometric verification.',
    icon: Edit3,
    color: 'text-amber-400',
    bgColor: 'from-amber-500/10 to-amber-600/5',
    borderColor: 'border-amber-500/20',
    hoverBorder: 'hover:border-amber-500/40',
  },
  {
    id: 'nri',
    title: 'NRI Registration',
    description: 'Register as a Non-Resident Indian voter with passport verification.',
    icon: Globe,
    color: 'text-sky-400',
    bgColor: 'from-sky-500/10 to-sky-600/5',
    borderColor: 'border-sky-500/20',
    hoverBorder: 'hover:border-sky-500/40',
  },
]

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say']
const documentOptions = ['Aadhaar Card', 'PAN Card', 'Passport', 'Driving License', 'Voter ID Card']

export default function ServiceCards() {
  const [activeModal, setActiveModal] = useState<string | null>(null)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="mt-20 w-full max-w-5xl"
      >
        <h3 className="text-center text-sm font-bold tracking-[0.2em] text-slate-500 uppercase mb-8">
          Citizen Services
        </h3>
        <div className="grid md:grid-cols-3 gap-5">
          {services.map((service, i) => (
            <motion.button
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + i * 0.15 }}
              onClick={() => setActiveModal(service.id)}
              className={`glass rounded-xl p-6 text-left border ${service.borderColor} ${service.hoverBorder} transition-all group hover:bg-nexus-800/40`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.bgColor} flex items-center justify-center mb-4 border ${service.borderColor}`}>
                <service.icon className={`w-6 h-6 ${service.color}`} />
              </div>
              <h4 className="text-white font-bold text-sm mb-2 tracking-wide">{service.title}</h4>
              <p className="text-slate-400 text-xs leading-relaxed">{service.description}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {activeModal === 'delete' && <DeleteModal onClose={() => setActiveModal(null)} />}
        {activeModal === 'edit' && <EditModal onClose={() => setActiveModal(null)} />}
        {activeModal === 'nri' && <NriModal onClose={() => setActiveModal(null)} />}
      </AnimatePresence>
    </>
  )
}

/* ---------- DELETE MODAL ---------- */
function DeleteModal({ onClose }: { onClose: () => void }) {
  const [voterId, setVoterId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleDelete = () => {
    setError(''); setSuccess('')
    if (!voterId.trim()) { setError('Please enter your Voter ID'); return }
    const voter = findVoterById(voterId.trim().toUpperCase())
    if (!voter) { setError('Voter ID not found.'); return }
    const ok = deleteVoterById(voter.voterId)
    if (ok) { setSuccess(`Voter ID ${voter.voterId} has been permanently deleted.`); setVoterId('') }
    else { setError('Deletion failed. Please try again.') }
  }

  return (
    <ModalWrapper onClose={onClose} title="Delete Registration" icon={Trash2} iconColor="text-red-400">
      <p className="text-slate-400 text-sm mb-5">Enter your Voter ID to permanently remove your registration. This action cannot be undone.</p>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Voter ID</label>
          <input type="text" value={voterId} onChange={(e) => setVoterId(e.target.value)} placeholder="e.g. VID-A3F9B2" className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-red-400/40 transition-colors font-mono tracking-wider uppercase" />
        </div>
        {error && <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/5 rounded-lg p-3 border border-red-500/10"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}
        {success && <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/10"><CheckCircle className="w-4 h-4 shrink-0" /> {success}</div>}
        <button onClick={handleDelete} className="w-full py-3 bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-sm rounded hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" /> Permanently Delete</button>
      </div>
    </ModalWrapper>
  )
}

/* ---------- EDIT MODAL ---------- */
function EditModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'id' | 'auth' | 'edit'>('id')
  const [voterId, setVoterId] = useState('')
  const [voter, setVoter] = useState<VoterRecord | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [scanProgress, setScanProgress] = useState(0)

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

  const handleLookup = () => {
    setError('')
    if (!voterId.trim()) { setError('Enter Voter ID'); return }
    const v = findVoterById(voterId.trim().toUpperCase())
    if (!v) { setError('Voter ID not found.'); return }
    setVoter(v)
    setStep('auth')
  }

  const handleAuth = async () => {
    if (!voter) return
    setError('')
    setScanProgress(0)
    const result = await verifyFingerprint(voter.fingerprintCredentialId, (pct) => setScanProgress(pct))
    if (!result.success) { setScanProgress(0); setError(result.error || 'Verification failed.'); return }
    setFirstName(voter.firstName)
    setMiddleName(voter.middleName)
    setLastName(voter.lastName)
    setAge(String(voter.age))
    setGender(voter.gender)
    setPhone(voter.phone)
    setEmail(voter.email)
    setCountry(voter.address.country)
    setState(voter.address.state)
    setCity(voter.address.city)
    setTaluka(voter.address.taluka)
    setDocumentType(voter.documentType)
    setDocumentNumber(voter.documentNumber)
    setStep('edit')
  }

  const handleSave = () => {
    setError('')
    if (!voter) return
    if (!firstName.trim() || !lastName.trim() || !age.trim() || !gender || !phone.trim() || !email.trim() || !country.trim() || !state.trim() || !city.trim() || !taluka.trim() || !documentType || !documentNumber.trim()) {
      setError('All fields are required.'); return
    }
    const n = Number(age)
    if (isNaN(n) || n < 18) { setError('Age must be 18+'); return }
    if (!/^\d{10}$/.test(phone.trim())) { setError('Invalid phone number'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Invalid email'); return }

    updateVoter(voter.voterId, {
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      age: n,
      gender,
      phone: phone.trim(),
      email: email.trim(),
      address: { country: country.trim(), state: state.trim(), city: city.trim(), taluka: taluka.trim() },
      documentType,
      documentNumber: documentNumber.trim(),
    })
    setSuccess('Your registration has been updated successfully.')
  }

  return (
    <ModalWrapper onClose={onClose} title="Edit Registration" icon={Edit3} iconColor="text-amber-400">
      {step === 'id' && (
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">Enter your Voter ID to begin the verification process.</p>
          <input type="text" value={voterId} onChange={(e) => setVoterId(e.target.value)} placeholder="e.g. VID-A3F9B2" className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-400/40 transition-colors font-mono tracking-wider uppercase" />
          {error && <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/5 rounded-lg p-3 border border-red-500/10"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}
          <button onClick={handleLookup} className="w-full py-3 bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-sm rounded hover:bg-amber-500/30 transition-all">Continue</button>
        </div>
      )}
      {step === 'auth' && voter && (
        <div className="text-center space-y-4">
          <p className="text-slate-400 text-sm">Verify your identity with your registered fingerprint.</p>
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-amber-400/20" />
            <div className="absolute inset-2 rounded-full border border-amber-400/10" />
            <div className="absolute inset-0 flex items-center justify-center"><Fingerprint className="w-10 h-10 text-amber-400" /></div>
            {scanProgress > 0 && <div className="scan-line" style={{ borderRadius: '50%' }} />}
          </div>
          {scanProgress > 0 && <div className="w-full h-1.5 bg-nexus-700 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{ width: `${scanProgress}%` }} /></div>}
          {error && <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/5 rounded-lg p-3 border border-red-500/10"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}
          <div className="flex gap-3">
            <button onClick={() => setStep('id')} className="flex-1 py-2.5 bg-nexus-800 text-slate-400 font-bold text-sm rounded hover:bg-nexus-700 transition-all">Back</button>
            <button onClick={handleAuth} disabled={scanProgress > 0 && scanProgress < 100} className="flex-1 py-2.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-sm rounded hover:bg-amber-500/30 transition-all disabled:opacity-50">Verify</button>
          </div>
        </div>
      )}
      {step === 'edit' && (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[0.6rem] text-slate-500 uppercase tracking-wider mb-1 block">First Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400/40 transition-colors" />
            </div>
            <div>
              <label className="text-[0.6rem] text-slate-500 uppercase tracking-wider mb-1 block">Middle Name</label>
              <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400/40 transition-colors" />
            </div>
            <div>
              <label className="text-[0.6rem] text-slate-500 uppercase tracking-wider mb-1 block">Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400/40 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[0.6rem] text-slate-500 uppercase tracking-wider mb-1 block">Age</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400/40 transition-colors" />
            </div>
            <div>
              <label className="text-[0.6rem] text-slate-500 uppercase tracking-wider mb-1 block">Gender</label>
              <div className="relative">
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400/40 transition-colors appearance-none cursor-pointer">
                  <option value="" className="bg-nexus-900">Select</option>
                  {genderOptions.map((g) => <option key={g} value={g} className="bg-nexus-900">{g}</option>)}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[0.6rem] text-slate-500 uppercase tracking-wider mb-1 block">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} maxLength={10} className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400/40 transition-colors" />
            </div>
            <div>
              <label className="text-[0.6rem] text-slate-500 uppercase tracking-wider mb-1 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400/40 transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-[0.6rem] text-slate-500 uppercase tracking-wider mb-1 block">Address</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400/40 transition-colors" />
              <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400/40 transition-colors" />
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400/40 transition-colors" />
              <input type="text" value={taluka} onChange={(e) => setTaluka(e.target.value)} placeholder="Taluka" className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400/40 transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-[0.6rem] text-slate-500 uppercase tracking-wider mb-1 block">Identity Document</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400/40 transition-colors appearance-none cursor-pointer">
                  <option value="" className="bg-nexus-900">Document Type</option>
                  {documentOptions.map((d) => <option key={d} value={d} className="bg-nexus-900">{d}</option>)}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <input type="text" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} placeholder="Document Number" className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400/40 transition-colors" />
            </div>
          </div>
          {error && <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/5 rounded-lg p-3 border border-red-500/10"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}
          {success && <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/10"><CheckCircle className="w-4 h-4 shrink-0" /> {success}</div>}
          <button onClick={handleSave} className="w-full py-3 bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-sm rounded hover:bg-amber-500/30 transition-all flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Save Changes</button>
        </div>
      )}
    </ModalWrapper>
  )
}

/* ---------- NRI MODAL ---------- */
function NriModal({ onClose }: { onClose: () => void }) {
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
  const [passport, setPassport] = useState('')
  const [residenceCountry, setResidenceCountry] = useState('')
  const [documentType, setDocumentType] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')
  const [documentFileName, setDocumentFileName] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [registeredVoter, setRegisteredVoter] = useState<VoterRecord | null>(null)
  const [sensorAvailable, setSensorAvailable] = useState<boolean | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setDocumentFileName(file.name)
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!firstName.trim()) e.firstName = 'First name is required'
    if (!lastName.trim()) e.lastName = 'Last name is required'
    if (!age.trim()) e.age = 'Age is required'
    else {
      const n = Number(age)
      if (isNaN(n) || n < 18) e.age = 'Must be 18 years or older'
    }
    if (!gender) e.gender = 'Gender is required'
    if (!phone.trim()) e.phone = 'Phone is required'
    else if (!/^\d{10}$/.test(phone.trim())) e.phone = 'Invalid phone'
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Invalid email'
    if (!country.trim()) e.country = 'Country is required'
    if (!state.trim()) e.state = 'State is required'
    if (!city.trim()) e.city = 'City is required'
    if (!taluka.trim()) e.taluka = 'Taluka is required'
    if (!passport.trim()) e.passport = 'Passport number is required'
    if (!residenceCountry.trim()) e.residenceCountry = 'Country of residence is required'
    if (!documentType) e.documentType = 'Document type is required'
    if (!documentNumber.trim()) e.documentNumber = 'Document number is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleRegister = async () => {
    if (!validate()) return
    if (sensorAvailable === false) {
      setErrors({ general: 'No platform authenticator detected.' })
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
      isNri: true,
      passportNumber: passport.trim(),
      countryOfResidence: residenceCountry.trim(),
      documentType,
      documentNumber: documentNumber.trim(),
      documentFileName: documentFileName || undefined,
    }
    saveVoter(newVoter)
    setRegisteredVoter(newVoter)
    setTimeout(() => { setScanning(false); setScanProgress(0) }, 600)
  }

  return (
    <ModalWrapper onClose={onClose} title="NRI Registration" icon={Globe} iconColor="text-sky-400">
      {registeredVoter ? (
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-1">NRI Identity Registered</h3>
          <p className="text-slate-400 text-sm mb-4">Your biometric profile has been cryptographically sealed.</p>
          <div className="bg-nexus-900 rounded-lg p-4 mb-4 border border-cyan-glow/10">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Your Voter ID</div>
            <div className="text-cyan-glow font-mono text-base font-bold tracking-wider">{registeredVoter.voterId}</div>
          </div>
          <button onClick={onClose} className="px-6 py-2.5 bg-cyan-glow text-nexus-950 font-bold text-sm rounded hover:bg-cyan-300 transition-all">Done</button>
        </div>
      ) : (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {sensorAvailable === false && (
            <div className="flex items-center gap-3 text-amber-400 text-sm bg-amber-500/5 rounded-lg p-3 border border-amber-500/10">
              <Laptop className="w-4 h-4 shrink-0" />
              <span className="text-xs">Platform authenticator not detected. Enroll fingerprint in system settings.</span>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[0.6rem] text-slate-500 uppercase tracking-wider mb-1 block">First Name *</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400/40 transition-colors" />
              {errors.firstName && <p className="text-red-400 text-[0.6rem] mt-0.5">{errors.firstName}</p>}
            </div>
            <div>
              <label className="text-[0.6rem] text-slate-500 uppercase tracking-wider mb-1 block">Middle Name</label>
              <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400/40 transition-colors" />
            </div>
            <div>
              <label className="text-[0.6rem] text-slate-500 uppercase tracking-wider mb-1 block">Last Name *</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400/40 transition-colors" />
              {errors.lastName && <p className="text-red-400 text-[0.6rem] mt-0.5">{errors.lastName}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[0.6rem] text-slate-500 uppercase tracking-wider mb-1 block">Age *</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400/40 transition-colors" />
              {errors.age && <p className="text-red-400 text-[0.6rem] mt-0.5">{errors.age}</p>}
            </div>
            <div>
              <label className="text-[0.6rem] text-slate-500 uppercase tracking-wider mb-1 block">Gender *</label>
              <div className="relative">
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400/40 transition-colors appearance-none cursor-pointer">
                  <option value="" className="bg-nexus-900">Select</option>
                  {genderOptions.map((g) => <option key={g} value={g} className="bg-nexus-900">{g}</option>)}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.gender && <p className="text-red-400 text-[0.6rem] mt-0.5">{errors.gender}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[0.6rem] text-slate-500 uppercase tracking-wider mb-1 block">Phone *</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} maxLength={10} className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400/40 transition-colors" />
              {errors.phone && <p className="text-red-400 text-[0.6rem] mt-0.5">{errors.phone}</p>}
            </div>
            <div>
              <label className="text-[0.6rem] text-slate-500 uppercase tracking-wider mb-1 block">Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400/40 transition-colors" />
              {errors.email && <p className="text-red-400 text-[0.6rem] mt-0.5">{errors.email}</p>}
            </div>
          </div>
          <div>
            <label className="text-[0.6rem] text-slate-500 uppercase tracking-wider mb-1 block">Address in India *</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400/40 transition-colors" />
              <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400/40 transition-colors" />
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400/40 transition-colors" />
              <input type="text" value={taluka} onChange={(e) => setTaluka(e.target.value)} placeholder="Taluka" className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400/40 transition-colors" />
            </div>
            {(errors.country || errors.state || errors.city || errors.taluka) && (
              <p className="text-red-400 text-[0.6rem] mt-0.5">All address fields are required.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[0.6rem] text-slate-500 uppercase tracking-wider mb-1 block">Passport *</label>
              <input type="text" value={passport} onChange={(e) => setPassport(e.target.value)} className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400/40 transition-colors" />
              {errors.passport && <p className="text-red-400 text-[0.6rem] mt-0.5">{errors.passport}</p>}
            </div>
            <div>
              <label className="text-[0.6rem] text-slate-500 uppercase tracking-wider mb-1 block">Residence Country *</label>
              <input type="text" value={residenceCountry} onChange={(e) => setResidenceCountry(e.target.value)} className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400/40 transition-colors" />
              {errors.residenceCountry && <p className="text-red-400 text-[0.6rem] mt-0.5">{errors.residenceCountry}</p>}
            </div>
          </div>
          <div>
            <label className="text-[0.6rem] text-slate-500 uppercase tracking-wider mb-1 block">Identity Document *</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400/40 transition-colors appearance-none cursor-pointer">
                  <option value="" className="bg-nexus-900">Document Type</option>
                  {documentOptions.map((d) => <option key={d} value={d} className="bg-nexus-900">{d}</option>)}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <input type="text" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} placeholder="Document Number" className="w-full bg-nexus-900/80 border border-nexus-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-400/40 transition-colors" />
            </div>
            {(errors.documentType || errors.documentNumber) && <p className="text-red-400 text-[0.6rem] mt-0.5">Document details required.</p>}
            <label className="flex items-center gap-2 px-3 py-2 mt-2 bg-nexus-900/80 border border-dashed border-nexus-600 rounded-lg cursor-pointer hover:border-sky-400/40 transition-colors group">
              <Upload className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
              <span className="text-slate-400 text-xs group-hover:text-sky-400 transition-colors">{documentFileName || 'Upload document scan'}</span>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div className="relative bg-nexus-900 rounded-xl p-5 border border-cyan-glow/10 text-center">
            <Fingerprint className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            {scanning ? (
              <div>
                <div className="flex justify-between text-xs text-cyan-glow mb-1"><span>Capturing...</span><span>{scanProgress}%</span></div>
                <div className="w-full h-1.5 bg-nexus-700 rounded-full overflow-hidden"><div className="h-full bg-cyan-glow rounded-full" style={{ width: `${scanProgress}%` }} /></div>
              </div>
            ) : (
              <button onClick={handleRegister} disabled={scanning || sensorAvailable === false} className="px-6 py-2 bg-cyan-glow text-nexus-950 font-bold text-xs rounded hover:bg-cyan-300 transition-all disabled:opacity-40">
                Register Fingerprint
              </button>
            )}
          </div>

          {errors.general && <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/5 rounded-lg p-3 border border-red-500/10"><AlertCircle className="w-4 h-4 shrink-0" /> {errors.general}</div>}
        </div>
      )}
    </ModalWrapper>
  )
}

/* ---------- MODAL WRAPPER ---------- */
function ModalWrapper({ onClose, title, icon: Icon, iconColor, children }: {
  onClose: () => void
  title: string
  icon: React.ElementType
  iconColor: string
  children: React.ReactNode
}) {
  return (
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
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto glass-strong rounded-2xl border border-cyan-glow/20 shadow-2xl"
      >
        <div className="flex items-center justify-between p-5 border-b border-cyan-glow/10 sticky top-0 bg-nexus-950/90 backdrop-blur-md z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${iconColor}`} />
            <h2 className="text-white font-bold tracking-wide">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-nexus-800 transition-colors text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </motion.div>
  )
}
