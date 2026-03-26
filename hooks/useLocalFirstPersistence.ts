import { useCallback } from 'react'

const STORAGE_KEY = 'xina-erd-diagram'
const STORAGE_VERSION = 1

interface StoredDiagram {
  version: number
  timestamp: number
  snapshot: any
}

export function useLocalFirstPersistence() {
  const saveSnapshot = useCallback((snapshot: any) => {
    try {
      const data: StoredDiagram = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        snapshot,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save snapshot:', error)
      // Fail silently for quota exceeded
    }
  }, [])

  const loadSnapshot = useCallback((): any => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null

      const data: StoredDiagram = JSON.parse(stored)
      
      // Validate version
      if (data.version !== STORAGE_VERSION) {
        console.warn('Diagram version mismatch')
        return null
      }

      return data.snapshot
    } catch (error) {
      console.error('Failed to load snapshot:', error)
      return null
    }
  }, [])

  const clearSnapshot = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear snapshot:', error)
    }
  }, [])

  const getLastModified = useCallback((): Date | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null

      const data: StoredDiagram = JSON.parse(stored)
      return new Date(data.timestamp)
    } catch (error) {
      return null
    }
  }, [])

  return {
    saveSnapshot,
    loadSnapshot,
    clearSnapshot,
    getLastModified,
  }
}
