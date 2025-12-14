import { useState, useEffect, useRef } from 'react';
import { usePath, usePlayback } from '../state/AppContext';
import { chordName } from '../core/musicMath';
import { getSeventhChordName } from '../core/seventhChords';
import { playPath, playChordPreviewMidi, initAudio } from '../audio/synth';

export function Toolbar() {
  const { currentPath, savedPaths, undoPath, clearPath, savePath, loadPath, deleteSavedPath } = usePath();
  const { isPlaying, tempo, playingIndex, setPlaying, setTempo, setPlayingIndex } = usePlayback();
  const [pathName, setPathName] = useState('');
  const [repeat, setRepeat] = useState(false);
  const playingRef = useRef(false);
  const repeatRef = useRef(false);

  // Sync refs with state
  useEffect(() => {
    playingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  const handleSave = () => {
    if (currentPath.length > 0 && pathName.trim()) {
      const hue = Math.floor(Math.random() * 360);
      const color = `hsl(${hue}, 70%, 60%)`;
      savePath(pathName.trim(), color);
      setPathName('');
    }
  };

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

  const handlePreview = (midiPitches: [number, number, number]) => {
    initAudio();
    playChordPreviewMidi(midiPitches);
  };

  const handleExport = () => {
    const data = {
      currentPath,
      savedPaths,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tonnetz-paths.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.currentPath && Array.isArray(data.currentPath)) {
          clearPath();
          console.log('Imported path:', data.currentPath);
        }
      } catch (err) {
        console.error('Failed to import paths:', err);
      }
    };
    reader.readAsText(file);
  };

  // Convert path to chord names for display
  const pathDisplay = currentPath.map((p, i) => {
    // Use 7th chord name if upgraded, otherwise use triad name
    const name = p.seventhQuality
      ? getSeventhChordName(p.rootPC, p.seventhQuality, true)
      : chordName(p.rootPC, p.type, 0, true);
    const isActive = i === playingIndex;
    return { name, isActive };
  });

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3>Current Path</h3>

        <div className="path-display">
          {pathDisplay.length > 0 ? (
            <span className="path-notes">
              {pathDisplay.map((chord, i) => (
                <span
                  key={i}
                  className={`chord-name ${chord.isActive ? 'active' : ''}`}
                  onClick={() => handlePreview(currentPath[i].midiPitches)}
                  title="Click to preview"
                >
                  {chord.name}
                  {i < pathDisplay.length - 1 && ' → '}
                </span>
              ))}
            </span>
          ) : (
            <span className="path-empty">Click triangles to build a chord progression</span>
          )}
        </div>

        <div className="path-info">
          {currentPath.length > 0 && (
            <span>{currentPath.length} chord{currentPath.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        <div className="toolbar-buttons">
          <button
            onClick={undoPath}
            disabled={currentPath.length === 0 || isPlaying}
            title="Undo last chord"
          >
            Undo
          </button>
          <button
            onClick={clearPath}
            disabled={currentPath.length === 0 || isPlaying}
            title="Clear path"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <h4>Playback</h4>
        <div className="playback-controls">
          {!isPlaying ? (
            <button
              className="play-button"
              onClick={handlePlay}
              disabled={currentPath.length === 0}
              title="Play progression"
            >
              ▶ Play
            </button>
          ) : (
            <button
              className="stop-button"
              onClick={handleStop}
              title="Stop playback"
            >
              ■ Stop
            </button>
          )}
          <button
            className={`repeat-button ${repeat ? 'active' : ''}`}
            onClick={() => setRepeat(!repeat)}
            title={repeat ? 'Repeat on' : 'Repeat off'}
          >
            🔁
          </button>
        </div>
        <div className="tempo-control">
          <label>
            Tempo: {tempo} BPM
            <input
              type="range"
              min="40"
              max="200"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              disabled={isPlaying}
            />
          </label>
        </div>
      </div>

      <div className="toolbar-section">
        <h4>Save Path</h4>
        <div className="save-path">
          <input
            type="text"
            placeholder="Path name..."
            value={pathName}
            onChange={(e) => setPathName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            disabled={isPlaying}
          />
          <button
            onClick={handleSave}
            disabled={currentPath.length === 0 || !pathName.trim() || isPlaying}
          >
            Save
          </button>
        </div>
      </div>

      {savedPaths.length > 0 && (
        <div className="toolbar-section">
          <h4>Saved Paths</h4>
          <div className="saved-paths">
            {savedPaths.map((path) => (
              <div key={path.id} className="saved-path-item">
                <span
                  className="saved-path-color"
                  style={{ backgroundColor: path.color }}
                />
                <span className="saved-path-name">{path.name}</span>
                <span className="saved-path-length">({path.points.length})</span>
                <button
                  className="saved-path-load"
                  onClick={() => loadPath(path)}
                  disabled={isPlaying}
                  title="Load path"
                >
                  Load
                </button>
                <button
                  className="saved-path-delete"
                  onClick={() => deleteSavedPath(path.id)}
                  disabled={isPlaying}
                  title="Delete path"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="toolbar-section">
        <h4>Import/Export</h4>
        <div className="toolbar-buttons">
          <button onClick={handleExport} disabled={isPlaying}>Export JSON</button>
          <label className="file-input-label">
            Import JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isPlaying}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
