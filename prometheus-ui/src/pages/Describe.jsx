import { useState, useCallback } from 'react'
import Navigation from '../components/Navigation'
import PKEInterface from '../components/PKEInterface'
import StatusBar from '../components/StatusBar'
import GradientBorder from '../components/GradientBorder'
import pkeButton from '../assets/PKE_Button.png'
import { LAYOUT } from '../constants/layout'

function Describe({ onNavigate, courseLoaded, setCourseLoaded }) {
  const [isPKEActive, setIsPKEActive] = useState(false)
  
  // B10: Track focused and hovered field for burnt orange effect
  const [focusedField, setFocusedField] = useState(null)
  const [hoveredField, setHoveredField] = useState(null)
  
  const [formData, setFormData] = useState({
    title: '',
    level: '',
    thematic: '',
    duration: '',
    code: '',
    developer: '',
    selectedCourse: '',
    description: ''
  })

  // Stable handler using useCallback to prevent re-renders
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  // B10: Clear focus state helper
  const clearFocusState = useCallback(() => {
    setFocusedField(null)
  }, [])

  // B10: Handle field focus
  const handleFieldFocus = useCallback((field) => {
    setFocusedField(field)
  }, [])

  // B10: Handle field blur
  const handleFieldBlur = useCallback(() => {
    setFocusedField(null)
  }, [])

  // B10: Handle key events (Escape, Enter clear focus)
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
      e.target.blur()
      setFocusedField(null)
    }
  }, [])

  // Deactivate PKE and clear focus on load
  const handleLoad = useCallback(() => {
    setCourseLoaded(true)
    setIsPKEActive(false)
    clearFocusState()
  }, [setCourseLoaded, clearFocusState])

  // Deactivate PKE and clear focus on clear
  const handleClear = useCallback(() => {
    setCourseLoaded(false)
    setIsPKEActive(false)
    clearFocusState()
    setFormData({
      title: '',
      level: '',
      thematic: '',
      duration: '',
      code: '',
      developer: '',
      selectedCourse: '',
      description: ''
    })
  }, [setCourseLoaded, clearFocusState])

  // Deactivate PKE and clear focus on save
  const handleSave = useCallback(() => {
    console.log('Saving course data:', formData)
    setIsPKEActive(false)
    clearFocusState()
  }, [formData, clearFocusState])

  // Deactivate PKE and clear focus on delete
  const handleDelete = useCallback(() => {
    setIsPKEActive(false)
    clearFocusState()
    handleClear()
  }, [handleClear, clearFocusState])

  // Navigation handler that deactivates PKE and clears focus
  const handleNavigateWithPKEClose = useCallback((page) => {
    setIsPKEActive(false)
    clearFocusState()
    onNavigate(page)
  }, [onNavigate, clearFocusState])

  // Toggle PKE active state
  const togglePKE = useCallback(() => {
    setIsPKEActive(prev => !prev)
  }, [])

  // B10: Check if a field should show burnt orange (focused OR hovered when not focused elsewhere)
  const isFieldActive = useCallback((field) => {
    if (focusedField === field) return true
    if (focusedField === null && hoveredField === field) return true
    return false
  }, [focusedField, hoveredField])

  // Sizing constants from layout.js
  const labelFontSize = 'text-[15px]'

  // Level dropdown options (10 options)
  const levelOptions = [
    { value: '', label: 'Select...' },
    { value: 'awareness', label: 'Awareness' },
    { value: 'foundation', label: 'Foundation' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' },
    { value: 'all-awareness', label: 'All Awareness' },
    { value: 'all-foundation', label: 'All Foundation' },
    { value: 'all-intermediate', label: 'All Intermediate' },
    { value: 'all-advanced', label: 'All Advanced' },
    { value: 'senior-expert', label: 'Senior Expert' }
  ]

  // Thematic dropdown options (7 options)
  const thematicOptions = [
    { value: '', label: 'Select...' },
    { value: 'defence-security', label: 'Defence & Security' },
    { value: 'intelligence', label: 'Intelligence' },
    { value: 'policing', label: 'Policing' },
    { value: 'leadership-management', label: 'Leadership & Management' },
    { value: 'crisis-response', label: 'Crisis Response' },
    { value: 'resilience', label: 'Resilience' },
    { value: 'personal-skills', label: 'Personal Skills' }
  ]

  // B10: Get label color based on active state
  const getLabelColor = (field) => {
    return isFieldActive(field) ? 'text-[#FF6600]' : 'text-[#f2f2f2]'
  }

  // Calculate positions from centerline
  const leftFormRightEdge = LAYOUT.LEFT_FORM_RIGHT_EDGE  // -95
  const descriptionLeftEdge = LAYOUT.RIGHT_FORM_LEFT_EDGE  // +95

  // Bottom section Y coordinates (fixed positioning from viewport top)
  const ABOVE_LINE_BOTTOM = 860  // Elements above line - bottom edge Y
  const BOTTOM_LINE_Y = 875      // Horizontal line top edge
  const BELOW_LINE_Y = 915       // Status bar content Y plane

  return (
    <>
      {/* Page Title */}
      <div className="flex items-center justify-center gap-3 mb-6 mt-[12px]">
        <h1 className="text-[#f2f2f2] text-xl tracking-[0.3em] font-prometheus uppercase">
          COURSE INFORMATION
        </h1>
        {/* PKE Button */}
        <img 
          src={pkeButton} 
          alt="PKE" 
          className="w-8 h-8 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={togglePKE}
        />
      </div>

      {/* Main Content Area - Using absolute positioning from centerline */}
      <div className="flex-1 relative" style={{ marginTop: `${LAYOUT.FORM_TOP_OFFSET}px` }}>
        
        {/* Left Side - Form Fields */}
        <div 
          className="absolute"
          style={{ 
            right: `calc(50% - ${leftFormRightEdge}px)`,
            top: 0
          }}
        >
          <div className="flex">
            {/* Labels column */}
            <div className="flex flex-col items-end pr-4" style={{ width: `${LAYOUT.LABEL_WIDTH}px` }}>
              <label className={`${getLabelColor('title')} ${labelFontSize} font-prometheus h-[${LAYOUT.INPUT_HEIGHT}px] flex items-center transition-colors`}>
                Title:
              </label>
              <div style={{ height: `${LAYOUT.ROW_GAP}px` }} />
              <label className={`${getLabelColor('level')} ${labelFontSize} font-prometheus h-[${LAYOUT.INPUT_HEIGHT}px] flex items-center transition-colors`}>
                Level:
              </label>
              <div style={{ height: `${LAYOUT.ROW_GAP}px` }} />
              <label className={`${getLabelColor('thematic')} ${labelFontSize} font-prometheus h-[${LAYOUT.INPUT_HEIGHT}px] flex items-center transition-colors`}>
                Thematic:
              </label>
              <div style={{ height: `${LAYOUT.ROW_GAP}px` }} />
              <label className={`${getLabelColor('duration')} ${labelFontSize} font-prometheus h-[${LAYOUT.INPUT_HEIGHT}px] flex items-center transition-colors`}>
                Duration:
              </label>
              <div style={{ height: `${LAYOUT.ROW_GAP}px` }} />
              <label className={`${getLabelColor('developer')} ${labelFontSize} font-prometheus h-[${LAYOUT.INPUT_HEIGHT}px] flex items-center transition-colors`}>
                Developer:
              </label>
              <div style={{ height: `${LAYOUT.ROW_GAP + LAYOUT.DEVELOPER_SELECT_GAP}px` }} />
              <label className={`${getLabelColor('selectedCourse')} ${labelFontSize} font-prometheus h-[${LAYOUT.INPUT_HEIGHT}px] flex items-center transition-colors`}>
                Select Course:
              </label>
            </div>
            
            {/* Inputs column */}
            <div className="flex flex-col" style={{ width: `${LAYOUT.INPUT_WIDTH}px` }}>
              {/* Title */}
              <GradientBorder isActive={isFieldActive('title')}>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  onFocus={() => handleFieldFocus('title')}
                  onBlur={handleFieldBlur}
                  onKeyDown={handleKeyDown}
                  onMouseEnter={() => setHoveredField('title')}
                  onMouseLeave={() => setHoveredField(null)}
                  className={`w-full h-[${LAYOUT.INPUT_HEIGHT}px] bg-[#0d0d0d] text-[#f2f2f2] text-[13px] px-4 rounded-[3px] focus:outline-none font-cascadia`}
                />
              </GradientBorder>
              <div style={{ height: `${LAYOUT.ROW_GAP}px` }} />
              
              {/* Level */}
              <GradientBorder isActive={isFieldActive('level')}>
                <select
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  onFocus={() => handleFieldFocus('level')}
                  onBlur={handleFieldBlur}
                  onKeyDown={handleKeyDown}
                  onMouseEnter={() => setHoveredField('level')}
                  onMouseLeave={() => setHoveredField(null)}
                  className={`w-full h-[${LAYOUT.INPUT_HEIGHT}px] bg-[#0d0d0d] text-[#f2f2f2] text-[13px] px-4 rounded-[3px] focus:outline-none font-cascadia cursor-pointer`}
                >
                  {levelOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </GradientBorder>
              <div style={{ height: `${LAYOUT.ROW_GAP}px` }} />
              
              {/* Thematic */}
              <GradientBorder isActive={isFieldActive('thematic')}>
                <select
                  value={formData.thematic}
                  onChange={(e) => handleInputChange('thematic', e.target.value)}
                  onFocus={() => handleFieldFocus('thematic')}
                  onBlur={handleFieldBlur}
                  onKeyDown={handleKeyDown}
                  onMouseEnter={() => setHoveredField('thematic')}
                  onMouseLeave={() => setHoveredField(null)}
                  className={`w-full h-[${LAYOUT.INPUT_HEIGHT}px] bg-[#0d0d0d] text-[#f2f2f2] text-[13px] px-4 rounded-[3px] focus:outline-none font-cascadia cursor-pointer`}
                >
                  {thematicOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </GradientBorder>
              <div style={{ height: `${LAYOUT.ROW_GAP}px` }} />
              
              {/* Duration + Code Row */}
              <div className="flex items-center gap-3">
                <GradientBorder className={`w-[${LAYOUT.DURATION_WIDTH}px]`} isActive={isFieldActive('duration')}>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    onFocus={() => handleFieldFocus('duration')}
                    onBlur={handleFieldBlur}
                    onKeyDown={handleKeyDown}
                    onMouseEnter={() => setHoveredField('duration')}
                    onMouseLeave={() => setHoveredField(null)}
                    className={`w-full h-[${LAYOUT.INPUT_HEIGHT}px] bg-[#0d0d0d] text-[#f2f2f2] text-[13px] px-4 rounded-[3px] focus:outline-none font-cascadia`}
                  />
                </GradientBorder>
                <label className={`${getLabelColor('code')} ${labelFontSize} font-prometheus transition-colors`}>
                  Code:
                </label>
                <GradientBorder className="flex-1" isActive={isFieldActive('code')}>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    onFocus={() => handleFieldFocus('code')}
                    onBlur={handleFieldBlur}
                    onKeyDown={handleKeyDown}
                    onMouseEnter={() => setHoveredField('code')}
                    onMouseLeave={() => setHoveredField(null)}
                    className={`w-full h-[${LAYOUT.INPUT_HEIGHT}px] bg-[#0d0d0d] text-[#f2f2f2] text-[13px] px-4 rounded-[3px] focus:outline-none font-cascadia`}
                  />
                </GradientBorder>
              </div>
              <div style={{ height: `${LAYOUT.ROW_GAP}px` }} />
              
              {/* Developer */}
              <GradientBorder isActive={isFieldActive('developer')}>
                <input
                  type="text"
                  value={formData.developer}
                  onChange={(e) => handleInputChange('developer', e.target.value)}
                  onFocus={() => handleFieldFocus('developer')}
                  onBlur={handleFieldBlur}
                  onKeyDown={handleKeyDown}
                  onMouseEnter={() => setHoveredField('developer')}
                  onMouseLeave={() => setHoveredField(null)}
                  className={`w-full h-[${LAYOUT.INPUT_HEIGHT}px] bg-[#0d0d0d] text-[#f2f2f2] text-[13px] px-4 rounded-[3px] focus:outline-none font-cascadia`}
                />
              </GradientBorder>
              <div style={{ height: `${LAYOUT.ROW_GAP + LAYOUT.DEVELOPER_SELECT_GAP}px` }} />
              
              {/* Select Course */}
              <GradientBorder isActive={isFieldActive('selectedCourse')}>
                <select
                  value={formData.selectedCourse}
                  onChange={(e) => handleInputChange('selectedCourse', e.target.value)}
                  onFocus={() => handleFieldFocus('selectedCourse')}
                  onBlur={handleFieldBlur}
                  onKeyDown={handleKeyDown}
                  onMouseEnter={() => setHoveredField('selectedCourse')}
                  onMouseLeave={() => setHoveredField(null)}
                  className={`w-full h-[${LAYOUT.INPUT_HEIGHT}px] bg-[#0d0d0d] text-[#f2f2f2] text-[13px] px-4 rounded-[3px] focus:outline-none font-cascadia cursor-pointer`}
                >
                  <option value="">Select...</option>
                  <option value="course1">Course 1</option>
                  <option value="course2">Course 2</option>
                  <option value="course3">Course 3</option>
                </select>
              </GradientBorder>
              <div style={{ height: `${LAYOUT.ROW_GAP}px` }} />
              
              {/* Load Button - Right aligned */}
              <div className="flex justify-end">
                <button
                  onClick={handleLoad}
                  className="h-[31px] px-10 rounded-full text-[13px] font-prometheus text-white uppercase tracking-wider transition-all hover:brightness-110"
                  style={{
                    background: 'linear-gradient(to bottom, #D65700, #763000)'
                  }}
                >
                  Load
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Description */}
        <div 
          className="absolute flex flex-col"
          style={{ 
            left: `calc(50% + ${descriptionLeftEdge}px)`,
            top: 0,
            width: `${LAYOUT.DESCRIPTION_WIDTH}px`
          }}
        >
          <GradientBorder className="flex-1" isActive={isFieldActive('description')}>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              onFocus={() => handleFieldFocus('description')}
              onBlur={handleFieldBlur}
              onKeyDown={handleKeyDown}
              onMouseEnter={() => setHoveredField('description')}
              onMouseLeave={() => setHoveredField(null)}
              className={`w-full h-full bg-[#0d0d0d] text-[#f2f2f2] text-[13px] p-5 rounded-[3px] focus:outline-none font-cascadia resize-none`}
              style={{ minHeight: `${LAYOUT.DESCRIPTION_MIN_HEIGHT}px` }}
              placeholder="Enter course description..."
            />
          </GradientBorder>
          {/* Label below textarea */}
          <label 
            className={`${getLabelColor('description')} ${labelFontSize} font-prometheus mt-2 transition-colors`}
          >
            Description
          </label>
        </div>
      </div>

      {/* ============================================== */}
      {/* BOTTOM SECTION - Fixed Y coordinate positioning */}
      {/* Using position: fixed for exact viewport coordinates */}
      {/* ============================================== */}
      
      {/* Elements ABOVE the line - bottom edges at Y = 860px */}
      {/* This means top = 860px - elementHeight */}
      {/* Navigation buttons ~47px tall, PKE 76px tall, action buttons 31px tall */}
      {/* Position container so bottom edge is at 860px */}
      <div 
        className="fixed left-0 right-0 flex items-end justify-between px-[3%]"
        style={{ top: `${ABOVE_LINE_BOTTOM - 120}px`, height: '120px' }}
      >
        {/* Navigation buttons - left side */}
        <div style={{ marginLeft: `${LAYOUT.NAV_LEFT_OFFSET}px` }}>
          <Navigation activePage="define" onNavigate={handleNavigateWithPKEClose} />
        </div>

        {/* Center section: < + > buttons and PKE Interface */}
        <div className="flex flex-col items-center justify-end h-full">
          {/* < + > buttons - 6px above PKE window, shifted 35px right to align with PKE */}
          <div className="flex items-center gap-4 text-[#767171] mb-[6px]" style={{ marginLeft: '35px' }}>
            <button className="hover:text-[#f2f2f2] transition-colors text-xl">&lt;</button>
            <span className="text-sm">+</span>
            <button className="hover:text-[#f2f2f2] transition-colors text-xl">&gt;</button>
          </div>
          
          {/* PKE Interface Window */}
          <PKEInterface 
            isActive={isPKEActive} 
            onClose={() => setIsPKEActive(false)} 
          />
        </div>

        {/* Action buttons - right side */}
        <div className="flex items-end gap-3">
          <button
            onClick={handleDelete}
            className="h-[31px] px-6 rounded-full text-[13px] font-prometheus text-[#f2f2f2] uppercase tracking-wider border border-[#767171] bg-transparent hover:border-[#f2f2f2] transition-all"
          >
            Delete
          </button>
          <button
            onClick={handleClear}
            className="h-[31px] px-6 rounded-full text-[13px] font-prometheus text-[#f2f2f2] uppercase tracking-wider border border-[#767171] bg-transparent hover:border-[#f2f2f2] transition-all"
          >
            Clear
          </button>
          <button
            onClick={handleSave}
            className="h-[31px] px-6 rounded-full text-[13px] font-prometheus text-white uppercase tracking-wider transition-all hover:brightness-110"
            style={{
              background: 'linear-gradient(to bottom, #D65700, #763000)'
            }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Bottom horizontal gradient line at Y = 875px */}
      <div 
        className="fixed left-0 right-0 h-[1px]"
        style={{
          top: `${BOTTOM_LINE_Y}px`,
          background: 'linear-gradient(to right, #ffffff, #767171 46%, #3b3838)'
        }}
      />

      {/* Status bar BELOW the line - positioned at Y = 915px */}
      <div 
        className="fixed left-0 right-0"
        style={{ top: `${BELOW_LINE_Y}px` }}
      >
        <StatusBar courseLoaded={courseLoaded} />
      </div>
    </>
  )
}

export default Describe
