import { motion } from 'framer-motion'
import { MapPin, Users, Wifi, ShieldCheck, Clock } from 'lucide-react'

const stations = [
  { id: 'VS-001', name: 'Central District Hub', location: 'Downtown Civic Center', status: 'active', voters: 1247, capacity: 2000, latency: '12ms' },
  { id: 'VS-002', name: 'Northside Terminal', location: 'Metro Station B', status: 'active', voters: 892, capacity: 1500, latency: '18ms' },
  { id: 'VS-003', name: 'Eastgate Pavilion', location: 'Community Plaza', status: 'syncing', voters: 634, capacity: 1200, latency: '24ms' },
  { id: 'VS-004', name: 'Westfield Arena', location: 'Sports Complex', status: 'active', voters: 1567, capacity: 2500, latency: '9ms' },
  { id: 'VS-005', name: 'Southport Station', location: 'Harbor Terminal', status: 'maintenance', voters: 0, capacity: 1800, latency: '--' },
  { id: 'VS-006', name: 'Hillcrest Center', location: 'University Campus', status: 'active', voters: 2103, capacity: 3000, latency: '15ms' },
]

export default function Stations() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h2 className="text-3xl font-black text-white mb-2">VOTING STATIONS</h2>
        <p className="text-slate-400">Real-time monitoring of all biometric polling enclaves.</p>
      </motion.div>

      <div className="grid gap-4">
        {stations.map((station, i) => (
          <motion.div
            key={station.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-lg p-5 hover:border-cyan-glow/30 transition-all group"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  station.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                  station.status === 'syncing' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-bold">{station.name}</h3>
                    <span className={`text-[0.6rem] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
                      station.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      station.status === 'syncing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {station.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mt-0.5">{station.location} &bull; {station.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 md:gap-8">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-glow/50" />
                  <div>
                    <span className="text-white font-bold text-sm">{station.voters.toLocaleString()}</span>
                    <span className="text-slate-600 text-xs"> / {station.capacity.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-cyan-glow/50" />
                  <span className="text-white font-mono text-sm">{station.latency}</span>
                </div>
                <div className="w-24 h-1.5 bg-nexus-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-glow rounded-full transition-all"
                    style={{ width: `${(station.voters / station.capacity) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {[
          { icon: ShieldCheck, label: 'Active Stations', value: '4/6' },
          { icon: Users, label: 'Total Voters', value: '6,443' },
          { icon: Clock, label: 'Avg Latency', value: '15.6ms' },
          { icon: MapPin, label: 'Coverage', value: '98.2%' },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="glass rounded-lg p-5 text-center"
          >
            <card.icon className="w-5 h-5 text-cyan-glow/50 mx-auto mb-2" />
            <div className="text-2xl font-black text-white">{card.value}</div>
            <div className="text-[0.6rem] tracking-wider text-slate-500 uppercase mt-1">{card.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
