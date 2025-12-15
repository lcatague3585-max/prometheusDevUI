/**
 * Custom Hooks - Reusable hook functions
 */

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * useDebounce - Debounce a value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

/**
 * useLocalStorage - Persist state to localStorage
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error('useLocalStorage error:', error)
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error('useLocalStorage error:', error)
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}

/**
 * useAsync - Handle async operations with loading/error states
 */
export function useAsync(asyncFunction, immediate = false) {
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState(null)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...params) => {
    setLoading(true)
    setError(null)
    try {
      const result = await asyncFunction(...params)
      setValue(result)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [asyncFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate, execute])

  return { execute, loading, value, error }
}

/**
 * useKeyPress - Detect key press
 */
export function useKeyPress(targetKey, handler, options = {}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const { ctrl = false, shift = false, alt = false } = options
      
      if (event.key === targetKey &&
          event.ctrlKey === ctrl &&
          event.shiftKey === shift &&
          event.altKey === alt) {
        event.preventDefault()
        handler(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [targetKey, handler, options])
}

/**
 * useInterval - setInterval as a hook
 */
export function useInterval(callback, delay) {
  const savedCallback = useRef()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

/**
 * useClickOutside - Detect clicks outside element
 */
export function useClickOutside(handler) {
  const ref = useRef()

  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }
      handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [handler])

  return ref
}

/**
 * usePrevious - Get previous value
 */
export function usePrevious(value) {
  const ref = useRef()
  
  useEffect(() => {
    ref.current = value
  }, [value])
  
  return ref.current
}
