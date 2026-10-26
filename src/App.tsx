import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import RegisterModal from './components/RegisterModal'
import Nexus from './pages/Nexus'
import Stations from './pages/Stations'
import KycData from './pages/KycData'
import Vote from './pages/Vote'
import Analytics from './pages/Analytics'
import { RegisterProvider, useRegisterModal } from './lib/RegisterContext'

function AppContent() {
  const { isOpen, close } = useRegisterModal()

  return (
    <div className="min-h-screen bg-nexus-950 grid-bg relative flex flex-col">
      {/* Ambient glow orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-glow/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-glow/5 rounded-full blur-[120px] pointer-events-none" />

      <Navbar />
      <main className="pt-20 flex-1">
        <Routes>
          <Route path="/" element={<Nexus />} />
          <Route path="/stations" element={<Stations />} />
          <Route path="/kyc" element={<KycData />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </main>
      <Footer />
      <RegisterModal isOpen={isOpen} onClose={close} />
    </div>
  )
}

function App() {
  return (
    <RegisterProvider>
      <AppContent />
    </RegisterProvider>
  )
}

export default App
