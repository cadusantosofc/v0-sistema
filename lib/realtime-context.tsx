"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface RealtimeContextType {
  isConnected: boolean
  lastUpdate: string
  forceUpdate: () => void
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString())

  const forceUpdate = () => {
    setLastUpdate(new Date().toISOString())
    // Trigger re-render of all components that depend on real-time data
    window.dispatchEvent(new CustomEvent("realtimeUpdate"))
  }

  useEffect(() => {
    // Simulate real-time connection
    const interval = setInterval(() => {
      setLastUpdate(new Date().toISOString())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <RealtimeContext.Provider value={{ isConnected, lastUpdate, forceUpdate }}>{children}</RealtimeContext.Provider>
  )
}

export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (context === undefined) {
    throw new Error("useRealtime must be used within a RealtimeProvider")
  }
  return context
}
