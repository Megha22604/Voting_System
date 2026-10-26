import { motion } from 'framer-motion'
import { TrendingUp, Users, Vote, Clock, Activity, BarChart3 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getVoteCounts, getTotalVotes, getRegisteredVoterCount, getVotedCount } from '../lib/voteStore'

export default function Analytics() {
  const [voteData, setVoteData] = useState(getVoteCounts())
  const [animatedVotes, setAnimatedVotes] = useState<number[]>([])
  const [totalVotes, setTotalVotes] = useState(0)
  const [registeredCount, setRegisteredCount] = useState(0)
  const [votedCount, setVotedCount] = useState(0)

  useEffect(() => {
    const data = getVoteCounts()
    const total = getTotalVotes()
    setVoteData(data)
    setTotalVotes(total)
    setRegisteredCount(getRegisteredVoterCount())
    setVotedCount(getVotedCount())
    setAnimatedVotes(data.map(() => 0))
  }, [])

  useEffect(() => {
    if (totalVotes === 0) {
      setAnimatedVotes(voteData.map(() => 0))
      return
    }
    const duration = 1500
    const start = Date.now()
    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedVotes(voteData.map((c) => Math.round(c.votes * eased)))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [voteData, totalVotes])

  const maxVotes = Math.max(...voteData.map((c) => c.votes), 1)
  const leadingCandidate = voteData.reduce((max, c) => (c.votes > max.votes ? c : max), voteData[0])
  const turnoutPct = registeredCount > 0 ? ((votedCount / registeredCount) * 100).toFixed(1) : '0.0'

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h2 className="text-3xl font-black text-white mb-2">LIVE ANALYTICS</h2>
        <p className="text-slate-400">Real-time cryptographic tally of the democratic process.</p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: 'Registered Voters', value: registeredCount.toLocaleString(), change: 'Total' },
          { icon: Vote, label: 'Votes Cast', value: totalVotes.toLocaleString(), change: `${votedCount} voted` },
          { icon: Activity, label: 'Turnout', value: `${turnoutPct}%`, change: 'Live' },
          { icon: Clock, label: 'Candidates', value: voteData.length.toString(), change: 'Active' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-5 h-5 text-cyan-glow/50" />
              <span className={`text-xs font-bold ${stat.change === 'Live' ? 'text-cyan-glow' : 'text-emerald-400'}`}>
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-black text-white">{stat.value}</div>
            <div className="text-[0.6rem] tracking-wider text-slate-500 uppercase mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-cyan-glow" />
            <h3 className="text-white font-bold">Vote Distribution</h3>
          </div>

          {totalVotes === 0 ? (
            <div className="text-center py-16">
              <Vote className="w-10 h-10 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 text-sm">No votes have been cast yet.</p>
              <p className="text-slate-600 text-xs mt-1">Cast your first vote to see live results.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {voteData.map((candidate, i) => {
                const pct = totalVotes > 0 ? (animatedVotes[i] / totalVotes) * 100 : 0
                const barWidth = maxVotes > 0 ? (animatedVotes[i] / maxVotes) * 100 : 0
                return (
                  <div key={candidate.candidateId}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: candidate.color }} />
                        <span className="text-white font-semibold text-sm">{candidate.candidateName}</span>
                        <span className="text-slate-500 text-xs">{candidate.party}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-bold text-sm">{animatedVotes[i].toLocaleString()}</span>
                        <span className="text-slate-500 text-xs ml-2">({pct.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-nexus-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: candidate.color,
                          width: `${barWidth}%`,
                          boxShadow: `0 0 10px ${candidate.color}40`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Pie / Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-cyan-glow" />
              <h3 className="text-white font-bold">Leading Candidate</h3>
            </div>
            {totalVotes === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-500 text-sm">No votes yet</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border-2"
                  style={{ borderColor: leadingCandidate.color, backgroundColor: `${leadingCandidate.color}15` }}
                >
                  <span className="text-2xl font-black" style={{ color: leadingCandidate.color }}>
                    {leadingCandidate.candidateName.charAt(0)}
                  </span>
                </div>
                <h4 className="text-white font-bold">{leadingCandidate.candidateName}</h4>
                <p className="text-sm" style={{ color: leadingCandidate.color }}>{leadingCandidate.party}</p>
                <div className="text-3xl font-black text-white mt-2">
                  {totalVotes > 0 ? ((leadingCandidate.votes / totalVotes) * 100).toFixed(1) : '0.0'}%
                </div>
                <p className="text-slate-500 text-xs">of total votes cast</p>
              </div>
            )}
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-white font-bold text-sm mb-4">Vote Breakdown</h3>
            {voteData.map((candidate) => (
              <div key={candidate.candidateId} className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: candidate.color }} />
                  <span className="text-slate-300 text-xs">{candidate.candidateName}</span>
                </div>
                <span className="text-white text-xs font-bold">{candidate.votes}</span>
              </div>
            ))}
            <div className="border-t border-nexus-700 pt-3 mt-2 flex items-center justify-between">
              <span className="text-slate-400 text-xs">Total</span>
              <span className="text-cyan-glow text-xs font-bold">{totalVotes}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
