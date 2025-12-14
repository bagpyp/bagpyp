// Pitch class type (0-11)
export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

// Grid cell coordinates
export interface GridCell {
  row: number;
  col: number;
}

// 2D point in world/screen coordinates
export interface Point {
  x: number;
  y: number;
}

// Camera state for pan/zoom/tilt/rotate
export interface Camera {
  x: number; // center x in world coords
  y: number; // center y in world coords
  zoom: number; // scale factor
  tilt: number; // tilt angle in degrees (0 = bird's eye, 90 = side view)
  rotation: number; // rotation angle in degrees around Z axis
}

// Label display modes
export type LabelMode = 'notes' | 'intervals' | 'degrees';

// Triangle representing a triad
export interface Triangle {
  type: 'major' | 'minor';
  rootCell: GridCell;
  rootPC: PitchClass;
  vertices: [Point, Point, Point]; // pixel coords of corners
  pitchClasses: [PitchClass, PitchClass, PitchClass];
}

// Chord quality types
export type TriadQuality = 'major' | 'minor' | 'diminished' | 'augmented';
// Extended chord qualities (7ths and 6ths)
export type SeventhQuality = 'maj7' | 'min7' | 'dom7' | 'minMaj7' | 'halfDim7' | 'dim7' | 'augMaj7' | '6' | 'm6';
export type ChordQuality = TriadQuality | SeventhQuality;

// A path point inside a triangle (chord)
// Can be upgraded to 7th chord via double-click wheel
export interface TrianglePathPoint {
  rootCell: GridCell;
  type: 'major' | 'minor';
  rootPC: PitchClass;
  pitchClasses: [PitchClass, PitchClass, PitchClass];
  midiPitches: [number, number, number]; // Absolute MIDI note numbers based on grid position
  // Optional 7th chord upgrade
  seventhQuality?: SeventhQuality;
  seventhPitchClass?: PitchClass;  // The added 7th tone
  seventhMidiPitch?: number;       // MIDI pitch of the 7th
}

// A more general chord path point that supports triads and 7th chords
export interface ChordPathPoint {
  rootCell: GridCell;
  quality: ChordQuality;
  rootPC: PitchClass;
  pitchClasses: PitchClass[];  // 3 for triads, 4 for 7ths
  midiPitches: number[];       // Absolute MIDI note numbers
}

export interface TrianglePath {
  id: string;
  name: string;
  points: TrianglePathPoint[];
  color: string;
}

// Legacy - keeping for compatibility
export interface LatticePathPoint {
  cell: GridCell;
  pc: PitchClass;
}

export interface LatticePath {
  id: string;
  name: string;
  points: LatticePathPoint[];
  color: string;
}

// Application settings
export interface AppSettings {
  labelMode: LabelMode;
  keyCenter: PitchClass;
  preferSharps: boolean;
  showTriangles: boolean;
  showPatchBoundaries: boolean;
  showMajorTriangles: boolean;
  showMinorTriangles: boolean;
  showGridLines: boolean;
}

// Chord wheel state for upgrading triads to 7th chords
export interface ChordWheelState {
  visible: boolean;
  pathIndex: number;  // Index of the chord being edited in currentPath
  position: Point;    // Screen position to show the wheel
  hoveredPreview?: SeventhQuality;  // Preview quality on hover (before clicking)
}

// Full application state
export interface AppState {
  camera: Camera;
  settings: AppSettings;
  currentPath: TrianglePathPoint[];
  savedPaths: TrianglePath[];
  hoveredCell: GridCell | null;
  hoveredTriangle: { rootCell: GridCell; type: 'major' | 'minor' } | null;
  isPlaying: boolean;
  tempo: number; // BPM
  playingIndex: number; // Currently playing chord index (-1 if not playing)
  chordWheel: ChordWheelState | null; // State for 7th chord selection wheel
}

// Default values
export const DEFAULT_SETTINGS: AppSettings = {
  labelMode: 'notes',
  keyCenter: 0,
  preferSharps: true,
  showTriangles: true,
  showPatchBoundaries: false,
  showMajorTriangles: true,
  showMinorTriangles: true,
  showGridLines: false,
};

export const DEFAULT_CAMERA: Camera = {
  x: 0,
  y: 0,
  zoom: 1.5,
  tilt: 64,
  rotation: 32,
};

// Constants
export const CELL_SIZE = 60; // Base cell size in pixels
export const MIN_ZOOM = 0.6;
export const MAX_ZOOM = 4;
export const PATCH_ROWS = 4; // Rows in a fundamental patch
export const PATCH_COLS = 3; // Cols in a fundamental patch

// MIDI range constants (88 piano keys)
export const MIDI_PIANO_MIN = 21;   // A0 - lowest piano key
export const MIDI_PIANO_MAX = 108;  // C8 - highest piano key
export const MIDI_DEFAULT_MIN = 21; // A0 - full piano range
export const MIDI_DEFAULT_MAX = 108; // C8 - full piano range

export interface MidiRange {
  min: number;
  max: number;
}

export const DEFAULT_MIDI_RANGE: MidiRange = {
  min: MIDI_DEFAULT_MIN,
  max: MIDI_DEFAULT_MAX,
};

