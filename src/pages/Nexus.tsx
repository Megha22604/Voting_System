import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Fingerprint, Settings, Shield, Radio } from 'lucide-react'
import { useRegisterModal } from '../lib/RegisterContext'
import ServiceCards from '../components/ServiceCards'

export default function Nexus() {
  const { open } = useRegisterModal()

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 relative">
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
          <span className="text-[0.65rem] font-bold tracking-[0.2em] text-cyan-glow/80 uppercase">
            Network Secured
          </span>
          <span className="text-cyan-glow/40">•</span>
          <span className="text-[0.65rem] font-bold tracking-[0.2em] text-cyan-glow/80 uppercase">
            VVPAT Active
          </span>
        </div>
      </motion.div>

      {/* Hero Title */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-5xl md:text-7xl lg:text-8xl font-black text-center tracking-tight mb-8"
      >
        <span className="text-white">THE </span>
        <span className="text-cyan-glow text-glow">NEXUS</span>
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
        Welcome to the decentralized biometric voting protocol. Ensuring absolute transparency,
        immutable records, and cryptographic security for every citizen.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        <Link
          to="/vote"
          className="group flex items-center gap-3 px-8 py-4 bg-cyan-glow text-nexus-950 font-black text-sm tracking-[0.15em] uppercase hover:bg-cyan-300 transition-all hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]"
        >
          <Fingerprint className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Enter Voting Enclave
        </Link>
        <button
          onClick={open}
          className="group flex items-center gap-3 px-8 py-4 bg-nexus-800/80 border border-cyan-glow/20 text-cyan-glow font-black text-sm tracking-[0.15em] uppercase hover:border-cyan-glow/40 hover:bg-nexus-700/80 transition-all"
        >
          <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
          Initialize Identity
        </button>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16"
      >
        {[
          { icon: Shield, label: 'Encryption', value: 'AES-256' },
          { icon: Radio, label: 'Live Nodes', value: '12,847' },
          { icon: Fingerprint, label: 'Biometric IDs', value: '4.2M+' },
          { icon: Shield, label: 'Uptime', value: '99.99%' },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <stat.icon className="w-5 h-5 text-cyan-glow/50" />
            <span className="text-2xl font-black text-white">{stat.value}</span>
            <span className="text-[0.6rem] tracking-[0.2em] text-slate-500 uppercase">{stat.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Service Cards */}
      <ServiceCards />
    </div>
  )
}
