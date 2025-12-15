import { useState, useEffect, useCallback } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CourseProvider, useCourse } from './context/CourseContext'
import { PKEProvider } from './context/PKEContext'
import Login from './pages/Login'
import Define from './pages/Define'
import Build from './pages/Build'
import Format from './pages/Format'
import Generate from './pages/Generate'

function AppContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { saveCourse, isDirty } = useCourse()
  const [currentSection, setCurrentSection] = useState('define')
  const [isSaving, setIsSaving] = useState(false)

  // Handle Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = async (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (isDirty) {
          setIsSaving(true)
          try {
            await saveCourse()
          } catch (err) {
            console.error('Save failed:', err)
          } finally {
            setIsSaving(false)
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [saveCourse, isDirty])

  const handleNavigate = useCallback((section) => {
    setCurrentSection(section)
  }, [])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      await saveCourse()
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setIsSaving(false)
    }
  }, [saveCourse])

  if (authLoading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1a1a',
        color: '#D4730C'
      }}>
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  const renderSection = () => {
    switch (currentSection) {
      case 'define':
        return <Define onNavigate={handleNavigate} onSave={handleSave} />
      case 'build':
        return <Build onNavigate={handleNavigate} onSave={handleSave} />
      case 'format':
        return <Format onNavigate={handleNavigate} onSave={handleSave} />
      case 'generate':
        return <Generate onNavigate={handleNavigate} onSave={handleSave} />
      default:
        return <Define onNavigate={handleNavigate} onSave={handleSave} />
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {renderSection()}
      {isSaving && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{ color: '#D4730C', fontSize: '18px' }}>Saving...</div>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <CourseProvider>
        <PKEProvider>
          <AppContent />
        </PKEProvider>
      </CourseProvider>
    </AuthProvider>
  )
}

export default App
