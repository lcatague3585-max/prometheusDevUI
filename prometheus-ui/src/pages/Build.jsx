/**
 * Build Page - Enabling Objectives & Assessment
 * 
 * Features:
 * - Enabling Objectives (Invocation 3)
 * - Assessment Generation (Invocation 4)
 * - Two-tab interface
 */

import { useState, useCallback } from 'react'
import { THEME } from '../constants/theme'
import { useCourse } from '../context/CourseContext'
import { usePKE } from '../context/PKEContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import pkeButton from '../assets/PKE_Button.png'

// Bloom's taxonomy levels
const BLOOMS_LEVELS = [
  { value: 'remember', label: 'Remember', color: '#9C27B0' },
  { value: 'understand', label: 'Understand', color: '#3F51B5' },
  { value: 'apply', label: 'Apply', color: '#2196F3' },
  { value: 'analyze', label: 'Analyze', color: '#4CAF50' },
  { value: 'evaluate', label: 'Evaluate', color: '#FF9800' },
  { value: 'create', label: 'Create', color: '#F44336' }
]

// Assessment types
const ASSESSMENT_TYPES = [
  { value: 'quiz', label: 'Quiz / Multiple Choice' },
  { value: 'practical', label: 'Practical Exercise' },
  { value: 'written', label: 'Written Response' },
  { value: 'oral', label: 'Oral Examination' },
  { value: 'project', label: 'Project-Based' }
]

function Build({ onNavigate, onSave, onClear, onDelete, user, courseState, progress }) {
  const { currentCourse } = useCourse()
  const {
    openPKE,
    closePKE,
    isActive: isPKEActive,
    executeInvocation,
    acceptInvocation,
    isProcessing,
    message,
    messageType,
    getInvocationStatus,
    pendingResult
  } = usePKE()

  // Local state
  const [activeTab, setActiveTab] = useState('enabling') // 'enabling' | 'assessment'
  const [selectedModule, setSelectedModule] = useState(0)
  const [selectedLesson, setSelectedLesson] = useState(0)
  const [assessmentType, setAssessmentType] = useState('quiz')
  const [assessmentItems, setAssessmentItems] = useState([])
  const [editingItem, setEditingItem] = useState(null)

  // Get statuses
  const inv3Status = getInvocationStatus(3)
  const inv4Status = getInvocationStatus(4)

  // Handle navigation
  const handleNavigate = useCallback((section) => {
    onNavigate?.(section)
  }, [onNavigate])

  // Generate enabling objectives (Invocation 3)
  const handleGenerateEnabling = useCallback(async () => {
    try {
      await executeInvocation(3, {
        terminalObjectives: currentCourse?.learningObjectives || [],
        modules: currentCourse?.modules || []
      })
    } catch (err) {
      console.error('Failed to generate enabling objectives:', err)
    }
  }, [executeInvocation, currentCourse])

  // Generate assessment (Invocation 4)
  const handleGenerateAssessment = useCallback(async () => {
    try {
      await executeInvocation(4, {
        objectives: currentCourse?.learningObjectives || [],
        assessmentType,
        modules: currentCourse?.modules || []
      })
    } catch (err) {
      console.error('Failed to generate assessment:', err)
    }
  }, [executeInvocation, currentCourse, assessmentType])

  // Accept results
  const handleAccept = useCallback(async (invocationNum) => {
    try {
      await acceptInvocation(invocatio
