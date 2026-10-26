import { Hexagon, Shield, Github, Twitter, Mail, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-cyan-glow/10 bg-nexus-950/80 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <Hexagon className="w-7 h-7 text-cyan-glow" strokeWidth={1.5} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-cyan-glow rounded-full" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-[0.2em] text-white leading-none">VOTERENA</span>
                <span className="text-[0.5rem] tracking-[0.25em] text-cyan-glow/70 font-medium">CRYPTOGRAPHIC PROTOCOL</span>
              </div>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Decentralized biometric voting protocol ensuring absolute transparency, immutable records, and cryptographic security for every citizen.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Navigation</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Nexus', path: '/' },
                { label: 'Stations', path: '/stations' },
                { label: 'KYC Data', path: '/kyc' },
                { label: 'Vote', path: '/vote' },
                { label: 'Analytics', path: '/analytics' },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-slate-500 text-xs hover:text-cyan-glow transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Citizen Services</h4>
            <ul className="space-y-2.5">
              {[
                'New Registration',
                'Edit Registration',
                'Delete Registration',
                'NRI Registration',
                'Voter ID Lookup',
              ].map((service) => (
                <li key={service}>
                  <span className="text-slate-500 text-xs hover:text-cyan-glow transition-colors cursor-pointer">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Security */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Security & Contact</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-slate-500 text-xs">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>AES-256 Encrypted</span>
              </li>
              <li className="flex items-center gap-2 text-slate-500 text-xs">
                <Globe className="w-3 h-3 text-cyan-glow" />
                <span>Blockchain Verified</span>
              </li>
              <li className="flex items-center gap-2 text-slate-500 text-xs">
                <Mail className="w-3 h-3 text-cyan-glow" />
                <span>support@voterena.gov</span>
              </li>
            </ul>
            <div className="flex items-center gap-3 mt-4">
              <button className="p-2 rounded-lg bg-nexus-800 border border-nexus-700 text-slate-400 hover:text-cyan-glow hover:border-cyan-glow/30 transition-all">
                <Github className="w-3.5 h-3.5" />
              </button>
              <button className="p-2 rounded-lg bg-nexus-800 border border-nexus-700 text-slate-400 hover:text-cyan-glow hover:border-cyan-glow/30 transition-all">
                <Twitter className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-nexus-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-[0.65rem] tracking-wider">
            © 2025 VOTERENA ELECTORAL COMMISSION. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-slate-600 text-[0.65rem] tracking-wider hover:text-slate-400 cursor-pointer transition-colors">PRIVACY POLICY</span>
            <span className="text-slate-600 text-[0.65rem] tracking-wider hover:text-slate-400 cursor-pointer transition-colors">TERMS OF SERVICE</span>
            <span className="text-slate-600 text-[0.65rem] tracking-wider hover:text-slate-400 cursor-pointer transition-colors">SECURITY AUDIT</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
