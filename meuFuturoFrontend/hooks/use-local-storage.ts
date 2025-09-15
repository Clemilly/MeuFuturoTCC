"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook for safely accessing localStorage
 * Handles SSR and client-side rendering differences
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isClient, setIsClient] = useState(false)
  const isMounted = useRef(true)

  // Initialize client-side flag
  useEffect(() => {
    setIsClient(true)
    return () => {
      isMounted.current = false
    }
  }, [])

  // Get from local storage then parse stored json or return initialValue
  const getValue = useCallback((): T => {
    if (!isClient || !isMounted.current) return initialValue
    
    try {
      const item = window.localStorage.getItem(key)
      if (item === null || item === 'undefined' || item === 'null') {
        return initialValue
      }
      return JSON.parse(item)
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }, [isClient, key, initialValue])

  // Set value in state and local storage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    if (!isMounted.current) return
    
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Save state only if component is mounted
      if (isMounted.current) {
        setStoredValue(valueToStore)
      }
      
      // Save to local storage only on client side
      if (isClient && isMounted.current) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [isClient, key, storedValue])

  // Remove value from local storage
  const removeValue = useCallback(() => {
    if (!isMounted.current) return
    
    try {
      if (isMounted.current) {
        setStoredValue(initialValue)
      }
      if (isClient && isMounted.current) {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [isClient, key, initialValue])

  // Initialize stored value on client side
  useEffect(() => {
    if (isClient && isMounted.current) {
      const value = getValue()
      if (isMounted.current) {
        setStoredValue(value)
      }
    }
  }, [isClient, getValue])

  return [storedValue, setValue, removeValue] as const
}
