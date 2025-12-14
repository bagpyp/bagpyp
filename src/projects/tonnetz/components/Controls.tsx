import { useSettings } from '../state/AppContext';
import type { PitchClass, LabelMode } from '../state/types';

const NOTE_NAMES = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];

export function Controls() {
  const {
    settings,
    setLabelMode,
    setKeyCenter,
    toggleSharps,
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

      <div className="help-text">
        <h4>Controls</h4>
        <p><strong>Pan:</strong> Drag</p>
        <p><strong>Zoom:</strong> Scroll wheel</p>
        <p><strong>Tilt:</strong> Shift + drag</p>
        <p><strong>Rotate:</strong> ⌘/Ctrl + drag</p>
        <p><strong>Add chord:</strong> ⇧⌘ + click</p>
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
