import { createContext, useContext, useState, type ReactNode } from 'react'

interface RegisterContextType {
  isOpen: boolean
  open: () => void
  close: () => void
}

const RegisterContext = createContext<RegisterContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
})

export function RegisterProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <RegisterContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </RegisterContext.Provider>
  )
}

export function useRegisterModal() {
  return useContext(RegisterContext)
}
