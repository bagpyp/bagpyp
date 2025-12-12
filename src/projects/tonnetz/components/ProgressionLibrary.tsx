import { useState } from 'react';
import { MAJOR_PROGRESSIONS, MINOR_PROGRESSIONS } from '../data/progressions';
import type { Progression } from '../data/progressions';
import type { TrianglePathPoint, PitchClass } from '../state/types';
import { useApp } from '../state/AppContext';
import { playPath, initAudio } from '../audio/synth';
import { gridToPC, gridToPitch } from '../core/lattice';
import { mod12 } from '../core/musicMath';

/**
 * Convert progression points to use grid-based MIDI pitches
 * (same logic as ADD_TRIANGLE_TO_PATH in AppContext)
 */
function toGridBasedPoints(progression: Progression): TrianglePathPoint[] {
  return progression.points.map(point => {
    const rootPC = gridToPC(point.rootCell.row, point.rootCell.col);
    const third = point.type === 'major' ? 4 : 3;
    const pitchClasses: [PitchClass, PitchClass, PitchClass] = [
      rootPC,
      mod12(rootPC + third) as PitchClass,
      mod12(rootPC + 7) as PitchClass,
    ];
    const rootMidi = gridToPitch(point.rootCell.row, point.rootCell.col);
    const midiPitches: [number, number, number] = [
      rootMidi,
      rootMidi + third,
      rootMidi + 7,
    ];
    return {
      rootCell: point.rootCell,
      type: point.type,
      rootPC,
      pitchClasses,
      midiPitches,
    };
  });
}

export function ProgressionLibrary() {
  const { dispatch } = useApp();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<'major' | 'minor'>('major');

  const progressions = selectedMode === 'major' ? MAJOR_PROGRESSIONS : MINOR_PROGRESSIONS;

  const handleLoad = (progression: Progression) => {
    // Load the progression into the current path
    dispatch({ type: 'CLEAR_PATH' });
    progression.points.forEach(point => {
      dispatch({
        type: 'ADD_TRIANGLE_TO_PATH',
        rootCell: point.rootCell,
        triType: point.type,
      });
    });
  };

  const handleLoadAndPlay = async (progression: Progression) => {
    if (playingId) return;

    // Load to show on grid
    handleLoad(progression);

    await initAudio();
    setPlayingId(progression.id);

    // Play using grid-based MIDI pitches (same as what gets stored in state)
    const gridPoints = toGridBasedPoints(progression);
    await playPath(gridPoints, 50);

    setPlayingId(null);
  };

  return (
    <div className="progression-library">
      <h3>Progression Library</h3>

      <div className="mode-tabs">
        <button
          className={`mode-tab ${selectedMode === 'major' ? 'active' : ''}`}
          onClick={() => setSelectedMode('major')}
        >
          C Major
        </button>
        <button
          className={`mode-tab ${selectedMode === 'minor' ? 'active' : ''}`}
          onClick={() => setSelectedMode('minor')}
        >
          A Minor
        </button>
      </div>

      <div className="progression-list">
        {progressions.map((prog) => (
          <div
            key={prog.id}
            className={`progression-item ${playingId === prog.id ? 'playing' : ''}`}
          >
            <div className="progression-info">
              <span className="progression-name">{prog.name}</span>
              <span className="progression-length">{prog.points.length} chords</span>
            </div>
            <div className="progression-actions">
              <button
                className="prog-play-btn"
                onClick={() => handleLoadAndPlay(prog)}
                disabled={playingId !== null}
                title="Load and play"
              >
                {playingId === prog.id ? '♫' : '▶'}
              </button>
              <button
                className="prog-load-btn"
                onClick={() => handleLoad(prog)}
                disabled={playingId !== null}
                title="Load to grid"
              >
                ↗
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
