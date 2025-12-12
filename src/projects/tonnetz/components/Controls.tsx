import { useSettings } from '../state/AppContext';
import type { PitchClass, LabelMode } from '../state/types';

const NOTE_NAMES = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];

export function Controls() {
  const {
    settings,
    setLabelMode,
    setKeyCenter,
    toggleSharps,
    toggleTriangles,
    togglePatchBoundaries,
    toggleMajorTriangles,
    toggleMinorTriangles,
  } = useSettings();

  return (
    <div className="controls">
      <h3>Settings</h3>

      <div className="control-group">
        <label>Label Mode</label>
        <select
          value={settings.labelMode}
          onChange={(e) => setLabelMode(e.target.value as LabelMode)}
        >
          <option value="notes">Note Names</option>
          <option value="intervals">Intervals</option>
          <option value="degrees">Scale Degrees</option>
        </select>
      </div>

      <div className="control-group">
        <label>Key Center</label>
        <select
          value={settings.keyCenter}
          onChange={(e) => setKeyCenter(Number(e.target.value) as PitchClass)}
        >
          {NOTE_NAMES.map((name, i) => (
            <option key={i} value={i}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.preferSharps}
            onChange={toggleSharps}
          />
          Prefer Sharps
        </label>
      </div>

      <h4>Display</h4>

      <div className="control-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.showTriangles}
            onChange={toggleTriangles}
          />
          Show Triangles
        </label>
      </div>

      {settings.showTriangles && (
        <>
          <div className="control-group sub-control">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.showMajorTriangles}
                onChange={toggleMajorTriangles}
              />
              <span className="major-indicator">Major</span>
            </label>
          </div>

          <div className="control-group sub-control">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.showMinorTriangles}
                onChange={toggleMinorTriangles}
              />
              <span className="minor-indicator">Minor</span>
            </label>
          </div>
        </>
      )}

      <div className="control-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.showPatchBoundaries}
            onChange={togglePatchBoundaries}
          />
          Show Patch Boundaries
        </label>
      </div>

      <div className="help-text">
        <h4>Controls</h4>
        <p><strong>Pan:</strong> Click and drag</p>
        <p><strong>Zoom:</strong> Mouse wheel</p>
        <p><strong>Add to path:</strong> Click a cell</p>
      </div>

      <div className="help-text">
        <h4>Tonnetz Axes</h4>
        <p><strong>Right:</strong> +M3 (4 semitones)</p>
        <p><strong>Down:</strong> +m3 (3 semitones)</p>
        <p><strong>Diagonal:</strong> +P5 (7 semitones)</p>
      </div>
    </div>
  );
}
