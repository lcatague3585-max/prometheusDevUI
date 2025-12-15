/**
 * Course Context - Course State Management
 * 
 * Provides:
 * - Current course data
 * - Course CRUD operations
 * - Learning objectives management
 * - Dirty state tracking
 */

import { createContext, useContext, useState, useCallback } from 'react'
import courseService from '../services/courseService'

const CourseContext = createContext(null)

// Empty course template
export const EMPTY_COURSE = {
  id: null,
  title: '',
  description: '',
  duration: '',
  durationUnit: 'days',
  level: '',
  thematic: '',
  targetAudience: '',
  prerequisites: '',
  learningObjectives: [],
  modules: [],
  stage: 'define',
  createdAt: null,
  updatedAt: null
}

export function CourseProvider({ children }) {
  const [currentCourse, setCurrentCourse] = useState({ ...EMPTY_COURSE })
  const [courseLoaded, setCourseLoaded] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [courses, setCourses] = useState([])
  const [courseState, setCourseState] = useState({
    startDate: null,
    saveCount: 0
  })

  // ==========================================
  // Course Operations
  // ==========================================

  /**
   * Load all courses for user
   */
  const loadCourses = useCallback(async () => {
    try {
      const data = await courseService.getCourses()
      setCourses(data)
      return data
    } catch (err) {
      console.error('Failed to load courses:', err)
      throw err
    }
  }, [])

  /**
   * Load single course by ID
   */
  const loadCourse = useCallback(async (courseId) => {
    try {
      const data = await courseService.getCourse(courseId)
      setCurrentCourse(data)
      setCourseLoaded(true)
      setIsDirty(false)
      setCourseState(prev => ({
        ...prev,
        startDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : null
      }))
      return data
    } catch (err) {
      console.error('Failed to load course:', err)
      throw err
    }
  }, [])

  /**
   * Create new course
   */
  const createCourse = useCallback(async (courseData) => {
    try {
      const data = await courseService.createCourse(courseData)
      setCurrentCourse(data)
      setCourseLoaded(true)
      setIsDirty(false)
      setCourseState(prev => ({
        ...prev,
        startDate: new Date().toLocaleDateString(),
        saveCount: prev.saveCount + 1
      }))
      return data
    } catch (err) {
      console.error('Failed to create course:', err)
      throw err
    }
  }, [])

  /**
   * Update current course
   */
  const updateCourse = useCallback(async (courseData) => {
    if (!currentCourse.id) {
      return createCourse(courseData)
    }
    
    try {
      const data = await courseService.updateCourse(currentCourse.id, courseData)
      setCurrentCourse(data)
      setIsDirty(false)
      setCourseState(prev => ({
        ...prev,
        saveCount: prev.saveCount + 1
      }))
      return data
    } catch (err) {
      console.error('Failed to update course:', err)
      throw err
    }
  }, [currentCourse.id, createCourse])

  /**
   * Update single field (local only, marks dirty)
   */
  const updateField = useCallback((field, value) => {
    setCurrentCourse(prev => ({
      ...prev,
      [field]: value
    }))
    setIsDirty(true)
  }, [])

  /**
   * Save current course to server
   */
  const saveCourse = useCallback(async () => {
    try {
      const data = await courseService.saveCourse(currentCourse)
      setCurrentCourse(data)
      setIsDirty(false)
      setCourseLoaded(true)
      setCourseState(prev => ({
        ...prev,
        startDate: prev.startDate || new Date().toLocaleDateString(),
        saveCount: prev.saveCount + 1
      }))
      return data
    } catch (err) {
      console.error('Failed to save course:', err)
      throw err
    }
  }, [currentCourse])

  /**
   * Delete current course
   */
  const deleteCourse = useCallback(async () => {
    if (!currentCourse.id) {
      clearCourse()
      return
    }
    
    try {
      await courseService.deleteCourse(currentCourse.id)
      clearCourse()
    } catch (err) {
      console.error('Failed to delete course:', err)
      throw err
    }
  }, [currentCourse.id])

  /**
   * Clear current course (reset to empty)
   */
  const clearCourse = useCallback(() => {
    setCurrentCourse({ ...EMPTY_COURSE })
    setCourseLoaded(false)
    setIsDirty(false)
    setCourseState({
      startDate: null,
      saveCount: 0
    })
  }, [])

  /**
   * Update course stage
   */
  const updateStage = useCallback(async (stage) => {
    if (!currentCourse.id) {
      setCurrentCourse(prev => ({ ...prev, stage }))
      setIsDirty(true)
      return
    }
    
    try {
      const data = await courseService.updateStage(currentCourse.id, stage)
      setCurrentCourse(data)
    } catch (err) {
      console.error('Failed to update stage:', err)
      throw err
    }
  }, [currentCourse.id])

  // ==========================================
  // Learning Objectives
  // ==========================================

  /**
   * Update learning objective
   */
  const updateLearningObjective = useCallback((index, objective) => {
    setCurrentCourse(prev => {
      const objectives = [...(prev.learningObjectives || [])]
      objectives[index] = objective
      return { ...prev, learningObjectives: objectives }
    })
    setIsDirty(true)
  }, [])

  /**
   * Add learning objective
   */
  const addLearningObjective = useCallback((objective) => {
    setCurrentCourse(prev => ({
      ...prev,
      learningObjectives: [...(prev.learningObjectives || []), objective]
    }))
    setIsDirty(true)
  }, [])

  /**
   * Remove learning objective
   */
  const removeLearningObjective = useCallback((index) => {
    setCurrentCourse(prev => {
      const objectives = [...(prev.learningObjectives || [])]
      objectives.splice(index, 1)
      return { ...prev, learningObjectives: objectives }
    })
    setIsDirty(true)
  }, [])

  const value = {
    // State
    currentCourse,
    courseLoaded,
    isDirty,
    courses,
    courseState,
    
    // Course operations
    loadCourses,
    loadCourse,
    createCourse,
    updateCourse,
    updateField,
    saveCourse,
    deleteCourse,
    clearCourse,
    updateStage,
    
    // Learning objectives
    updateLearningObjective,
    addLearningObjective,
    removeLearningObjective
  }

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  )
}

export function useCourse() {
  const context = useContext(CourseContext)
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider')
  }
  return context
}

export default CourseContext
