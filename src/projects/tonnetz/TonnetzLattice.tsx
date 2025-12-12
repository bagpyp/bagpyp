'use client';

import { useState, useEffect } from 'react';
import { AppProvider, useCamera } from './state/AppContext';
import { TonnetzCanvas } from './components/TonnetzCanvas';
import { LeftSidebar } from './components/LeftSidebar';
import { Toolbar } from './components/Toolbar';

function RecenterButton() {
  const { recenter } = useCamera();
  return (
    <button className="recenter-button" onClick={recenter} title="Snap to center (C)">
      ⌖
    </button>
  );
}

type MobilePanel = 'none' | 'settings' | 'path';

function TonnetzApp() {
  const [isMobile, setIsMobile] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('none');

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close panel when clicking overlay
  const handleOverlayClick = () => {
    setMobilePanel('none');
  };

  // Toggle panel
  const togglePanel = (panel: MobilePanel) => {
    setMobilePanel(prev => prev === panel ? 'none' : panel);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Tonnetz Lattice</h1>
        <span className="subtitle">Neo-Riemannian Harmonic Space</span>
      </header>

      <main className="app-main">
        {/* Desktop: Show sidebars normally */}
        {!isMobile && <LeftSidebar />}

        <div className="canvas-container">
          <TonnetzCanvas className="tonnetz-canvas" />
          <RecenterButton />
        </div>

        {!isMobile && (
          <aside className="sidebar right-sidebar">
            <Toolbar />
          </aside>
        )}

        {/* Mobile: Overlay and slide-up panels */}
        {isMobile && mobilePanel !== 'none' && (
          <div className="mobile-overlay" onClick={handleOverlayClick} />
        )}

        {/* Mobile: Settings panel (left sidebar content) */}
        {isMobile && (
          <aside
            className={`sidebar left-sidebar ${mobilePanel === 'settings' ? 'mobile-visible' : ''}`}
          >
            <div className="sidebar-header">
              <span style={{ flex: 1, fontWeight: 600 }}>Settings & Library</span>
              <button
                className="mobile-close-btn"
                onClick={() => setMobilePanel('none')}
                title="Close"
              >
                ×
              </button>
            </div>
            <MobileLeftSidebarContent />
          </aside>
        )}

        {/* Mobile: Path panel (right sidebar content) */}
        {isMobile && (
          <aside
            className={`sidebar right-sidebar ${mobilePanel === 'path' ? 'mobile-visible' : ''}`}
          >
            <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', padding: '0.75rem' }}>
              <span style={{ fontWeight: 600 }}>Chord Path</span>
              <button
                className="mobile-close-btn"
                onClick={() => setMobilePanel('none')}
                title="Close"
              >
                ×
              </button>
            </div>
            <div style={{ padding: '0.75rem', overflowY: 'auto', flex: 1 }}>
              <Toolbar />
            </div>
          </aside>
        )}

        {/* Mobile: Floating Action Buttons */}
        {isMobile && mobilePanel === 'none' && (
          <div className="mobile-fab-container">
            <button
              className="mobile-fab"
              onClick={() => togglePanel('settings')}
              title="Settings"
            >
              ⚙
              <span className="mobile-fab-label">Settings</span>
            </button>
            <button
              className="mobile-fab"
              onClick={() => togglePanel('path')}
              title="Chord Path"
            >
              ♪
              <span className="mobile-fab-label">Chords</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// Mobile-optimized left sidebar content with tabs
function MobileLeftSidebarContent() {
  const [activeTab, setActiveTab] = useState<'settings' | 'library'>('library');

  // Import components dynamically to avoid circular deps
  const { Controls } = require('./components/Controls');
  const { ProgressionLibrary } = require('./components/ProgressionLibrary');

  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-color)' }}>
        <button
          className={`sidebar-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
          style={{ flex: 1 }}
        >
          Settings
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => setActiveTab('library')}
          style={{ flex: 1 }}
        >
          Library
        </button>
      </div>
      <div className="sidebar-content">
        {activeTab === 'settings' && <Controls />}
        {activeTab === 'library' && <ProgressionLibrary />}
      </div>
    </>
  );
}

export default function TonnetzLattice() {
  return (
    <AppProvider>
      <TonnetzApp />
    </AppProvider>
  );
}
