import { useState, useCallback } from 'react'
import { THEME } from '../constants/theme'
import { useCourse } from '../context/CourseContext'
import { usePKE } from '../context/PKEContext'
import Header from '../components/Header'
import Footer from '../components/Footer'

function Build({ onNavigate, onSave, onClear, onDelete, user, courseState, progress }) {
  const { currentCourse } = useCourse()
  const { openPKE, closePKE, isActive: isPKEActive, isProcessing, message, messageType } = usePKE()
  const [activeTab, setActiveTab] = useState('enabling')

  const handleNavigate = useCallback((section) => {
    onNavigate?.(section)
  }, [onNavigate])

  return (
    <div style={{ width: '100%', height: '100%', background: THEME.BG_DARK, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Header pageTitle="BUILD" />

      {message && (
        <div style={{ padding: '12px 40px', background: 'rgba(212, 115, 12, 0.1)', borderBottom: '1px solid ' + THEME.AMBER, color: THEME.AMBER, fontSize: '12px' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', borderBottom: '1px solid ' + THEME.BORDER, padding: '0 40px' }}>
        <button onClick={() => setActiveTab('enabling')} style={{ padding: '16px 24px', background: 'transparent', border: 'none', borderBottom: '2px solid ' + (activeTab === 'enabling' ? THEME.AMBER : 'transparent'), color: activeTab === 'enabling' ? THEME.AMBER : THEME.TEXT_SECONDARY, fontSize: '11px', letterSpacing: '2px', cursor: 'pointer' }}>
          ENABLING OBJECTIVES
        </button>
        <button onClick={() => setActiveTab('assessment')} style={{ padding: '16px 24px', background: 'transparent', border: 'none', borderBottom: '2px solid ' + (activeTab === 'assessment' ? THEME.AMBER : 'transparent'), color: activeTab === 'assessment' ? THEME.AMBER : THEME.TEXT_SECONDARY, fontSize: '11px', letterSpacing: '2px', cursor: 'pointer' }}>
          ASSESSMENT
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '140px' }}>
        <div style={{ textAlign: 'center', color: THEME.TEXT_MUTED }}>
          <p style={{ fontSize: '14px', marginBottom: '8px' }}>{activeTab === 'enabling' ? 'Enabling Objectives' : 'Assessment Items'}</p>
          <p style={{ fontSize: '12px' }}>Content will appear here after PKE generation</p>
        </div>
      </div>

      <Footer currentSection="build" onNavigate={handleNavigate} isPKEActive={isPKEActive} onPKEToggle={(active) => active ? openPKE() : closePKE()} onSave={onSave} onClear={onClear} onDelete={onDelete} user={user} courseState={courseState} progress={progress} />
    </div>
  )
}

export default Build
