/**
 * PKE Context - Manages PKE invocation state
 */

import { createContext, useContext, useState, useCallback } from 'react'
import pkeService from '../services/pkeService'

const PKEContext = createContext(null)

const INVOCATION_NAMES = {
  1: 'Validate Objectives',
  2: 'Generate Structure',
  3: 'Enabling Objectives',
  4: 'Assessment Items',
  5: 'Content Generation'
}

const INITIAL_INVOCATION_STATE = {
  1: { status: 'pending', result: null, error: null },
  2: { status: 'pending', result: null, error: null },
  3: { status: 'pending', result: null, error: null },
  4: { status: 'pending', result: null, error: null },
  5: { status: 'pending', result: null, error: null }
}

export function PKEProvider({ children }) {
  const [isActive, setIsActive] = useState(false)
  const [currentInvocation, setCurrentInvocation] = useState(null)
  const [invocationStates, setInvocationStates] = useState({ ...INITIAL_INVOCATION_STATE })
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')

  // Open PKE interface
  const openPKE = useCallback((invocation = null) => {
    setIsActive(true)
    if (invocation) {
      setCurrentInvocation(invocation)
    }
  }, [])

  // Close PKE interface
  const closePKE = useCallback(() => {
    setIsActive(false)
    setCurrentInvocation(null)
  }, [])

  // Set message with type
  const showMessage = useCallback((msg, type = 'info') => {
    setMessage(msg)
    setMessageType(type)
    if (type !== 'error') {
      setTimeout(() => setMessage(''), 5000)
    }
  }, [])

  // Clear message
  const clearMessage = useCallback(() => {
    setMessage('')
    setMessageType('info')
  }, [])

  // Execute invocation
  const executeInvocation = useCallback(async (invocationNumber, data) => {
    setIsProcessing(true)
    setCurrentInvocation(invocationNumber)
    showMessage(`Executing ${INVOCATION_NAMES[invocationNumber]}...`, 'info')

    setInvocationStates(prev => ({
      ...prev,
      [invocationNumber]: { status: 'processing', result: null, error: null }
    }))

    try {
      let result
      switch (invocationNumber) {
        case 1:
          result = await pkeService.validateObjectives(data)
          break
        case 2:
          result = await pkeService.generateStructure(data)
          break
        case 3:
          result = await pkeService.generateEnablingObjectives(data)
          break
        case 4:
          result = await pkeService.generateAssessment(data)
          break
        case 5:
          result = await pkeService.generateContent(data)
          break
        default:
          throw new Error(`Unknown invocation: ${invocationNumber}`)
      }

      setInvocationStates(prev => ({
        ...prev,
        [invocationNumber]: { status: 'complete', result, error: null }
      }))

      showMessage(`${INVOCATION_NAMES[invocationNumber]} complete!`, 'success')
      return result

    } catch (err) {
      console.error(`Invocation ${invocationNumber} failed:`, err)
      setInvocationStates(prev => ({
        ...prev,
        [invocationNumber]: { status: 'error', result: null, error: err.message }
      }))
      showMessage(`Error: ${err.message}`, 'error')
      throw err
    } finally {
      setIsProcessing(false)
    }
  }, [showMessage])

  // Accept invocation result
  const acceptResult = useCallback(async (invocationNumber) => {
    const state = invocationStates[invocationNumber]
    if (!state?.result) {
      showMessage('No result to accept', 'error')
      return null
    }

    try {
      let accepted
      switch (invocationNumber) {
        case 1:
          accepted = await pkeService.acceptValidation(state.result.id)
          break
        case 2:
          accepted = await pkeService.acceptStructure(state.result.id)
          break
        case 3:
          accepted = await pkeService.acceptEnablingObjectives(state.result.id)
          break
        case 4:
          accepted = await pkeService.acceptAssessment(state.result.id)
          break
        case 5:
          accepted = await pkeService.acceptContent(state.result.id)
          break
        default:
          throw new Error(`Unknown invocation: ${invocationNumber}`)
      }

      setInvocationStates(prev => ({
        ...prev,
        [invocationNumber]: { ...prev[invocationNumber], status: 'accepted' }
      }))

      showMessage(`${INVOCATION_NAMES[invocationNumber]} accepted!`, 'success')
      return accepted

    } catch (err) {
      showMessage(`Accept failed: ${err.message}`, 'error')
      throw err
    }
  }, [invocationStates, showMessage])

  // Revise invocation result
  const reviseResult = useCallback(async (invocationNumber, feedback) => {
    const state = invocationStates[invocationNumber]
    if (!state?.result) {
      showMessage('No result to revise', 'error')
      return null
    }

    setIsProcessing(true)
    showMessage(`Revising ${INVOCATION_NAMES[invocationNumber]}...`, 'info')

    try {
      let revised
      switch (invocationNumber) {
        case 1:
          revised = await pkeService.reviseValidation(state.result.id, feedback)
          break
        case 2:
          revised = await pkeService.reviseStructure(state.result.id, feedback)
          break
        case 3:
          revised = await pkeService.reviseEnablingObjectives(state.result.id, feedback)
          break
        case 4:
          revised = await pkeService.reviseAssessment(state.result.id, feedback)
          break
        case 5:
          revised = await pkeService.reviseContent(state.result.id, feedback)
          break
        default:
          throw new Error(`Unknown invocation: ${invocationNumber}`)
      }

      setInvocationStates(prev => ({
        ...prev,
        [invocationNumber]: { status: 'complete', result: revised, error: null }
      }))

      showMessage(`${INVOCATION_NAMES[invocationNumber]} revised!`, 'success')
      return revised

    } catch (err) {
      showMessage(`Revision failed: ${err.message}`, 'error')
      throw err
    } finally {
      setIsProcessing(false)
    }
  }, [invocationStates, showMessage])

  // Get invocation state
  const getInvocationState = useCallback((invocationNumber) => {
    return invocationStates[invocationNumber] || { status: 'pending', result: null, error: null }
  }, [invocationStates])

  // Reset all invocations
  const resetInvocations = useCallback(() => {
    setInvocationStates({ ...INITIAL_INVOCATION_STATE })
    setCurrentInvocation(null)
    clearMessage()
  }, [clearMessage])

  // Get overall progress percentage
  const getProgress = useCallback(() => {
    const states = Object.values(invocationStates)
    const completed = states.filter(s => s.status === 'complete' || s.status === 'accepted').length
    return Math.round((completed / states.length) * 100)
  }, [invocationStates])

  const value = {
    isActive,
    currentInvocation,
    invocationStates,
    isProcessing,
    message,
    messageType,
    openPKE,
    closePKE,
    executeInvocation,
    acceptResult,
    reviseResult,
    getInvocationState,
    resetInvocations,
    getProgress,
    showMessage,
    clearMessage,
    INVOCATION_NAMES
  }

  return (
    <PKEContext.Provider value={value}>
      {children}
    </PKEContext.Provider>
  )
}

export function usePKE() {
  const context = useContext(PKEContext)
  if (!context) {
    throw new Error('usePKE must be used within a PKEProvider')
  }
  return context
}

export default PKEContext
