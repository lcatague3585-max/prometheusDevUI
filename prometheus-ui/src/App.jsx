import { useState, useEffect } from 'react'
import './App.css'
import logo from './assets/prometheus-logo.png'
import Describe from './pages/Describe'
import Design from './pages/Design'
import Header from './components/Header'
import StatusBar from './components/StatusBar'
import Navigation from './components/Navigation'
import DebugGrid from './components/DebugGrid'
import { useViewportScale } from './hooks/useViewportScale'

function App() {
  // Viewport scaling for cross-device compatibility
  const viewportScale = useViewportScale()
  
  // Separate login state from page navigation
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentPage, setCurrentPage] = useState('define')
  const [showLogin, setShowLogin] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [courseLoaded, setCourseLoaded] = useState(true)
  
  // Debug grid toggle state
  const [showGrid, setShowGrid] = useState(false)

  // Keyboard shortcut for grid toggle (Ctrl+G)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'g') {
        e.preventDefault()
        setShowGrid(prev => !prev)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const fieldWidth = '455px'

  const handleLogin = (e) => {
    e.preventDefault()
    setIsLoggedIn(true)
    setCurrentPage('define')
  }

  // Navigation only changes currentPage, NOT isLoggedIn
  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  // Placeholder component for pages not yet built
  const PlaceholderPage = ({ pageName }) => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-[#f2f2f2] text-2xl font-prometheus tracking-wider uppercase mb-4">
          {pageName}
        </h2>
        <p className="text-[#767171] text-sm font-prometheus">
          Coming Soon
        </p>
      </div>
    </div>
  )

  // Render logged-in pages
  if (isLoggedIn) {
    return (
      <div 
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          overflow: 'hidden',
          backgroundColor: '#0d0d0d'
        }}
      >
        <div 
          className="bg-[#0d0d0d] flex flex-col"
          style={{
            width: '1920px',
            height: '1080px',
            transform: `scale(${viewportScale})`,
            transformOrigin: 'top center',
            flexShrink: 0
          }}
        >
          {/* Debug Grid Overlay */}
          <DebugGrid isVisible={showGrid} scale={viewportScale} />
          
          <Header courseLoaded={courseLoaded} />

        {/* B9: Upper horizontal line - FULL WIDTH (no margins) */}
        <div 
          className="h-[1px] w-full mt-2 mb-4"
          style={{
            background: 'linear-gradient(to right, #767171, #ffffff)'
          }}
        />

        {/* Page Content */}
        {currentPage === 'define' && (
          <Describe 
            onNavigate={handleNavigate} 
            courseLoaded={courseLoaded}
            setCourseLoaded={setCourseLoaded}
          />
        )}
        {currentPage === 'design' && (
          <Design 
            onNavigate={handleNavigate} 
            courseLoaded={courseLoaded}
            setCourseLoaded={setCourseLoaded}
          />
        )}
        {currentPage === 'build' && <PlaceholderPage pageName="Build" />}
        {currentPage === 'export' && <PlaceholderPage pageName="Export" />}
        {currentPage === 'format' && <PlaceholderPage pageName="Format" />}

        {/* Bottom Section - only show for placeholder pages (not Define or Design) */}
        {currentPage !== 'define' && currentPage !== 'design' && (
          <div className="mt-auto">
            <div className="flex items-center justify-between px-[3%] py-4">
              <Navigation activePage={currentPage} onNavigate={handleNavigate} />
              <div className="flex items-center gap-4 text-[#767171]">
                <button className="hover:text-[#f2f2f2] transition-colors text-lg">&lt;</button>
                <span className="text-xs">+</span>
                <button className="hover:text-[#f2f2f2] transition-colors text-lg">&gt;</button>
              </div>
              <div className="flex items-center gap-3">
                <button className="h-[31px] px-6 rounded-full text-[13px] font-prometheus text-[#f2f2f2] uppercase tracking-wider border border-[#767171] bg-transparent hover:border-[#f2f2f2] transition-all">
                  Delete
                </button>
                <button className="h-[31px] px-6 rounded-full text-[13px] font-prometheus text-[#f2f2f2] uppercase tracking-wider border border-[#767171] bg-transparent hover:border-[#f2f2f2] transition-all">
                  Clear
                </button>
                <button
                  className="h-[31px] px-6 rounded-full text-[13px] font-prometheus text-white uppercase tracking-wider transition-all hover:brightness-110"
                  style={{
                    background: 'linear-gradient(to bottom, #D65700, #763000)'
                  }}
                >
                  Save
                </button>
              </div>
            </div>
            <StatusBar courseLoaded={courseLoaded} />
          </div>
        )}
        </div>
      </div>
    )
  }

  // Render Login page
  return (
    <div 
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflow: 'hidden',
        backgroundColor: '#0d0d0d'
      }}
    >
      <div 
        className="bg-prometheus-dark relative"
        style={{
          width: '1920px',
          height: '1080px',
          transform: `scale(${viewportScale})`,
          transformOrigin: 'top center',
          flexShrink: 0
        }}
      >
        {/* Debug Grid Overlay - also available on login page */}
        <DebugGrid isVisible={showGrid} scale={viewportScale} />
        
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d0d] via-[#111111] to-[#0a0a0a]" />
        
        <div className="relative z-10 min-h-screen p-[3%]">
        
        <div className="flex items-center gap-5 pt-[2%]">
          <img 
            src={logo} 
            alt="Prometheus" 
            className="w-[104px] h-[104px] object-contain"
          />
          
          <div className="flex flex-col">
            <span className="text-[#f2f2f2] text-2xl tracking-wider font-prometheus uppercase">
              PROMETHEUS COURSE
            </span>
            <span className="text-[#f2f2f2] text-2xl tracking-wider font-prometheus uppercase">
              GENERATION SYSTEM 2.0
            </span>
          </div>
        </div>

        <div 
          className="mt-5 h-[1px] w-full"
          style={{
            background: 'linear-gradient(to right, #767171, #ffffff)'
          }}
        />

        <div className="mt-[8%] flex justify-center">
          <div className="flex items-start gap-8">
            
            <button
              onClick={() => setShowLogin(true)}
              className="text-[#f2f2f2] text-lg tracking-wider uppercase font-prometheus 
                         hover:text-white transition-colors cursor-pointer 
                         bg-transparent border-none p-0"
              style={{ lineHeight: '1.25rem' }} 
            >
              LOGIN:
            </button>

            <div
              className={`transition-opacity duration-300 ${
                showLogin ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <form className="flex flex-col" onSubmit={handleLogin}>
                
                <div className="flex flex-col gap-1">
                  <label 
                    className="text-[#f2f2f2] text-sm tracking-wider uppercase font-prometheus"
                    style={{ lineHeight: '1.25rem' }}
                  >
                    USERNAME
                  </label>
                  <div 
                    className="p-[1px] rounded-md"
                    style={{
                      background: 'linear-gradient(to right, #767171, #ffffff)',
                      width: fieldWidth
                    }}
                  >
                    <input
                      type="text"
                      className="w-full h-[34px] bg-[#1a1a1a] text-[#f2f2f2] px-3 
                                 focus:outline-none font-prometheus text-sm rounded-md"
                    />
                  </div>
                </div>

                <div className="h-5" />

                <div className="flex flex-col gap-1">
                  <label className="text-[#f2f2f2] text-sm tracking-wider uppercase font-prometheus">
                    PASSWORD
                  </label>
                  <div 
                    className="p-[1px] rounded-md"
                    style={{
                      background: 'linear-gradient(to right, #767171, #ffffff)',
                      width: fieldWidth
                    }}
                  >
                    <input
                      type="password"
                      className="w-full h-[34px] bg-[#1a1a1a] text-[#f2f2f2] px-3 
                                 focus:outline-none font-prometheus text-sm rounded-md"
                    />
                  </div>
                </div>

                <div className="h-4" />

                <button
                  type="submit"
                  className="py-3 rounded-full text-white uppercase 
                             tracking-wider text-base font-medium transition-all
                             hover:brightness-110 hover:shadow-lg hover:shadow-orange-900/30"
                  style={{
                    width: fieldWidth,
                    background: 'linear-gradient(to bottom, #d97706, #b45309, #92400e)'
                  }}
                >
                  LOGIN
                </button>

                <div 
                  className="flex items-center justify-between mt-2"
                  style={{ width: fieldWidth }}
                >
                  <button
                    type="button"
                    className="text-[#767171] text-xs hover:text-[#a0a0a0] 
                               transition-colors bg-transparent border-none 
                               cursor-pointer font-prometheus"
                  >
                    Forgot Password?
                  </button>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3 h-3 accent-orange-600 cursor-pointer"
                    />
                    <span className="text-[#767171] text-xs font-prometheus">
                      Remember Me
                    </span>
                  </label>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
