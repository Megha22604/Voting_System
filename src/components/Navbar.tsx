import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Hexagon, Fingerprint } from 'lucide-react'
import { useRegisterModal } from '../lib/RegisterContext'

const navItems = [
  { label: 'NEXUS', path: '/' },
  { label: 'STATIONS', path: '/stations' },
  { label: 'KYC DATA', path: '/kyc' },
  { label: 'VOTE', path: '/vote' },
  { label: 'ANALYTICS', path: '/analytics' },
]

export default function Navbar() {
  const location = useLocation()
  const { open } = useRegisterModal()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-cyan-glow/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <Hexagon className="w-8 h-8 text-cyan-glow group-hover:drop-shadow-[0_0_8px_rgba(0,212,255,0.6)] transition-all" strokeWidth={1.5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-cyan-glow rounded-full" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-[0.2em] text-white leading-none">
              VOTERENA
            </span>
            <span className="text-[0.55rem] tracking-[0.25em] text-cyan-glow/70 font-medium">
              CRYPTOGRAPHIC PROTOCOL
            </span>
          </div>
        </Link>

        {/* Nav Tabs */}
        <div className="hidden md:flex items-center bg-nexus-800/60 rounded-full px-2 py-1 border border-cyan-glow/10">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative px-5 py-1.5 text-xs font-semibold tracking-wider transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-cyan-dark/60 rounded-full border border-cyan-glow/30"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${isActive ? 'text-cyan-glow' : 'text-slate-400 hover:text-slate-200'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Initialize Button */}
        <button
          onClick={open}
          className="flex items-center gap-2 px-5 py-2 border border-cyan-glow/30 rounded-sm text-xs font-bold tracking-wider text-cyan-glow hover:bg-cyan-glow/10 hover:border-cyan-glow/50 transition-all"
        >
          <Fingerprint className="w-4 h-4" />
          INITIALIZE
        </button>
      </div>
    </nav>
  )
}
