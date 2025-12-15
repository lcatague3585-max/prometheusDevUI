/**
 * PKE Service - Prometheus Knowledge Engine
 * 
 * Handles all PKE invocation API calls:
 * - Invocation 1: Validate Objectives
 * - Invocation 2: Generate Structure
 * - Invocation 3: Generate Enabling Objectives
 * - Invocation 4: Generate Assessment
 * - Invocation 5: Generate Content
 */

import api from './api'

const pkeService = {
  // ==========================================
  // Invocation 1: Validate Objectives
  // ==========================================
  
  /**
   * Validate learning objectives
   * @param {string} courseId
   * @param {Object} data - { objectives, context }
   * @returns {Promise<Object>}
   */
  validateObjectives: async (courseId, data) => {
    const response = await api.post(`/pke/${courseId}/invoke/1`, data)
    return response
  },
  
  /**
   * Accept validated objectives
   * @param {string} courseId
   * @param {Object} data - Accepted objectives
   * @returns {Promise<Object>}
   */
  acceptObjectives: async (courseId, data) => {
    const response = await api.post(`/pke/${courseId}/accept/1`, data)
    return response
  },
  
  /**
   * Revise objectives with feedback
   * @param {string} courseId
   * @param {Object} data - { feedback, objectives }
   * @returns {Promise<Object>}
   */
  reviseObjectives: async (courseId, data) => {
    const response = await api.post(`/pke/${courseId}/revise/1`, data)
    return response
  },
  
  // ==========================================
  // Invocation 2: Generate Structure
  // ==========================================
  
  /**
   * Generate course structure (modules/lessons)
   * @param {string} courseId
   * @param {Object} data - { objectives, preferences }
   * @returns {Promise<Object>}
   */
  generateStructure: async (courseId, data) => {
    const response = await api.post(`/pke/${courseId}/invoke/2`, data)
    return response
  },
  
  /**
   * Accept generated structure
   * @param {string} courseId
   * @param {Object} data - Accepted structure
   * @returns {Promise<Object>}
   */
  acceptStructure: async (courseId, data) => {
    const response = await api.post(`/pke/${courseId}/accept/2`, data)
    return response
  },
  
  /**
   * Revise structure with feedback
   * @param {string} courseId
   * @param {Object} data - { feedback, structure }
   * @returns {Promise<Object>}
   */
  reviseStructure: async (courseId, data) => {
    const response = await api.post(`/pke/${courseId}/revise/2`, data)
    return response
  },
  
  // ==========================================
  // Invocation 3: Generate Enabling Objectives
  // ==========================================
  
  /**
   * Generate enabling objectives
   * @param {string} courseId
   * @param {Object} data - { terminalObjectives, structure }
   * @returns {Promise<Object>}
   */
  generateEnablingObjectives: async (courseId, data) => {
    const response = await api.post(`/pke/${courseId}/invoke/3`, data)
    return response
  },
  
  /**
   * Accept enabling objectives
   * @param {string} courseId
   * @param {Object} data - Accepted enabling objectives
   * @returns {Promise<Object>}
   */
  acceptEnablingObjectives: async (courseId, data) => {
    const response = await api.post(`/pke/${courseId}/accept/3`, data)
    return response
  },
  
  /**
   * Revise enabling objectives
   * @param {string} courseId
   * @param {Object} data - { feedback, enablingObjectives }
   * @returns {Promise<Object>}
   */
  reviseEnablingObjectives: async (courseId, data) => {
    const response = await api.post(`/pke/${courseId}/revise/3`, data)
    return response
  },
  
  // ==========================================
  // Invocation 4: Generate Assessment
  // ==========================================
  
  /**
   * Generate assessment items
   * @param {string} courseId
   * @param {Object} data - { objectives, assessmentType }
   * @returns {Promise<Object>}
   */
  generateAssessment: async (courseId, data) => {
    const response = await api.post(`/pke/${courseId}/invoke/4`, data)
    return response
  },
  
  /**
   * Accept assessment
   * @param {string} courseId
   * @param {Object} data - Accepted assessment
   * @returns {Promise<Object>}
   */
  acceptAssessment: async (courseId, data) => {
    const response = await api.post(`/pke/${courseId}/accept/4`, data)
    return response
  },
  
  /**
   * Revise assessment
   * @param {string} courseId
   * @param {Object} data - { feedback, assessment }
   * @returns {Promise<Object>}
   */
  reviseAssessment: async (courseId, data) => {
    const response = await api.post(`/pke/${courseId}/revise/4`, data)
    return response
  },
  
  // ==========================================
  // Invocation 5: Generate Content
  // ==========================================
  
  /**
   * Generate course content
   * @param {string} courseId
   * @param {Object} data - { structure, contentType, options }
   * @returns {Promise<Object>}
   */
  generateContent: async (courseId, data) => {
    const response = await api.post(`/pke/${courseId}/invoke/5`, data)
    return response
  },
  
  /**
   * Accept generated content
   * @param {string} courseId
   * @param {Object} data - Accepted content
   * @returns {Promise<Object>}
   */
  acceptContent: async (courseId, data) => {
    const response = await api.post(`/pke/${courseId}/accept/5`, data)
    return response
  },
  
  /**
   * Revise content
   * @param {string} courseId
   * @param {Object} data - { feedback, content }
   * @returns {Promise<Object>}
   */
  reviseContent: async (courseId, data) => {
    const response = await api.post(`/pke/${courseId}/revise/5`, data)
    return response
  },
  
  // ==========================================
  // Generic/Utility Methods
  // ==========================================
  
  /**
   * Generic invoke method
   * @param {string} courseId
   * @param {number} invocationNumber - 1-5
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  invoke: async (courseId, invocationNumber, data) => {
    const response = await api.post(`/pke/${courseId}/invoke/${invocationNumber}`, data)
    return response
  },
  
  /**
   * Generic accept method
   * @param {string} courseId
   * @param {number} invocationNumber - 1-5
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  accept: async (courseId, invocationNumber, data) => {
    const response = await api.post(`/pke/${courseId}/accept/${invocationNumber}`, data)
    return response
  },
  
  /**
   * Generic revise method
   * @param {string} courseId
   * @param {number} invocationNumber - 1-5
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  revise: async (courseId, invocationNumber, data) => {
    const response = await api.post(`/pke/${courseId}/revise/${invocationNumber}`, data)
    return response
  },
  
  /**
   * Get PKE status for course
   * @param {string} courseId
   * @returns {Promise<Object>}
   */
  getStatus: async (courseId) => {
    const response = await api.get(`/pke/${courseId}/status`)
    return response
  },
  
  /**
   * Get invocation history
   * @param {string} courseId
   * @param {number} invocationNumber
   * @returns {Promise<Array>}
   */
  getHistory: async (courseId, invocationNumber) => {
    const response = await api.get(`/pke/${courseId}/history/${invocationNumber}`)
    return response.history || response
  },
  
  /**
   * Reset invocation to re-run
   * @param {string} courseId
   * @param {number} invocationNumber
   * @returns {Promise<Object>}
   */
  resetInvocation: async (courseId, invocationNumber) => {
    const response = await api.post(`/pke/${courseId}/reset/${invocationNumber}`, {})
    return response
  }
}

export default pkeService
