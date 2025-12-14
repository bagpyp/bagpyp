import { useState, useRef, useCallback } from 'react';
import { Toolbar } from './Toolbar';
import { usePath, usePlayback } from '../state/AppContext';
import { playPath, initAudio } from '../audio/synth';

const MIN_WIDTH = 200;
const MAX_WIDTH = 400;
const DEFAULT_WIDTH = 280;

export function RightSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [repeat, setRepeat] = useState(false);
  const isResizing = useRef(false);
  const playingRef = useRef(false);
  const repeatRef = useRef(false);

  const { currentPath } = usePath();
  const { isPlaying, tempo, setPlaying, setPlayingIndex } = usePlayback();

  // Sync refs with state
  playingRef.current = isPlaying;
  repeatRef.current = repeat;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, window.innerWidth - e.clientX));
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

  const handlePlay = async () => {
    if (currentPath.length === 0) return;

    await initAudio();
    setPlaying(true);
    setPlayingIndex(0);

    do {
      await playPath(currentPath, tempo / 2, (step) => {
        if (!playingRef.current) return;
        setPlayingIndex(step);
      });
    } while (repeatRef.current && playingRef.current);

    setPlaying(false);
    setPlayingIndex(-1);
  };

  const handleStop = () => {
    setPlaying(false);
    setPlayingIndex(-1);
  };

  const { clearPath } = usePath();

  if (isCollapsed) {
    return (
      <aside className="sidebar right-sidebar collapsed">
        <div className="collapsed-controls">
          {!isPlaying ? (
            <button
              className="play-button collapsed-play"
              onClick={handlePlay}
              disabled={currentPath.length === 0}
              title="Play progression"
            >
              ▶
            </button>
          ) : (
            <button
              className="stop-button collapsed-stop"
              onClick={handleStop}
              title="Stop playback"
            >
              ■
            </button>
          )}
          <button
            className={`repeat-button collapsed-repeat ${repeat ? 'active' : ''}`}
            onClick={() => setRepeat(!repeat)}
            title={repeat ? 'Repeat on' : 'Repeat off'}
          >
            🔁
          </button>
          <button
            className="collapsed-clear"
            onClick={clearPath}
            disabled={currentPath.length === 0 || isPlaying}
            title="Clear path"
          >
            ✕
          </button>
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(false)}
          title="Expand sidebar"
        >
          ‹
        </button>
      </aside>
    );
  }

  return (
    <aside className="sidebar right-sidebar" style={{ width, minWidth: width }}>
      <div
        className="sidebar-resize-handle left"
        onMouseDown={handleMouseDown}
      />
      <div className="sidebar-header">
        <span className="sidebar-title">Path</span>
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(true)}
          title="Collapse sidebar"
        >
          ›
        </button>
      </div>
      <div className="sidebar-content">
        <Toolbar />
      </div>
    </aside>
  );
}
