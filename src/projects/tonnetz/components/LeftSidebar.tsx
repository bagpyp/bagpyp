import { useState, useRef, useCallback } from 'react';
import { Controls } from './Controls';
import { ProgressionLibrary } from './ProgressionLibrary';

type Tab = 'settings' | 'library';

const MIN_WIDTH = 200;
const MAX_WIDTH = 500;
const DEFAULT_WIDTH = 260;

export function LeftSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('library');
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const isResizing = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  if (isCollapsed) {
    return (
      <aside
        className="sidebar left-sidebar collapsed"
        onClick={() => setIsCollapsed(false)}
        title="Expand sidebar"
      >
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(false)}
          title="Expand sidebar"
        >
          ›
        </button>
      </aside>
    );
  }

  return (
    <aside className="sidebar left-sidebar" style={{ width, minWidth: width }}>
      <div className="sidebar-header">
        <div className="sidebar-tabs">
          <button
            className={`sidebar-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
          <button
            className={`sidebar-tab ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => setActiveTab('library')}
          >
            Library
          </button>
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(true)}
          title="Collapse sidebar"
        >
          ‹
        </button>
      </div>

      <div className="sidebar-content">
        {activeTab === 'settings' && <Controls />}
        {activeTab === 'library' && <ProgressionLibrary />}
      </div>
      <div
        className="sidebar-resize-handle"
        onMouseDown={handleMouseDown}
      />
    </aside>
  );
}
