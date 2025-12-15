/**
 * Course Service
 * 
 * Handles all course-related API calls:
 * - Course CRUD operations
 * - Learning objectives
 * - Modules and lessons
 * - Scalar data
 */

import api from './api'

const courseService = {
  // ==========================================
  // Course CRUD
  // ==========================================
  
  /**
   * Get all courses for current user
   * @returns {Promise<Array>}
   */
  getCourses: async () => {
    const response = await api.get('/courses')
    return response.courses || response
  },
  
  /**
   * Get single course by ID
   * @param {string} courseId
   * @returns {Promise<Object>}
   */
  getCourse: async (courseId) => {
    const response = await api.get(`/courses/${courseId}`)
    return response.course || response
  },
  
  /**
   * Create new course
   * @param {Object} courseData
   * @returns {Promise<Object>}
   */
  createCourse: async (courseData) => {
    const response = await api.post('/courses', courseData)
    return response.course || response
  },
  
  /**
   * Update existing course
   * @param {string} courseId
   * @param {Object} courseData
   * @returns {Promise<Object>}
   */
  updateCourse: async (courseId, courseData) => {
    const response = await api.put(`/courses/${courseId}`, courseData)
    return response.course || response
  },
  
  /**
   * Delete course
   * @param {string} courseId
   * @returns {Promise<Object>}
   */
  deleteCourse: async (courseId) => {
    return api.delete(`/courses/${courseId}`)
  },
  
  /**
   * Save course (create or update)
   * @param {Object} courseData
   * @returns {Promise<Object>}
   */
  saveCourse: async (courseData) => {
    if (courseData.id) {
      return courseService.updateCourse(courseData.id, courseData)
    } else {
      return courseService.createCourse(courseData)
    }
  },
  
  /**
   * Update course stage/status
   * @param {string} courseId
   * @param {string} stage
   * @returns {Promise<Object>}
   */
  updateStage: async (courseId, stage) => {
    const response = await api.patch(`/courses/${courseId}/stage`, { stage })
    return response.course || response
  },
  
  // ==========================================
  // Learning Objectives
  // ==========================================
  
  /**
   * Get learning objectives for course
   * @param {string} courseId
   * @returns {Promise<Array>}
   */
  getLearningObjectives: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/objectives`)
    return response.objectives || response
  },
  
  /**
   * Add learning objective
   * @param {string} courseId
   * @param {Object} objective
   * @returns {Promise<Object>}
   */
  addLearningObjective: async (courseId, objective) => {
    const response = await api.post(`/courses/${courseId}/objectives`, objective)
    return response.objective || response
  },
  
  /**
   * Update learning objective
   * @param {string} courseId
   * @param {string} objectiveId
   * @param {Object} objective
   * @returns {Promise<Object>}
   */
  updateLearningObjective: async (courseId, objectiveId, objective) => {
    const response = await api.put(`/courses/${courseId}/objectives/${objectiveId}`, objective)
    return response.objective || response
  },
  
  /**
   * Delete learning objective
   * @param {string} courseId
   * @param {string} objectiveId
   * @returns {Promise<Object>}
   */
  deleteLearningObjective: async (courseId, objectiveId) => {
    return api.delete(`/courses/${courseId}/objectives/${objectiveId}`)
  },
  
  // ==========================================
  // Modules
  // ==========================================
  
  /**
   * Get modules for course
   * @param {string} courseId
   * @returns {Promise<Array>}
   */
  getModules: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/modules`)
    return response.modules || response
  },
  
  /**
   * Add module
   * @param {string} courseId
   * @param {Object} module
   * @returns {Promise<Object>}
   */
  addModule: async (courseId, module) => {
    const response = await api.post(`/courses/${courseId}/modules`, module)
    return response.module || response
  },
  
  /**
   * Update module
   * @param {string} courseId
   * @param {string} moduleId
   * @param {Object} module
   * @returns {Promise<Object>}
   */
  updateModule: async (courseId, moduleId, module) => {
    const response = await api.put(`/courses/${courseId}/modules/${moduleId}`, module)
    return response.module || response
  },
  
  /**
   * Delete module
   * @param {string} courseId
   * @param {string} moduleId
   * @returns {Promise<Object>}
   */
  deleteModule: async (courseId, moduleId) => {
    return api.delete(`/courses/${courseId}/modules/${moduleId}`)
  },
  
  // ==========================================
  // Lessons
  // ==========================================
  
  /**
   * Get lessons for module
   * @param {string} courseId
   * @param {string} moduleId
   * @returns {Promise<Array>}
   */
  getLessons: async (courseId, moduleId) => {
    const response = await api.get(`/courses/${courseId}/modules/${moduleId}/lessons`)
    return response.lessons || response
  },
  
  /**
   * Add lesson
   * @param {string} courseId
   * @param {string} moduleId
   * @param {Object} lesson
   * @returns {Promise<Object>}
   */
  addLesson: async (courseId, moduleId, lesson) => {
    const response = await api.post(`/courses/${courseId}/modules/${moduleId}/lessons`, lesson)
    return response.lesson || response
  },
  
  /**
   * Update lesson
   * @param {string} courseId
   * @param {string} moduleId
   * @param {string} lessonId
   * @param {Object} lesson
   * @returns {Promise<Object>}
   */
  updateLesson: async (courseId, moduleId, lessonId, lesson) => {
    const response = await api.put(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, lesson)
    return response.lesson || response
  },
  
  /**
   * Delete lesson
   * @param {string} courseId
   * @param {string} moduleId
   * @param {string} lessonId
   * @returns {Promise<Object>}
   */
  deleteLesson: async (courseId, moduleId, lessonId) => {
    return api.delete(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`)
  },
  
  // ==========================================
  // Scalar Data
  // ==========================================
  
  /**
   * Get scalar matrix data
   * @param {string} courseId
   * @returns {Promise<Object>}
   */
  getScalarData: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/scalar`)
    return response.scalar || response
  },
  
  /**
   * Update scalar data
   * @param {string} courseId
   * @param {Object} scalarData
   * @returns {Promise<Object>}
   */
  updateScalarData: async (courseId, scalarData) => {
    const response = await api.put(`/courses/${courseId}/scalar`, scalarData)
    return response.scalar || response
  },
  
  /**
   * Import scalar from file
   * @param {string} courseId
   * @param {FormData} formData
   * @returns {Promise<Object>}
   */
  importScalar: async (courseId, formData) => {
    return api.upload(`/courses/${courseId}/scalar/import`, formData)
  }
}

export default courseService
