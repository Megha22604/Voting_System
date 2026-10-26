import { useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Fingerprint,
  Hash,
  Calendar,
  User,
  MapPin,
  Vote,
  CheckCircle,
  Printer,
  Download,
  Hexagon,
} from 'lucide-react'

interface VvpatReceiptProps {
  voterName: string
  voterId: string
  age: number
  gender: string
  address: { country: string; state: string; city: string; taluka: string }
  candidateName: string
  candidateParty: string
  candidateSymbol: string
  txHash: string
  timestamp: string
  onClose: () => void
}

export default function VvpatReceipt({
  voterName,
  voterId,
  age,
  gender,
  address,
  candidateName,
  candidateParty,
  candidateSymbol,
  txHash,
  timestamp,
  onClose,
}: VvpatReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>VVPAT Receipt - ${voterId}</title>
          <style>
            @page { size: A4 portrait; margin: 20mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Segoe UI', system-ui, sans-serif;
              background: #fff;
              color: #000;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              font-size: 28px;
              font-weight: 900;
              letter-spacing: 4px;
              text-transform: uppercase;
            }
            .header h2 {
              font-size: 14px;
              font-weight: 600;
              letter-spacing: 2px;
              color: #333;
              margin-top: 6px;
            }
            .header .emblem {
              width: 60px; height: 60px;
              border: 3px solid #000;
              margin: 0 auto 15px;
              display: flex; align-items: center; justify-content: center;
              transform: rotate(45deg);
            }
            .header .emblem span {
              transform: rotate(-45deg);
              font-size: 24px;
              font-weight: 900;
            }
            .section {
              margin-bottom: 25px;
              padding: 20px;
              border: 2px solid #000;
            }
            .section-title {
              font-size: 12px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 3px;
              margin-bottom: 15px;
              padding-bottom: 8px;
              border-bottom: 1px solid #ccc;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              font-size: 13px;
            }
            .row .label {
              font-weight: 600;
              color: #333;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .row .value {
              font-weight: 700;
              color: #000;
              text-align: right;
            }
            .tx-hash {
              font-family: 'Courier New', monospace;
              font-size: 11px;
              background: #f0f0f0;
              padding: 12px;
              border: 1px dashed #999;
              word-break: break-all;
              margin-top: 10px;
            }
            .seal {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #000;
            }
            .seal-text {
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #000;
            }
            .footer-note {
              margin-top: 30px;
              font-size: 10px;
              color: #555;
              text-align: center;
              line-height: 1.6;
            }
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-30deg);
              font-size: 80px;
              font-weight: 900;
              color: rgba(0,0,0,0.04);
              text-transform: uppercase;
              letter-spacing: 10px;
              pointer-events: none;
              z-index: 0;
            }
            .candidate-box {
              background: #f8f8f8;
              border: 2px solid #000;
              padding: 20px;
              text-align: center;
              margin: 15px 0;
            }
            .candidate-box .symbol {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .candidate-box .name {
              font-size: 18px;
              font-weight: 800;
            }
            .candidate-box .party {
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="watermark">VOTERENA</div>
          <div class="header">
            <div class="emblem"><span>V</span></div>
            <h1>Voterena Electoral Commission</h1>
            <h2>Voter Verifiable Paper Audit Trail (VVPAT)</h2>
          </div>

          <div class="section">
            <div class="section-title">Voter Information</div>
            <div class="row"><span class="label">Voter Name</span><span class="value">${voterName}</span></div>
            <div class="row"><span class="label">Voter ID</span><span class="value">${voterId}</span></div>
            <div class="row"><span class="label">Age</span><span class="value">${age} years</span></div>
            <div class="row"><span class="label">Gender</span><span class="value">${gender}</span></div>
            <div class="row"><span class="label">Address</span><span class="value">${address.taluka}, ${address.city}, ${address.state}, ${address.country}</span></div>
          </div>

          <div class="section">
            <div class="section-title">Vote Cast</div>
            <div class="candidate-box">
              <div class="symbol">${candidateSymbol}</div>
              <div class="name">${candidateName}</div>
              <div class="party">${candidateParty}</div>
            </div>
            <div class="row"><span class="label">Date & Time</span><span class="value">${new Date(timestamp).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'long' })}</span></div>
          </div>

          <div class="section">
            <div class="section-title">Cryptographic Receipt</div>
            <div class="row"><span class="label">Transaction Hash</span></div>
            <div class="tx-hash">${txHash}</div>
            <div class="footer-note" style="margin-top:10px;">
              This hash is cryptographically signed and stored on the blockchain ledger. It serves as immutable proof of your vote.
            </div>
          </div>

          <div class="seal">
            <div class="seal-text">★ Official VVPAT Receipt ★</div>
            <div class="footer-note">
              This receipt is generated by the Voterena Cryptographic Protocol.<br>
              Preserve this document for audit and verification purposes.<br>
              For queries, contact: support@voterena.gov
            </div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(receiptHtml)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 300)
  }

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
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Receipt Card */}
        <div
          ref={receiptRef}
          className="bg-white text-nexus-950 rounded-none border-4 border-nexus-950 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center border-b-4 border-nexus-950 p-6">
            <div className="w-14 h-14 border-4 border-nexus-950 mx-auto mb-3 flex items-center justify-center rotate-45">
              <span className="text-2xl font-black -rotate-45">V</span>
            </div>
            <h1 className="text-xl font-black tracking-[0.2em] uppercase text-nexus-950">
              Voterena
            </h1>
            <p className="text-[0.6rem] font-bold tracking-[0.15em] uppercase text-nexus-800 mt-1">
              Electoral Commission
            </p>
            <p className="text-[0.55rem] font-bold tracking-[0.1em] uppercase text-nexus-600 mt-0.5">
              Voter Verifiable Paper Audit Trail (VVPAT)
            </p>
          </div>

          {/* Voter Info */}
          <div className="p-5 border-b-2 border-nexus-950">
            <h3 className="text-[0.6rem] font-black tracking-[0.2em] uppercase text-nexus-600 mb-3 pb-2 border-b border-gray-300">
              Voter Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-nexus-700">Voter Name</span>
                <span className="font-bold text-nexus-950">{voterName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-nexus-700">Voter ID</span>
                <span className="font-bold text-nexus-950 font-mono">{voterId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-nexus-700">Age</span>
                <span className="font-bold text-nexus-950">{age} years</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-nexus-700">Gender</span>
                <span className="font-bold text-nexus-950">{gender}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-nexus-700">Address</span>
                <span className="font-bold text-nexus-950 text-right max-w-[60%]">
                  {address.taluka}, {address.city}, {address.state}, {address.country}
                </span>
              </div>
            </div>
          </div>

          {/* Vote Cast */}
          <div className="p-5 border-b-2 border-nexus-950">
            <h3 className="text-[0.6rem] font-black tracking-[0.2em] uppercase text-nexus-600 mb-3 pb-2 border-b border-gray-300">
              Vote Cast
            </h3>
            <div className="bg-gray-100 border-2 border-nexus-950 p-5 text-center my-2">
              <div className="text-5xl mb-2">{candidateSymbol}</div>
              <div className="text-lg font-black text-nexus-950">{candidateName}</div>
              <div className="text-[0.6rem] font-bold tracking-[0.15em] uppercase text-nexus-700 mt-1">
                {candidateParty}
              </div>
            </div>
            <div className="flex justify-between text-xs mt-3">
              <span className="font-semibold uppercase tracking-wider text-nexus-700">Date & Time</span>
              <span className="font-bold text-nexus-950 text-right">
                {new Date(timestamp).toLocaleString('en-IN', {
                  dateStyle: 'full',
                  timeStyle: 'long',
                })}
              </span>
            </div>
          </div>

          {/* Transaction Hash */}
          <div className="p-5 border-b-2 border-nexus-950">
            <h3 className="text-[0.6rem] font-black tracking-[0.2em] uppercase text-nexus-600 mb-3 pb-2 border-b border-gray-300">
              Cryptographic Receipt
            </h3>
            <div className="flex justify-between text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-nexus-700">Transaction Hash</span>
            </div>
            <div className="bg-gray-100 border border-dashed border-gray-400 p-3 font-mono text-[0.65rem] break-all text-nexus-950">
              {txHash}
            </div>
            <p className="text-[0.55rem] text-gray-500 mt-2 text-center leading-relaxed">
              This hash is cryptographically signed and stored on the blockchain ledger.
              It serves as immutable proof of your vote.
            </p>
          </div>

          {/* Footer */}
          <div className="p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black tracking-[0.15em] uppercase text-nexus-950">
                Official VVPAT Receipt
              </span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-[0.55rem] text-gray-500 leading-relaxed">
              Generated by the Voterena Cryptographic Protocol.<br />
              Preserve this document for audit and verification purposes.<br />
              For queries, contact: support@voterena.gov
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-cyan-glow text-nexus-950 font-bold text-sm rounded hover:bg-cyan-300 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-nexus-800 border border-cyan-glow/20 text-cyan-glow font-bold text-sm rounded hover:bg-nexus-700 transition-all"
          >
            Close Receipt
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
