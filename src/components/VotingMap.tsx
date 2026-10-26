import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Users, Wifi, Navigation, X } from 'lucide-react'

interface Station {
  id: string
  name: string
  location: string
  status: 'active' | 'syncing' | 'maintenance'
  voters: number
  capacity: number
  latency: string
  x: number
  y: number
}

const stations: Station[] = [
  { id: 'VS-001', name: 'Central District Hub', location: 'Downtown Civic Center', status: 'active', voters: 1247, capacity: 2000, latency: '12ms', x: 50, y: 50 },
  { id: 'VS-002', name: 'Northside Terminal', location: 'Metro Station B', status: 'active', voters: 892, capacity: 1500, latency: '18ms', x: 50, y: 20 },
  { id: 'VS-003', name: 'Eastgate Pavilion', location: 'Community Plaza', status: 'syncing', voters: 634, capacity: 1200, latency: '24ms', x: 80, y: 50 },
  { id: 'VS-004', name: 'Westfield Arena', location: 'Sports Complex', status: 'active', voters: 1567, capacity: 2500, latency: '9ms', x: 20, y: 50 },
  { id: 'VS-005', name: 'Southport Station', location: 'Harbor Terminal', status: 'maintenance', voters: 0, capacity: 1800, latency: '--', x: 50, y: 80 },
  { id: 'VS-006', name: 'Hillcrest Center', location: 'University Campus', status: 'active', voters: 2103, capacity: 3000, latency: '15ms', x: 70, y: 25 },
]

interface VotingMapProps {
  onProceed: () => void
  onBack: () => void
}

export default function VotingMap({ onProceed, onBack }: VotingMapProps) {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [hoveredStation, setHoveredStation] = useState<string | null>(null)

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981'
      case 'syncing': return '#f59e0b'
      case 'maintenance': return '#ef4444'
      default: return '#64748b'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      <div className="glass rounded-xl border border-cyan-glow/10 overflow-hidden">
        {/* Map Header */}
        <div className="flex items-center justify-between p-5 border-b border-cyan-glow/10">
          <div>
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Navigation className="w-5 h-5 text-cyan-glow" />
              Voting Station Network
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Select your nearest polling enclave to proceed with biometric verification.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[0.6rem] text-slate-400 uppercase tracking-wider">Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[0.6rem] text-slate-400 uppercase tracking-wider">Syncing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-[0.6rem] text-slate-400 uppercase tracking-wider">Offline</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3">
          {/* Map Canvas */}
          <div className="lg:col-span-2 relative bg-nexus-900 p-4 min-h-[400px]">
            {/* Grid background */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,212,255,0.06)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#mapGrid)" />
            </svg>

            {/* Radar sweep */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 rounded-full border border-cyan-glow/5 animate-ping" style={{ animationDuration: '4s' }} />
            </div>

            {/* Station markers */}
            <div className="relative w-full h-full min-h-[360px]">
              {stations.map((station) => {
                const isHovered = hoveredStation === station.id
                const isSelected = selectedStation?.id === station.id
                return (
                  <button
                    key={station.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `${station.x}%`, top: `${station.y}%` }}
                    onMouseEnter={() => setHoveredStation(station.id)}
                    onMouseLeave={() => setHoveredStation(null)}
                    onClick={() => setSelectedStation(station)}
                  >
                    {/* Pulse ring */}
                    {(isHovered || isSelected) && station.status === 'active' && (
                      <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400/20" style={{ animationDuration: '2s' }} />
                    )}
                    {/* Marker */}
                    <div
                      className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        isSelected
                          ? 'scale-125 border-cyan-glow bg-cyan-glow/20 shadow-[0_0_15px_rgba(0,212,255,0.4)]'
                          : 'border-nexus-600 bg-nexus-800 group-hover:border-cyan-glow/50 group-hover:bg-cyan-glow/10'
                      }`}
                    >
                      <MapPin className="w-4 h-4" style={{ color: statusColor(station.status) }} />
                    </div>
                    {/* Label */}
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-[0.6rem] font-bold tracking-wider uppercase transition-opacity ${
                      isHovered || isSelected ? 'opacity-100 text-cyan-glow' : 'opacity-60 text-slate-400'
                    }`}>
                      {station.id}
                    </div>
                  </button>
                )
              })}

              {/* Connection lines between active stations */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {stations
                  .filter((s) => s.status === 'active')
                  .map((s, i, arr) => {
                    const next = arr[(i + 1) % arr.length]
                    return (
                      <line
                        key={`${s.id}-${next.id}`}
                        x1={`${s.x}%`}
                        y1={`${s.y}%`}
                        x2={`${next.x}%`}
                        y2={`${next.y}%`}
                        stroke="rgba(0,212,255,0.08)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                    )
                  })}
              </svg>
            </div>
          </div>

          {/* Station Detail Panel */}
          <div className="border-l border-cyan-glow/10 bg-nexus-950/50 p-5">
            <AnimatePresence mode="wait">
              {selectedStation ? (
                <motion.div
                  key={selectedStation.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[0.6rem] text-slate-500 font-mono uppercase tracking-wider">
                      {selectedStation.id}
                    </span>
                    <button
                      onClick={() => setSelectedStation(null)}
                      className="p-1 rounded hover:bg-nexus-800 text-slate-500 hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-white font-bold mb-1">{selectedStation.name}</h4>
                  <p className="text-slate-400 text-xs mb-4">{selectedStation.location}</p>

                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[0.6rem] font-bold uppercase tracking-wider mb-4 ${
                    selectedStation.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : selectedStation.status === 'syncing'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      selectedStation.status === 'active' ? 'bg-emerald-400 animate-pulse' :
                      selectedStation.status === 'syncing' ? 'bg-amber-400' : 'bg-red-400'
                    }`} />
                    {selectedStation.status}
                  </div>

                  <div className="space-y-3">
                    <div className="glass rounded-lg p-3">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                        <Users className="w-3 h-3" /> Voters
                      </div>
                      <div className="text-white font-bold text-sm">
                        {selectedStation.voters.toLocaleString()}
                        <span className="text-slate-600 text-xs font-normal"> / {selectedStation.capacity.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-1 bg-nexus-700 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-cyan-glow rounded-full"
                          style={{ width: `${(selectedStation.voters / selectedStation.capacity) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="glass rounded-lg p-3">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                        <Wifi className="w-3 h-3" /> Latency
                      </div>
                      <div className="text-white font-mono text-sm">{selectedStation.latency}</div>
                    </div>
                  </div>

                  {selectedStation.status === 'active' && (
                    <button
                      onClick={onProceed}
                      className="w-full mt-5 py-2.5 bg-cyan-glow text-nexus-950 font-bold text-xs rounded hover:bg-cyan-300 transition-all flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Proceed to Biometric Auth
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center py-10"
                >
                  <MapPin className="w-8 h-8 text-slate-700 mb-3" />
                  <p className="text-slate-500 text-sm">Select a station on the map</p>
                  <p className="text-slate-600 text-xs mt-1">to view details and proceed</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-cyan-glow/10">
          <button
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-cyan-glow transition-colors flex items-center gap-1"
          >
            <Navigation className="w-3 h-3 rotate-180" /> Back to Login
          </button>
          <div className="text-[0.6rem] text-slate-600 uppercase tracking-wider">
            {stations.filter((s) => s.status === 'active').length} of {stations.length} stations operational
          </div>
        </div>
      </div>
    </motion.div>
  )
}
