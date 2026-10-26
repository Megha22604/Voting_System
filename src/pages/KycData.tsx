import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  GraduationCap,
  Briefcase,
  MapPin,
  Calendar,
  ShieldCheck,
  Vote,
  ChevronRight,
  X,
} from 'lucide-react'

interface Candidate {
  id: string
  name: string
  party: string
  symbol: string
  age: number
  education: string
  experience: string
  constituency: string
  bio: string
  manifesto: string[]
  color: string
  borderColor: string
}

const candidates: Candidate[] = [
  {
    id: 'C1',
    name: 'Dr. Elena Vasquez',
    party: 'Progressive Alliance',
    symbol: '🌿',
    age: 52,
    education: 'Ph.D. Public Policy, Harvard University',
    experience: 'Senator (12 yrs), UN Climate Advisor',
    constituency: 'Central District',
    bio: 'Dr. Vasquez is a renowned climate scientist turned policymaker. She has dedicated her career to sustainable development and social equity, authoring landmark environmental legislation.',
    manifesto: [
      'Net-zero carbon emissions by 2035',
      'Universal healthcare expansion',
      'Free public education through university',
      'Green infrastructure investment',
    ],
    color: 'from-emerald-500/15 to-emerald-600/5',
    borderColor: 'border-emerald-500/20',
  },
  {
    id: 'C2',
    name: 'James Whitfield',
    party: 'Liberty Front',
    symbol: '⚡',
    age: 45,
    education: 'MBA, Wharton School of Business',
    experience: 'Tech CEO (15 yrs), Economic Council Chair',
    constituency: 'Northside Terminal',
    bio: 'A self-made entrepreneur who built a Fortune 500 tech company from scratch. Whitfield champions free-market principles, deregulation, and technological innovation.',
    manifesto: [
      'Corporate tax reduction to 18%',
      'Deregulation of emerging industries',
      'National digital infrastructure rollout',
      'Privatization of state utilities',
    ],
    color: 'from-amber-500/15 to-amber-600/5',
    borderColor: 'border-amber-500/20',
  },
  {
    id: 'C3',
    name: 'Amara Osei',
    party: 'Unity Coalition',
    symbol: '☮️',
    age: 38,
    education: 'LL.B., Oxford University; M.A. Diplomacy',
    experience: 'Foreign Minister (6 yrs), Peace Corps Director',
    constituency: 'Eastgate Pavilion',
    bio: 'A diplomat and human rights advocate, Osei has brokered three international peace treaties. She believes in coalition-building and inclusive governance.',
    manifesto: [
      'Electoral reform and proportional representation',
      'Mandatory national service program',
      'Affordable housing for all citizens',
      'Diplomatic-first foreign policy',
    ],
    color: 'from-sky-500/15 to-sky-600/5',
    borderColor: 'border-sky-500/20',
  },
  {
    id: 'C4',
    name: 'Rafael Kim',
    party: 'Future Forward',
    symbol: '🚀',
    age: 41,
    education: 'M.S. Aerospace Engineering, MIT',
    experience: 'NASA Scientist (10 yrs), Innovation Czar',
    constituency: 'Westfield Arena',
    bio: 'An aerospace engineer who led the Mars Habitat Program. Kim envisions a nation driven by scientific breakthroughs, space exploration, and AI-driven governance.',
    manifesto: [
      'National AI research initiative',
      'Space program funding increase 300%',
      'Universal basic income pilot program',
      'Smart city infrastructure nationwide',
    ],
    color: 'from-violet-500/15 to-violet-600/5',
    borderColor: 'border-violet-500/20',
  },
]

export default function KycData() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h2 className="text-3xl font-black text-white mb-2">KYC CANDIDATE DATA</h2>
        <p className="text-slate-400">
          Verified candidate profiles. Know Your Candidate before you cast.
        </p>
      </motion.div>

      {/* Candidate Grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {candidates.map((candidate, i) => (
          <motion.button
            key={candidate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedCandidate(candidate)}
            className={`glass rounded-xl p-6 text-left hover:border-cyan-glow/30 transition-all group border ${candidate.borderColor}`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${candidate.color} flex items-center justify-center text-3xl border ${candidate.borderColor} group-hover:scale-105 transition-transform`}>
                {candidate.symbol}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-lg">{candidate.name}</h3>
                <p className="text-cyan-glow/70 text-sm">{candidate.party}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {candidate.age} yrs
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {candidate.constituency}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-glow transition-colors shrink-0 mt-2" />
            </div>

            <div className="mt-4 pt-4 border-t border-nexus-700/50">
              <p className="text-slate-400 text-sm line-clamp-2">{candidate.bio}</p>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[0.6rem] text-emerald-400 uppercase tracking-wider font-bold">
                Identity Verified by Electoral Commission
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCandidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedCandidate(null)}
          >
            <div className="absolute inset-0 bg-nexus-950/80 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-strong rounded-2xl border border-cyan-glow/20 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b border-cyan-glow/10">
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedCandidate.color} flex items-center justify-center text-3xl border ${selectedCandidate.borderColor}`}>
                    {selectedCandidate.symbol}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">{selectedCandidate.name}</h3>
                    <p className="text-cyan-glow/70 text-sm">{selectedCandidate.party}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[0.6rem] text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> KYC Verified
                      </span>
                      <span className="text-[0.6rem] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Vote className="w-3 h-3" /> Candidate #{selectedCandidate.id}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="p-2 rounded-lg hover:bg-nexus-800 transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-lg p-4">
                    <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider mb-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Age
                    </div>
                    <div className="text-white font-bold">{selectedCandidate.age} years</div>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider mb-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Constituency
                    </div>
                    <div className="text-white font-bold">{selectedCandidate.constituency}</div>
                  </div>
                  <div className="glass rounded-lg p-4 col-span-2">
                    <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider mb-1.5">
                      <GraduationCap className="w-3.5 h-3.5" /> Education
                    </div>
                    <div className="text-white font-semibold text-sm">{selectedCandidate.education}</div>
                  </div>
                  <div className="glass rounded-lg p-4 col-span-2">
                    <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider mb-1.5">
                      <Briefcase className="w-3.5 h-3.5" /> Experience
                    </div>
                    <div className="text-white font-semibold text-sm">{selectedCandidate.experience}</div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-glow" /> Biography
                  </h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{selectedCandidate.bio}</p>
                </div>

                {/* Manifesto */}
                <div>
                  <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                    <Vote className="w-4 h-4 text-cyan-glow" /> Key Manifesto Points
                  </h4>
                  <div className="space-y-2">
                    {selectedCandidate.manifesto.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-3 glass rounded-lg p-3">
                        <span className="w-5 h-5 rounded-full bg-cyan-glow/10 flex items-center justify-center text-cyan-glow text-xs font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-slate-300 text-sm">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
