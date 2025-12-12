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

// Camera state for pan/zoom
export interface Camera {
  x: number; // center x in world coords
  y: number; // center y in world coords
  zoom: number; // scale factor
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

// A path point inside a triangle (chord)
export interface TrianglePathPoint {
  rootCell: GridCell;
  type: 'major' | 'minor';
  rootPC: PitchClass;
  pitchClasses: [PitchClass, PitchClass, PitchClass];
  midiPitches: [number, number, number]; // Absolute MIDI note numbers based on grid position
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
}

// Default values
export const DEFAULT_SETTINGS: AppSettings = {
  labelMode: 'notes',
  keyCenter: 0,
  preferSharps: true,
  showTriangles: true,
  showPatchBoundaries: true,
  showMajorTriangles: true,
  showMinorTriangles: true,
};

export const DEFAULT_CAMERA: Camera = {
  x: 0,
  y: 0,
  zoom: 1.5,
};

// Constants
export const CELL_SIZE = 60; // Base cell size in pixels
export const MIN_ZOOM = 0.6;
export const MAX_ZOOM = 4;
export const PATCH_ROWS = 4; // Rows in a fundamental patch
export const PATCH_COLS = 3; // Cols in a fundamental patch
