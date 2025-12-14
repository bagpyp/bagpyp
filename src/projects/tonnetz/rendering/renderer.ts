import type {
  Camera,
  GridCell,
  AppSettings,
  TrianglePathPoint,
  Triangle,
  Point,
  ChordWheelState,
} from '../state/types';
import {
  MIDI_PIANO_MIN,
  MIDI_PIANO_MAX,
} from '../state/types';
import {
  getVisibleRange,
  gridToPC,
  gridToPitch,
  worldToScreen,
  cellToWorld,
  isRowPatchBoundary,
  isColPatchBoundary,
} from '../core/lattice';
import { getLabel, getTriangleLabel } from '../core/musicMath';
import { getMajorTriangle, getMinorTriangle, triangleCenter } from '../core/triads';
import {
  decomposeSeventhChord,
  getSeventhChordName,
  getGridCellForInterval,
  type SeventhChordDecomposition,
  type SeventhQuality,
  CHORD_INTERVALS,
} from '../core/seventhChords';
import { SEVENTH_QUALITY_COLORS } from '../components/ChordWheel';
import type { PitchClass } from '../state/types';

/**
 * Check if a pitch class corresponds to a white piano key
 * White keys: C(0), D(2), E(4), F(5), G(7), A(9), B(11)
 * Black keys: C#/Db(1), D#/Eb(3), F#/Gb(6), G#/Ab(8), A#/Bb(10)
 */
function isWhiteKey(pc: number): boolean {
  return [0, 2, 4, 5, 7, 9, 11].includes(pc % 12);
}

/**
 * Convert hex color to rgba with specified alpha
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get colors for a chord based on type and optional 7th quality
 */
function getChordColors(
  type: 'major' | 'minor',
  seventhQuality: SeventhQuality | undefined,
  isPlaying: boolean
): { fill: string; stroke: string; wall: string; pole: string; label: string; glow: string } {
  if (seventhQuality) {
    const baseColor = SEVENTH_QUALITY_COLORS[seventhQuality];
    return {
      fill: isPlaying ? hexToRgba(baseColor, 0.95) : hexToRgba(baseColor, 0.75),
      stroke: isPlaying ? hexToRgba(baseColor, 1) : hexToRgba(baseColor, 0.9),
      wall: hexToRgba(baseColor, 0.08),
      pole: hexToRgba(baseColor, 0.4),
      label: hexToRgba(baseColor, 1),
      glow: hexToRgba(baseColor, 0.8),
    };
  }

  // Default major/minor colors
  const isMajor = type === 'major';
  return {
    fill: isPlaying
      ? (isMajor ? 'rgba(180, 255, 180, 0.95)' : 'rgba(180, 210, 255, 0.95)')
      : (isMajor ? 'rgba(100, 200, 100, 0.85)' : 'rgba(100, 150, 255, 0.85)'),
    stroke: isPlaying
      ? (isMajor ? 'rgba(100, 255, 100, 1)' : 'rgba(100, 180, 255, 1)')
      : (isMajor ? 'rgba(60, 160, 60, 1)' : 'rgba(60, 110, 220, 1)'),
    wall: isMajor ? 'rgba(80, 160, 80, 0.08)' : 'rgba(80, 120, 200, 0.08)',
    pole: isMajor ? 'rgba(80, 160, 80, 0.4)' : 'rgba(80, 120, 200, 0.4)',
    label: isMajor ? '#1a5a1a' : '#1a3a7a',
    glow: isMajor ? 'rgba(100, 255, 100, 0.8)' : 'rgba(100, 180, 255, 0.8)',
  };
}

// Colors
const COLORS = {
  background: '#1a1a2e',
  gridLine: '#2d2d44',
  patchBoundary: '#4a4a6a',
  text: '#e0e0e0',
  majorTriangle: 'rgba(100, 200, 100, 0.15)',
  majorTriangleStroke: 'rgba(100, 200, 100, 0.4)',
  minorTriangle: 'rgba(100, 150, 255, 0.15)',
  minorTriangleStroke: 'rgba(100, 150, 255, 0.4)',
  majorHighlight: 'rgba(100, 200, 100, 0.5)',
  minorHighlight: 'rgba(100, 150, 255, 0.5)',
  // Seventh chord colors (distinct from triads)
  seventhChordFace: 'rgba(255, 180, 100, 0.35)',       // Warm orange for 7th chord composite faces
  seventhChordStroke: 'rgba(255, 160, 80, 0.7)',      // Orange stroke
  seventhTone: 'rgba(255, 220, 100, 0.9)',            // Golden yellow for added 7th tones
  seventhToneStroke: 'rgba(200, 160, 60, 1)',         // Darker gold stroke
  seventhLeg: 'rgba(255, 200, 100, 0.4)',             // Connector lines from 7th to triangle
  noFaceChord: 'rgba(200, 150, 255, 0.3)',            // Purple for no-face chords (dim7, aug)
  noFaceChordStroke: 'rgba(180, 130, 230, 0.7)',      // Purple stroke
};

// Grid boundaries: 3 patches in each direction from origin patch
// Origin patch: rows 0-3, cols 0-2
// PATCH_ROWS = 4, PATCH_COLS = 3
const GRID_BOUNDS = {
  minRow: -12,  // 3 patches up
  maxRow: 15,   // origin patch (0-3) + 3 patches down
  minCol: -9,   // 3 patches left
  maxCol: 11,   // origin patch (0-2) + 3 patches right
};

function clampRange(range: { minRow: number; maxRow: number; minCol: number; maxCol: number }) {
  return {
    minRow: Math.max(range.minRow, GRID_BOUNDS.minRow),
    maxRow: Math.min(range.maxRow, GRID_BOUNDS.maxRow),
    minCol: Math.max(range.minCol, GRID_BOUNDS.minCol),
    maxCol: Math.min(range.maxCol, GRID_BOUNDS.maxCol),
  };
}

/**
 * Check if a cell is within grid bounds
 */
export function isInBounds(row: number, col: number): boolean {
  return row >= GRID_BOUNDS.minRow && row <= GRID_BOUNDS.maxRow &&
         col >= GRID_BOUNDS.minCol && col <= GRID_BOUNDS.maxCol;
}

/**
 * Check if a cell's MIDI pitch is within the 88 piano keys (21-108)
 */
function isInPianoRange(row: number, col: number): boolean {
  const midi = gridToPitch(row, col);
  return midi >= MIDI_PIANO_MIN && midi <= MIDI_PIANO_MAX;
}

/**
 * Build a set of canonical cells - one cell per unique MIDI pitch
 * For each MIDI value 21-108, we pick the cell closest to the origin
 */
function buildCanonicalCells(): Set<string> {
  const midiToBestCell = new Map<number, { row: number; col: number; dist: number }>();

  // Search the full grid bounds for all cells in piano range
  for (let row = GRID_BOUNDS.minRow; row <= GRID_BOUNDS.maxRow; row++) {
    for (let col = GRID_BOUNDS.minCol; col <= GRID_BOUNDS.maxCol; col++) {
      if (!isInPianoRange(row, col)) continue;
      const midi = gridToPitch(row, col);

      const dist = Math.abs(row) + Math.abs(col); // Manhattan distance from origin
      const existing = midiToBestCell.get(midi);

      if (!existing || dist < existing.dist) {
        midiToBestCell.set(midi, { row, col, dist });
      }
    }
  }

  // Convert to set of "row,col" keys
  const canonicalCells = new Set<string>();
  for (const { row, col } of midiToBestCell.values()) {
    canonicalCells.add(`${row},${col}`);
  }

  return canonicalCells;
}

// Cache the canonical cells (computed once)
const CANONICAL_CELLS = buildCanonicalCells();
console.log(`Canonical cells: ${CANONICAL_CELLS.size} (expected 88)`);

/**
 * Check if a cell is the canonical cell for its MIDI pitch
 * (i.e., it's the one we should display, not a duplicate)
 */
function isCanonicalCell(row: number, col: number): boolean {
  return CANONICAL_CELLS.has(`${row},${col}`);
}

/**
 * Check if a cell is visible (canonical cell within piano range)
 */
function isCellVisible(row: number, col: number): boolean {
  return isInBounds(row, col) && isCanonicalCell(row, col);
}

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  camera: Camera;
  settings: AppSettings;
  hoveredCell: GridCell | null;
  hoveredTriangle: { rootCell: GridCell; type: 'major' | 'minor' } | null;
  currentPath: TrianglePathPoint[];
  cellSize: number;
  playingIndex: number;
  chordWheel: ChordWheelState | null;
}

/**
 * Main render function - draws the entire Tonnetz visualization
 */
export function render(rc: RenderContext): void {
  const { ctx, width, height, camera } = rc;
  const tiltAngle = camera.tilt;
  const rotationAngle = camera.rotation;
  const tiltRad = (tiltAngle * Math.PI) / 180;
  const rotRad = (rotationAngle * Math.PI) / 180;
  const cosT = Math.cos(tiltRad);

  // Clear canvas
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, width, height);

  // Get visible range, clamped to grid boundaries
  const visibleRange = getVisibleRange(rc.camera, width, height, rc.cellSize);
  const range = clampRange(visibleRange);

  // When tilted, draw triangles with 3D projection (flat at z=0)
  if (tiltAngle > 0) {
    drawTriangles(rc, range);
    drawHoveredTriangle(rc);
  }

  // Apply tilt and rotation transforms for flat elements (labels, grid lines)
  // Canvas transforms apply in reverse order, so to get rotate-then-tilt
  // on points, we call scale (tilt) first, then rotate
  ctx.save();
  ctx.translate(width / 2, height / 2);
  if (tiltAngle > 0) {
    ctx.scale(1, cosT);
  }
  if (rotationAngle !== 0) {
    ctx.rotate(rotRad);
  }
  ctx.translate(-width / 2, -height / 2);

  // Draw layers in order (all at z=0, so just scaled)
  drawPatchBoundaries(rc, range);
  // Draw triangles flat when not tilted
  if (tiltAngle === 0) {
    drawTriangles(rc, range);
    drawHoveredTriangle(rc);
  }
  drawGridLines(rc, range);
  drawCells(rc, range);

  ctx.restore();

  // Draw path with full 3D projection (has z > 0 for raised triangles)
  drawPath(rc);
}

/**
 * Draw patch boundaries (every 4 rows, 3 cols)
 */
function drawPatchBoundaries(
  rc: RenderContext,
  range: { minRow: number; maxRow: number; minCol: number; maxCol: number }
): void {
  if (!rc.settings.showPatchBoundaries) return;

  const { ctx, width, height, camera, cellSize } = rc;

  // Calculate screen bounds of the grid
  const gridTopWorld = GRID_BOUNDS.minRow * cellSize;
  const gridBottomWorld = (GRID_BOUNDS.maxRow + 1) * cellSize;
  const gridLeftWorld = GRID_BOUNDS.minCol * cellSize;
  const gridRightWorld = (GRID_BOUNDS.maxCol + 1) * cellSize;

  const gridTop = (gridTopWorld - camera.y) * camera.zoom + height / 2;
  const gridBottom = (gridBottomWorld - camera.y) * camera.zoom + height / 2;
  const gridLeft = (gridLeftWorld - camera.x) * camera.zoom + width / 2;
  const gridRight = (gridRightWorld - camera.x) * camera.zoom + width / 2;

  ctx.strokeStyle = COLORS.patchBoundary;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);

  // Vertical lines (every PATCH_COLS columns, clipped to grid)
  for (let col = range.minCol; col <= range.maxCol; col++) {
    if (isColPatchBoundary(col)) {
      const worldX = col * cellSize;
      const screenX = (worldX - camera.x) * camera.zoom + width / 2;

      ctx.beginPath();
      ctx.moveTo(screenX, Math.max(0, gridTop));
      ctx.lineTo(screenX, Math.min(height, gridBottom));
      ctx.stroke();
    }
  }

  // Horizontal lines (every PATCH_ROWS rows, clipped to grid)
  for (let row = range.minRow; row <= range.maxRow; row++) {
    if (isRowPatchBoundary(row)) {
      const worldY = row * cellSize;
      const screenY = (worldY - camera.y) * camera.zoom + height / 2;

      ctx.beginPath();
      ctx.moveTo(Math.max(0, gridLeft), screenY);
      ctx.lineTo(Math.min(width, gridRight), screenY);
      ctx.stroke();
    }
  }

  ctx.setLineDash([]);
}

/**
 * Get grayscale color based on path position (dark to light)
 */
function getPathGrayscale(position: number, total: number): { fill: string; lightness: number } {
  const t = total === 1 ? 1 : position / (total - 1); // 0 to 1
  const lightness = 25 + t * 55; // 25% to 80%
  return {
    fill: `hsl(0, 0%, ${lightness}%)`,
    lightness,
  };
}

/**
 * Draw triangles for triads
 */
function drawTriangles(
  rc: RenderContext,
  range: { minRow: number; maxRow: number; minCol: number; maxCol: number }
): void {
  if (!rc.settings.showTriangles) return;

  const { ctx, width, height, camera, cellSize, settings, currentPath } = rc;

  // Build path map for checking if triangles are in the path and getting their 7th quality
  const pathMap = new Map<string, SeventhQuality | undefined>();
  // Also track "secondary triangles" that are part of parallelograms
  // These should be drawn with the same color as their parent chord
  const secondaryTriangles = new Map<string, SeventhQuality>();

  for (const p of currentPath) {
    const key = `${p.rootCell.row},${p.rootCell.col},${p.type}`;
    // Only store if not already present (first occurrence wins for color)
    if (!pathMap.has(key)) {
      pathMap.set(key, p.seventhQuality);
    }

    // For parallelogram chords, also mark the secondary triangle
    // maj7 on major: secondary is minor triangle rooted at the 3rd (interval 4)
    // m7 on minor: secondary is major triangle rooted at the 3rd (interval 3)
    const isParallelogram = p.seventhQuality && (
      (p.seventhQuality === 'maj7' && p.type === 'major') ||
      (p.seventhQuality === 'min7' && p.type === 'minor')
    );
    if (isParallelogram && p.seventhQuality) {
      // Get the 3rd's grid cell (this is the root of the secondary triangle)
      const thirdInterval = p.type === 'major' ? 4 : 3;
      const thirdCell = getGridCellForInterval(p.rootCell, thirdInterval);
      // Secondary triangle type is opposite of base
      const secondaryType = p.type === 'major' ? 'minor' : 'major';
      const secondaryKey = `${thirdCell.row},${thirdCell.col},${secondaryType}`;
      secondaryTriangles.set(secondaryKey, p.seventhQuality);
    }
  }

  for (let row = range.minRow; row <= range.maxRow; row++) {
    for (let col = range.minCol; col <= range.maxCol; col++) {
      // Skip cells outside the 88 piano keys
      if (!isCellVisible(row, col)) continue;

      const cell: GridCell = { row, col };
      const rootPC = gridToPC(row, col);

      // Major triangle - check all 3 vertices are canonical (unique MIDI in piano range)
      if (settings.showMajorTriangles) {
        const majorVerts = getTriangleGridVertices(cell, 'major');
        const allVertsCanonical = majorVerts.every(v => isCanonicalCell(v.row, v.col));
        if (allVertsCanonical) {
          const major = getMajorTriangle(cell, cellSize);
          const key = `${row},${col},major`;
          const isInPath = pathMap.has(key);
          // Check if this is a secondary triangle (part of a parallelogram)
          const isSecondary = secondaryTriangles.has(key);
          const seventhQuality = pathMap.get(key) ?? (isSecondary ? secondaryTriangles.get(key) : undefined);
          drawTriangle(ctx, major, camera, width, height, 'major', rootPC, settings, isInPath || isSecondary, seventhQuality, cell);
        }
      }

      // Minor triangle - check all 3 vertices are canonical (unique MIDI in piano range)
      if (settings.showMinorTriangles) {
        const minorVerts = getTriangleGridVertices(cell, 'minor');
        const allVertsCanonical = minorVerts.every(v => isCanonicalCell(v.row, v.col));
        if (allVertsCanonical) {
          const minor = getMinorTriangle(cell, cellSize);
          const key = `${row},${col},minor`;
          const isInPath = pathMap.has(key);
          // Check if this is a secondary triangle (part of a parallelogram)
          const isSecondary = secondaryTriangles.has(key);
          const seventhQuality = pathMap.get(key) ?? (isSecondary ? secondaryTriangles.get(key) : undefined);
          drawTriangle(ctx, minor, camera, width, height, 'minor', rootPC, settings, isInPath || isSecondary, seventhQuality, cell);
        }
      }
    }
  }
}

/**
 * Draw a single triangle with label based on settings
 * Path triangles use quality-specific colors (7th chord colors when applicable)
 * All base plane triangles are flat at z=0
 */
function drawTriangle(
  ctx: CanvasRenderingContext2D,
  triangle: Triangle,
  camera: Camera,
  width: number,
  height: number,
  type: 'major' | 'minor',
  rootPC: number,
  settings: AppSettings,
  isInPath: boolean,
  seventhQuality?: SeventhQuality,
  _rootCell?: GridCell
): void {
  const tiltAngle = camera.tilt;

  // Get screen vertices - all flat at z=0
  let v1: Point, v2: Point, v3: Point;

  if (tiltAngle > 0) {
    // Project each vertex at z=0 (flat plane)
    [v1, v2, v3] = triangle.vertices.map((worldV) => {
      return project3D(worldV.x, worldV.y, 0, tiltAngle, camera, width, height);
    });
  } else {
    // Flat projection (no tilt)
    [v1, v2, v3] = triangle.vertices.map((v) =>
      worldToScreen(v, camera, width, height)
    );
  }

  ctx.beginPath();
  ctx.moveTo(v1.x, v1.y);
  ctx.lineTo(v2.x, v2.y);
  ctx.lineTo(v3.x, v3.y);
  ctx.closePath();

  // Determine colors based on path status and 7th quality
  let fillColor: string;
  let strokeColor: string;
  let labelColor: string;

  if (isInPath && seventhQuality) {
    // Use quality-specific color for 7th chords in path
    const baseColor = SEVENTH_QUALITY_COLORS[seventhQuality];
    fillColor = hexToRgba(baseColor, 0.45);
    strokeColor = hexToRgba(baseColor, 0.9);
    labelColor = baseColor;
  } else if (isInPath) {
    // Use highlighted major/minor colors for triads in path
    fillColor = type === 'major' ? 'rgba(100, 200, 100, 0.4)' : 'rgba(100, 150, 255, 0.4)';
    strokeColor = type === 'major' ? 'rgba(60, 160, 60, 0.8)' : 'rgba(60, 110, 220, 0.8)';
    labelColor = type === 'major' ? 'rgba(100, 220, 100, 0.9)' : 'rgba(100, 150, 255, 0.9)';
  } else {
    // Default colors for non-path triangles
    fillColor = type === 'major' ? COLORS.majorTriangle : COLORS.minorTriangle;
    strokeColor = type === 'major' ? COLORS.majorTriangleStroke : COLORS.minorTriangleStroke;
    labelColor = type === 'major' ? 'rgba(100, 220, 100, 0.9)' : 'rgba(100, 150, 255, 0.9)';
  }

  // Fill
  ctx.fillStyle = fillColor;
  ctx.fill();

  // Stroke
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = isInPath ? 2 : 1;
  ctx.stroke();

  // Draw label at triangle center
  const centerX = (v1.x + v2.x + v3.x) / 3;
  const centerY = (v1.y + v2.y + v3.y) / 3;

  // Only draw label if triangle is large enough
  const edge1 = Math.hypot(v2.x - v1.x, v2.y - v1.y);
  const edge2 = Math.hypot(v3.x - v2.x, v3.y - v2.y);
  const triangleSize = Math.max(edge1, edge2);
  if (triangleSize > 25) {
    const label = getTriangleLabel(
      rootPC as 0,
      type,
      settings.labelMode,
      settings.keyCenter,
      settings.preferSharps
    );
    // Chord labels: larger and bolder than tone labels
    const fontSize = Math.min(Math.max(11, triangleSize * 0.26), 16);

    ctx.save();
    ctx.translate(centerX, centerY);
    // When tilted, labels are drawn outside the canvas transform block,
    // so we need to manually apply both tilt (scale) and rotation
    if (tiltAngle > 0) {
      const tiltRad = (tiltAngle * Math.PI) / 180;
      const rotRad = (camera.rotation * Math.PI) / 180;
      // Apply same transforms as canvas: scale then rotate
      ctx.scale(1, Math.cos(tiltRad));
      ctx.rotate(rotRad);
    }
    ctx.font = `700 ${fontSize}px "Palatino", "Book Antiqua", Georgia, serif`;
    ctx.fillStyle = labelColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 0);
    ctx.restore();
  }
}

/**
 * Draw grid lines
 */
function drawGridLines(
  rc: RenderContext,
  range: { minRow: number; maxRow: number; minCol: number; maxCol: number }
): void {
  if (!rc.settings.showGridLines) return;

  const { ctx, width, height, camera, cellSize } = rc;

  // Calculate screen bounds of the grid
  const gridTopWorld = GRID_BOUNDS.minRow * cellSize;
  const gridBottomWorld = (GRID_BOUNDS.maxRow + 1) * cellSize;
  const gridLeftWorld = GRID_BOUNDS.minCol * cellSize;
  const gridRightWorld = (GRID_BOUNDS.maxCol + 1) * cellSize;

  const gridTop = (gridTopWorld - camera.y) * camera.zoom + height / 2;
  const gridBottom = (gridBottomWorld - camera.y) * camera.zoom + height / 2;
  const gridLeft = (gridLeftWorld - camera.x) * camera.zoom + width / 2;
  const gridRight = (gridRightWorld - camera.x) * camera.zoom + width / 2;

  ctx.strokeStyle = COLORS.gridLine;
  ctx.lineWidth = 1;

  // Vertical lines (clipped to grid bounds)
  for (let col = range.minCol; col <= range.maxCol + 1; col++) {
    const worldX = col * cellSize;
    const screenX = (worldX - camera.x) * camera.zoom + width / 2;

    ctx.beginPath();
    ctx.moveTo(screenX, Math.max(0, gridTop));
    ctx.lineTo(screenX, Math.min(height, gridBottom));
    ctx.stroke();
  }

  // Horizontal lines (clipped to grid bounds)
  for (let row = range.minRow; row <= range.maxRow + 1; row++) {
    const worldY = row * cellSize;
    const screenY = (worldY - camera.y) * camera.zoom + height / 2;

    ctx.beginPath();
    ctx.moveTo(Math.max(0, gridLeft), screenY);
    ctx.lineTo(Math.min(width, gridRight), screenY);
    ctx.stroke();
  }

  // Draw grid boundary border
  ctx.strokeStyle = '#666688';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.rect(gridLeft, gridTop, gridRight - gridLeft, gridBottom - gridTop);
  ctx.stroke();
}

/**
 * Draw a tone node with neon/translucent aesthetic
 * Matches the tron-esque style of the rest of the UI
 * Ivory (white keys) = warm white/gold, solid enough to cover triangle vertices
 * Ebony (black keys) = dark, nearly opaque
 */
function drawToneNode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  isWhite: boolean,
  isMiddleC: boolean,
  isC: boolean
): void {
  // Subtle glow effect - smaller and more subtle
  const glowRadius = radius * 1.4;
  const glowGradient = ctx.createRadialGradient(x, y, radius * 0.6, x, y, glowRadius);

  if (isWhite) {
    if (isMiddleC) {
      glowGradient.addColorStop(0, 'rgba(255, 215, 100, 0.25)');
      glowGradient.addColorStop(1, 'rgba(255, 180, 60, 0)');
    } else if (isC) {
      glowGradient.addColorStop(0, 'rgba(255, 230, 150, 0.2)');
      glowGradient.addColorStop(1, 'rgba(255, 210, 100, 0)');
    } else {
      glowGradient.addColorStop(0, 'rgba(220, 215, 200, 0.15)');
      glowGradient.addColorStop(1, 'rgba(200, 195, 180, 0)');
    }
  } else {
    // Minimal glow for ebony
    glowGradient.addColorStop(0, 'rgba(40, 45, 55, 0.2)');
    glowGradient.addColorStop(1, 'rgba(30, 35, 45, 0)');
  }

  ctx.beginPath();
  ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
  ctx.fillStyle = glowGradient;
  ctx.fill();

  // Main node - more opaque to cover triangle vertices
  const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

  if (isWhite) {
    if (isMiddleC) {
      // Golden core - solid
      coreGradient.addColorStop(0, 'rgba(255, 240, 190, 0.95)');
      coreGradient.addColorStop(0.6, 'rgba(255, 220, 140, 0.9)');
      coreGradient.addColorStop(1, 'rgba(240, 200, 110, 0.85)');
    } else if (isC) {
      coreGradient.addColorStop(0, 'rgba(255, 252, 235, 0.92)');
      coreGradient.addColorStop(0.6, 'rgba(250, 245, 210, 0.88)');
      coreGradient.addColorStop(1, 'rgba(240, 230, 190, 0.82)');
    } else {
      // Warm white - solid enough to cover
      coreGradient.addColorStop(0, 'rgba(250, 248, 242, 0.9)');
      coreGradient.addColorStop(0.6, 'rgba(240, 236, 228, 0.85)');
      coreGradient.addColorStop(1, 'rgba(225, 220, 210, 0.8)');
    }
  } else {
    // Ebony - much darker and more opaque
    coreGradient.addColorStop(0, 'rgba(35, 38, 45, 0.95)');
    coreGradient.addColorStop(0.5, 'rgba(25, 28, 35, 0.92)');
    coreGradient.addColorStop(1, 'rgba(18, 20, 26, 0.9)');
  }

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = coreGradient;
  ctx.fill();

  // Edge stroke
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  if (isWhite) {
    if (isMiddleC) {
      ctx.strokeStyle = 'rgba(220, 180, 80, 0.8)';
    } else if (isC) {
      ctx.strokeStyle = 'rgba(210, 200, 140, 0.7)';
    } else {
      ctx.strokeStyle = 'rgba(180, 175, 165, 0.6)';
    }
  } else {
    ctx.strokeStyle = 'rgba(60, 65, 80, 0.7)';
  }
  ctx.lineWidth = 1;
  ctx.stroke();
}

/**
 * Draw cells with labels
 */
// Track cell count for debugging (only count once per render)
let lastCellCount = 0;

function drawCells(
  rc: RenderContext,
  range: { minRow: number; maxRow: number; minCol: number; maxCol: number }
): void {
  const { ctx, width, height, camera, cellSize, settings } = rc;

  let cellCount = 0;
  for (let row = range.minRow; row <= range.maxRow; row++) {
    for (let col = range.minCol; col <= range.maxCol; col++) {
      // Skip cells outside the 88 piano keys
      if (!isCellVisible(row, col)) continue;
      cellCount++;

      const cell: GridCell = { row, col };
      const pc = gridToPC(row, col);
      const center = cellToWorld(cell, cellSize);
      const screenCenter = worldToScreen(center, camera, width, height);

      const isMiddleC = row === 0 && col === 0;
      const isC = pc === 0;
      const isWhite = isWhiteKey(pc);

      // Draw neon tone node for each cell
      const effectiveSize = cellSize * camera.zoom;
      // Node radius - balanced size
      const nodeRadius = Math.min(Math.max(6, effectiveSize * 0.21), 16);

      drawToneNode(ctx, screenCenter.x, screenCenter.y, nodeRadius, isWhite, isMiddleC, isC);

      // Draw label if zoom is sufficient
      if (effectiveSize > 30) {
        const label = getLabel(
          pc,
          settings.labelMode,
          settings.keyCenter,
          settings.preferSharps
        );

        // Tone labels - elegant music-theory font
        const fontSize = Math.min(Math.max(8, effectiveSize * 0.13), 13);
        const middleCFontSize = Math.round(fontSize * 1.1);

        // Use classic serif font for music theory feel
        ctx.font = isMiddleC
          ? `600 ${middleCFontSize}px "Palatino", "Book Antiqua", Georgia, serif`
          : `500 ${fontSize}px "Palatino", "Book Antiqua", Georgia, serif`;

        // Text color: matches neon aesthetic
        if (isWhite) {
          ctx.fillStyle = isMiddleC ? 'rgba(90, 70, 30, 0.95)' : (isC ? 'rgba(100, 80, 40, 0.9)' : 'rgba(70, 65, 55, 0.85)');
        } else {
          ctx.fillStyle = 'rgba(180, 185, 195, 0.9)';
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, screenCenter.x, screenCenter.y);
      }
    }
  }

  // Debug: log cell count if it changed (should be 88 for full piano range)
  if (cellCount !== lastCellCount) {
    console.log(`Visible cells: ${cellCount} (expected 88 for full piano range)`);
    lastCellCount = cellCount;
  }
}

/**
 * Draw hovered triangle highlight
 */
function drawHoveredTriangle(rc: RenderContext): void {
  const { ctx, width, height, camera, cellSize, hoveredTriangle } = rc;
  if (!hoveredTriangle) return;

  // Don't draw if outside grid bounds or not a canonical cell
  const { row, col } = hoveredTriangle.rootCell;
  if (!isCellVisible(row, col)) return;

  // Also check that all triangle vertices are canonical (unique MIDI in piano range)
  const gridVerts = getTriangleGridVertices(hoveredTriangle.rootCell, hoveredTriangle.type);
  if (!gridVerts.every(v => isCanonicalCell(v.row, v.col))) return;

  const triangle = hoveredTriangle.type === 'major'
    ? getMajorTriangle(hoveredTriangle.rootCell, cellSize)
    : getMinorTriangle(hoveredTriangle.rootCell, cellSize);

  const tiltAngle = camera.tilt;

  // Use 3D projection at z=0 (flat plane) when tilted
  let verts: Point[];
  if (tiltAngle > 0) {
    verts = triangle.vertices.map((worldV) => {
      return project3D(worldV.x, worldV.y, 0, tiltAngle, camera, width, height);
    });
  } else {
    verts = triangle.vertices.map((v) => worldToScreen(v, camera, width, height));
  }

  ctx.beginPath();
  ctx.moveTo(verts[0].x, verts[0].y);
  ctx.lineTo(verts[1].x, verts[1].y);
  ctx.lineTo(verts[2].x, verts[2].y);
  ctx.closePath();

  ctx.fillStyle = hoveredTriangle.type === 'major' ? COLORS.majorHighlight : COLORS.minorHighlight;
  ctx.fill();

  ctx.strokeStyle = hoveredTriangle.type === 'major'
    ? 'rgba(100, 220, 100, 0.9)'
    : 'rgba(100, 150, 255, 0.9)';
  ctx.lineWidth = 3;
  ctx.stroke();
}

/**
 * Get world position of triangle center for a path point
 */
function getPathPointCenter(point: TrianglePathPoint, cellSize: number): Point {
  const triangle = point.type === 'major'
    ? getMajorTriangle(point.rootCell, cellSize)
    : getMinorTriangle(point.rootCell, cellSize);
  return triangleCenter(triangle);
}

/**
 * Create a unique key for a directed edge between two path points
 */
function directedEdgeKey(from: TrianglePathPoint, to: TrianglePathPoint): string {
  return `${from.rootCell.row},${from.rootCell.col},${from.type}→${to.rootCell.row},${to.rootCell.col},${to.type}`;
}

/**
 * Get the grid cell vertices of a triangle
 */
function getTriangleGridVertices(rootCell: GridCell, type: 'major' | 'minor'): [GridCell, GridCell, GridCell] {
  const { row, col } = rootCell;
  if (type === 'major') {
    // Major: (r,c), (r,c+1), (r+1,c+1)
    return [
      { row, col },
      { row, col: col + 1 },
      { row: row + 1, col: col + 1 },
    ];
  } else {
    // Minor: (r,c), (r+1,c), (r+1,c+1)
    return [
      { row, col },
      { row: row + 1, col },
      { row: row + 1, col: col + 1 },
    ];
  }
}

/**
 * Create a unique key for a vertex (grid cell)
 */
function vertexKey(cell: GridCell): string {
  return `${cell.row},${cell.col}`;
}

/**
 * Build a map from vertex key to first appearance info
 * Returns the index of the first chord that contains each vertex
 */
function buildVertexFirstAppearanceMap(
  path: TrianglePathPoint[]
): Map<string, { firstIndex: number; total: number }> {
  const map = new Map<string, { firstIndex: number; total: number }>();
  const total = path.length;

  path.forEach((point, chordIndex) => {
    const vertices = getTriangleGridVertices(point.rootCell, point.type);
    for (const v of vertices) {
      const key = vertexKey(v);
      if (!map.has(key)) {
        // First appearance of this vertex
        map.set(key, { firstIndex: chordIndex, total });
      }
    }
  });

  return map;
}

/**
 * Z-Layering System
 *
 * Chord staircase effect: Each chord in the progression is at a uniform height.
 * First chord is highest, last chord is lowest - creating a descending staircase.
 */

/**
 * Get chord-raise z component based on position in progression
 * First chord (index 0) has highest raise, last chord has lowest
 * This is the "staircase" effect - uniform raise for all vertices in a chord
 */
function getChordRaiseZ(chordIndex: number, total: number, baseHeight: number): number {
  const normalizedSteps = 10; // All paths span height equivalent to 10 steps
  const maxHeight = normalizedSteps * baseHeight;

  if (total === 1) return maxHeight; // Single chord at max height

  // Linear interpolation from maxHeight (first) to baseHeight (last)
  const t = chordIndex / (total - 1); // 0 to 1
  return maxHeight - t * (maxHeight - baseHeight);
}

/**
 * Legacy function for backward compatibility
 */
function getVertexHeight(chordIndex: number, total: number, baseHeight: number): number {
  return getChordRaiseZ(chordIndex, total, baseHeight);
}

/**
 * Project a 3D point to screen coordinates with tilt and rotation
 * Tilt rotates around the X axis, Rotation around the Z axis
 */
function project3D(
  worldX: number,
  worldY: number,
  worldZ: number,
  tiltAngle: number,
  camera: Camera,
  width: number,
  height: number
): Point {
  const tiltRad = (tiltAngle * Math.PI) / 180;
  const rotRad = (camera.rotation * Math.PI) / 180;
  const cosT = Math.cos(tiltRad);
  const sinT = Math.sin(tiltRad);
  const cosR = Math.cos(rotRad);
  const sinR = Math.sin(rotRad);

  // Translate to camera-centered coordinates
  const dx = worldX - camera.x;
  const dy = worldY - camera.y;

  // Apply rotation around Z axis (in XY plane)
  const rotX = dx * cosR - dy * sinR;
  const rotY = dx * sinR + dy * cosR;

  // Apply tilt rotation around X axis
  // y' = y * cos(θ) - z * sin(θ)
  const projectedY = rotY * cosT - worldZ * sinT;

  // Apply zoom and center on screen
  const screenX = rotX * camera.zoom + width / 2;
  const screenY = projectedY * camera.zoom + height / 2;

  return { x: screenX, y: screenY };
}

/**
 * Simple deterministic pseudo-random based on coordinates
 * Returns a value between -1 and 1
 */
function seededRandom(row: number, col: number, type: string, seed: number): number {
  const hash = Math.sin(row * 12.9898 + col * 78.233 + (type === 'major' ? 1 : 0) * 43.758 + seed * 93.9) * 43758.5453;
  return (hash - Math.floor(hash)) * 2 - 1;
}

/**
 * Draw the current path with 3D staircase effect when tilted
 *
 * At tilt = 0 (bird's eye): Draw bowed path lines with nodes
 * At tilt > 0: Draw 3D raised triangles + 3D path connecting centers
 *
 * Height model: First chord is highest, last chord is lowest
 * Color model: Vertices colored by their first appearance (repeated chords keep original color)
 */
function drawPath(rc: RenderContext): void {
  const { cellSize, currentPath, camera } = rc;

  if (currentPath.length === 0) return;

  const tiltAngle = camera.tilt;

  // Build vertex first-appearance map for color persistence
  const vertexMap = buildVertexFirstAppearanceMap(currentPath);

  // Base height unit for 3D staircase (in world units)
  const baseHeight = cellSize * 0.4;

  if (tiltAngle > 0) {
    // Draw 3D raised triangles
    draw3DPath(rc, vertexMap, baseHeight);
    // Draw 3D path connecting triangle centers
    draw3DPathLines(rc, baseHeight);
  } else {
    // Draw 2D path overlay (edges + nodes)
    draw2DPathOverlay(rc);
  }
}

/**
 * Draw the 3D raised triangles (staircase effect)
 * Each triangle is a flat platform at its chord-index height
 * Uses original major/minor colors so chords are identifiable
 * If a chord has seventhQuality, also draws the 7th tone
 * Supports preview of hovered 7th quality from chord wheel
 */
function draw3DPath(
  rc: RenderContext,
  _vertexMap: Map<string, { firstIndex: number; total: number }>,
  baseHeight: number
): void {
  const { ctx, width, height, camera, cellSize, currentPath, settings, playingIndex, chordWheel } = rc;
  const tiltAngle = camera.tilt;
  const total = currentPath.length;

  // Draw triangles from back (highest/first) to front (lowest/last) - painter's algorithm
  for (let chordIndex = 0; chordIndex < total; chordIndex++) {
    const point = currentPath[chordIndex];
    const gridVerts = getTriangleGridVertices(point.rootCell, point.type);
    const isPlaying = chordIndex === playingIndex;

    // Use preview quality if hovering over chord wheel, otherwise use actual quality
    const previewQuality = chordWheel?.pathIndex === chordIndex && chordWheel?.hoveredPreview
      ? chordWheel.hoveredPreview
      : undefined;
    const effectiveSeventhQuality = previewQuality ?? point.seventhQuality;
    const hasSeventh = !!effectiveSeventhQuality;

    // Determine if this 7th chord forms a parallelogram (two triangles sharing an edge)
    // maj7 on major triad = parallelogram (forms second minor triangle)
    // m7 on minor triad = parallelogram (forms second major triangle)
    const isParallelogram = hasSeventh && (
      (effectiveSeventhQuality === 'maj7' && point.type === 'major') ||
      (effectiveSeventhQuality === 'min7' && point.type === 'minor')
    );

    // Uniform z for all vertices in a chord (staircase effect)
    const chordZ = getChordRaiseZ(chordIndex, total, baseHeight);

    // Get colors based on chord type and 7th quality (use effective for preview)
    const colors = getChordColors(point.type, effectiveSeventhQuality, isPlaying);
    const fillColor = colors.fill;
    const strokeColor = colors.stroke;

    // Calculate all vertices (3 for triad, 4 for extended chord)
    let allGridVerts = [...gridVerts];
    if (hasSeventh && effectiveSeventhQuality) {
      // Interval from root for each extended chord quality (7ths and 6ths)
      const extendedIntervals: Record<SeventhQuality, number> = {
        maj7: 11, min7: 10, dom7: 10, minMaj7: 11, halfDim7: 10, dim7: 9, augMaj7: 11,
        '6': 9, 'm6': 9, // 6th chords add major 6th (9 semitones)
      };
      const extendedCell = getGridCellForInterval(point.rootCell, extendedIntervals[effectiveSeventhQuality]);
      allGridVerts.push(extendedCell);
    }

    const allVerts3D = allGridVerts.map((gv) => {
      const worldPos = cellToWorld(gv, cellSize);
      return { worldX: worldPos.x, worldY: worldPos.y, worldZ: chordZ };
    });

    const allScreenVerts = allVerts3D.map((v) =>
      project3D(v.worldX, v.worldY, v.worldZ, tiltAngle, camera, width, height)
    );

    // For parallelograms, draw a quadrilateral; otherwise draw triangle
    ctx.beginPath();
    if (isParallelogram && allScreenVerts.length === 4) {
      // Draw parallelogram: order vertices correctly for convex quadrilateral
      // For maj7: C(0), E(1), B(3), G(2) forms the parallelogram
      // For m7: C(0), Eb(1), Bb(3), G(2) forms the parallelogram
      ctx.moveTo(allScreenVerts[0].x, allScreenVerts[0].y);
      ctx.lineTo(allScreenVerts[1].x, allScreenVerts[1].y);
      ctx.lineTo(allScreenVerts[3].x, allScreenVerts[3].y);
      ctx.lineTo(allScreenVerts[2].x, allScreenVerts[2].y);
      ctx.closePath();
    } else {
      // Draw triangle (first 3 vertices)
      ctx.moveTo(allScreenVerts[0].x, allScreenVerts[0].y);
      ctx.lineTo(allScreenVerts[1].x, allScreenVerts[1].y);
      ctx.lineTo(allScreenVerts[2].x, allScreenVerts[2].y);
      ctx.closePath();
    }

    // Add glow effect for playing chord
    if (isPlaying) {
      ctx.shadowColor = colors.glow;
      ctx.shadowBlur = 20;
    }

    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = isPlaying ? 4 : 2;
    ctx.stroke();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Get ground points for all vertices
    const groundPoints = allVerts3D.map((v) =>
      project3D(v.worldX, v.worldY, 0, tiltAngle, camera, width, height)
    );

    // Determine vertex count for walls/poles/balls
    const vertexCount = isParallelogram ? 4 : 3;
    // Vertex order for drawing walls of parallelogram: 0→1→3→2→0
    const vertexOrder = isParallelogram ? [0, 1, 3, 2] : [0, 1, 2];

    // Draw shaded side surfaces (walls between raised shape and ground)
    ctx.fillStyle = colors.wall;
    for (let i = 0; i < vertexCount; i++) {
      const currIdx = vertexOrder[i];
      const nextIdx = vertexOrder[(i + 1) % vertexCount];
      ctx.beginPath();
      ctx.moveTo(allScreenVerts[currIdx].x, allScreenVerts[currIdx].y);
      ctx.lineTo(allScreenVerts[nextIdx].x, allScreenVerts[nextIdx].y);
      ctx.lineTo(groundPoints[nextIdx].x, groundPoints[nextIdx].y);
      ctx.lineTo(groundPoints[currIdx].x, groundPoints[currIdx].y);
      ctx.closePath();
      ctx.fill();
    }

    // Draw poles from each vertex to the ground
    ctx.strokeStyle = colors.pole;
    ctx.lineWidth = 2.5;
    for (let i = 0; i < vertexCount; i++) {
      ctx.beginPath();
      ctx.moveTo(allScreenVerts[i].x, allScreenVerts[i].y);
      ctx.lineTo(groundPoints[i].x, groundPoints[i].y);
      ctx.stroke();
    }

    // Draw balls at each vertex
    const vertexBallRadius = 4.5 * Math.sqrt(camera.zoom);
    for (let i = 0; i < vertexCount; i++) {
      if (isPlaying) {
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 10;
      }
      ctx.beginPath();
      ctx.arc(allScreenVerts[i].x, allScreenVerts[i].y, vertexBallRadius, 0, Math.PI * 2);
      ctx.fillStyle = colors.fill;
      ctx.fill();
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

    // For triangle+leg extended chords (dom7, mMaj7, 6, m6), draw the extra leg
    // Parallelograms already have all 4 vertices drawn above
    if (hasSeventh && effectiveSeventhQuality && !isParallelogram) {
      // Calculate extended interval from quality
      const extendedIntervals: Record<SeventhQuality, number> = {
        maj7: 11, min7: 10, dom7: 10, minMaj7: 11, halfDim7: 10, dim7: 9, augMaj7: 11,
        '6': 9, 'm6': 9,
      };
      const seventhInterval = extendedIntervals[effectiveSeventhQuality];
      const seventhCell = getGridCellForInterval(point.rootCell, seventhInterval);
      const seventhWorld = cellToWorld(seventhCell, cellSize);

      // Get the 5th (interval 7 from root) - this is where the 7th connects
      const fifthCell = getGridCellForInterval(point.rootCell, 7);
      const fifthWorld = cellToWorld(fifthCell, cellSize);

      // Project 7th tone and 5th at uniform chord z height
      const seventhScreen = project3D(seventhWorld.x, seventhWorld.y, chordZ, tiltAngle, camera, width, height);
      const seventhGround = project3D(seventhWorld.x, seventhWorld.y, 0, tiltAngle, camera, width, height);
      const fifthScreen = project3D(fifthWorld.x, fifthWorld.y, chordZ, tiltAngle, camera, width, height);

      // Draw single connecting line from 5th to 7th (stacked thirds)
      ctx.strokeStyle = hexToRgba(SEVENTH_QUALITY_COLORS[effectiveSeventhQuality], 0.6);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(fifthScreen.x, fifthScreen.y);
      ctx.lineTo(seventhScreen.x, seventhScreen.y);
      ctx.stroke();

      // Draw pole for 7th tone
      ctx.strokeStyle = colors.pole;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(seventhScreen.x, seventhScreen.y);
      ctx.lineTo(seventhGround.x, seventhGround.y);
      ctx.stroke();

      // Draw 7th tone circle
      if (isPlaying) {
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 15;
      }
      ctx.beginPath();
      ctx.arc(seventhScreen.x, seventhScreen.y, 4.5 * Math.sqrt(camera.zoom), 0, Math.PI * 2);
      ctx.fillStyle = isPlaying ? hexToRgba(SEVENTH_QUALITY_COLORS[effectiveSeventhQuality], 1) : hexToRgba(SEVENTH_QUALITY_COLORS[effectiveSeventhQuality], 0.9);
      ctx.fill();
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

    // Draw label at shape center with rotation to match plane
    // For parallelograms, use all 4 vertices for center; for triangles, use 3
    const centerX = isParallelogram
      ? (allScreenVerts[0].x + allScreenVerts[1].x + allScreenVerts[2].x + allScreenVerts[3].x) / 4
      : (allScreenVerts[0].x + allScreenVerts[1].x + allScreenVerts[2].x) / 3;
    const centerY = isParallelogram
      ? (allScreenVerts[0].y + allScreenVerts[1].y + allScreenVerts[2].y + allScreenVerts[3].y) / 4
      : (allScreenVerts[0].y + allScreenVerts[1].y + allScreenVerts[2].y) / 3;

    // Calculate shape size to determine if label fits
    const edge1 = Math.hypot(allScreenVerts[1].x - allScreenVerts[0].x, allScreenVerts[1].y - allScreenVerts[0].y);
    if (edge1 > 20) {
      // Use 7th chord label if upgraded or previewing
      let label: string;
      if (hasSeventh && effectiveSeventhQuality) {
        label = getSeventhChordName(point.rootPC, effectiveSeventhQuality, settings.preferSharps);
      } else {
        label = getTriangleLabel(
          point.rootPC,
          point.type,
          settings.labelMode,
          settings.keyCenter,
          settings.preferSharps
        );
      }

      // Chord labels - elegant music-theory font
      const fontSize = Math.min(Math.max(10, edge1 * 0.24), 14);

      ctx.save();
      ctx.translate(centerX, centerY);
      // Apply both tilt (scale) and rotation to match the plane
      const tiltRad = (tiltAngle * Math.PI) / 180;
      const rotRad = (camera.rotation * Math.PI) / 180;
      ctx.scale(1, Math.cos(tiltRad));
      ctx.rotate(rotRad);

      ctx.font = `700 ${fontSize}px "Palatino", "Book Antiqua", Georgia, serif`;
      // Use contrasting color for readability
      ctx.fillStyle = hasSeventh ? '#1a1a1a' : colors.label;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 0, 0);
      ctx.restore();
    }
  }
}

/**
 * Draw 3D path lines connecting triangle centers at their heights
 */
function draw3DPathLines(rc: RenderContext, baseHeight: number): void {
  const { ctx, width, height, camera, cellSize, currentPath } = rc;
  const tiltAngle = camera.tilt;
  const total = currentPath.length;

  if (total < 1) return;

  // Calculate 3D positions for each triangle center
  const points3D = currentPath.map((point, i) => {
    const worldCenter = getPathPointCenter(point, cellSize);
    const z = getVertexHeight(i, total, baseHeight);
    return { worldX: worldCenter.x, worldY: worldCenter.y, worldZ: z, index: i };
  });

  // Project to screen
  const screenPoints = points3D.map((p) =>
    project3D(p.worldX, p.worldY, p.worldZ, tiltAngle, camera, width, height)
  );

  ctx.lineCap = 'round';

  // Draw edges
  if (total >= 2) {
    for (let i = 0; i < screenPoints.length - 1; i++) {
      const start = screenPoints[i];
      const end = screenPoints[i + 1];

      // Get color for this edge (based on destination node)
      const destGray = getPathGrayscale(i + 1, total);
      const borderGray = destGray.lightness > 50 ? 20 : 80;

      // Draw border stroke
      ctx.strokeStyle = `hsl(0, 0%, ${borderGray}%)`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      // Draw main stroke
      ctx.strokeStyle = destGray.fill;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
  }

  // Draw nodes
  for (let i = 0; i < screenPoints.length; i++) {
    const { fill, lightness } = getPathGrayscale(i, total);
    const borderColor = lightness > 50 ? 'hsl(0, 0%, 15%)' : 'hsl(0, 0%, 85%)';
    const radius = 5;

    ctx.beginPath();
    ctx.arc(screenPoints[i].x, screenPoints[i].y, radius, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Draw numbers on nodes
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = Math.max(7, Math.min(10, 7 * Math.sqrt(camera.zoom)));
  ctx.font = `600 ${fontSize}px "Palatino", Georgia, serif`;

  for (let i = 0; i < screenPoints.length; i++) {
    const { lightness } = getPathGrayscale(i, total);
    ctx.fillStyle = lightness > 50 ? 'hsl(0, 0%, 5%)' : 'hsl(0, 0%, 95%)';
    ctx.fillText(String(i + 1), screenPoints[i].x, screenPoints[i].y);
  }
}

/**
 * Draw the 2D path overlay (edges + nodes with bowed curves)
 */
function draw2DPathOverlay(rc: RenderContext): void {
  const { ctx, width, height, camera, cellSize, currentPath, playingIndex } = rc;

  if (currentPath.length < 2) {
    // Just draw single node if only one chord
    if (currentPath.length === 1) {
      const worldCenter = getPathPointCenter(currentPath[0], cellSize);
      const screenPoint = worldToScreen(worldCenter, camera, width, height);
      const { fill, lightness } = getPathGrayscale(0, 1);
      const borderColor = lightness > 50 ? 'hsl(0, 0%, 15%)' : 'hsl(0, 0%, 85%)';

      ctx.beginPath();
      ctx.arc(screenPoint.x, screenPoint.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = lightness > 50 ? 'hsl(0, 0%, 5%)' : 'hsl(0, 0%, 95%)';
      ctx.font = '600 10px "Palatino", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('1', screenPoint.x, screenPoint.y);
    }
    return;
  }

  const total = currentPath.length;

  // Calculate offset amount (~12% of cell size, scaled with zoom)
  const offsetAmount = cellSize * camera.zoom * 0.12;

  // Convert all path points to screen coordinates with small random offsets
  const screenPoints = currentPath.map((p, i) => {
    const worldCenter = getPathPointCenter(p, cellSize);
    const base = worldToScreen(worldCenter, camera, width, height);

    // Add deterministic random offset based on position in path
    const offsetX = seededRandom(p.rootCell.row, p.rootCell.col, p.type, i) * offsetAmount;
    const offsetY = seededRandom(p.rootCell.row, p.rootCell.col, p.type, i + 100) * offsetAmount;

    return { x: base.x + offsetX, y: base.y + offsetY };
  });

  // Track directed edge traversal counts
  const edgeCounts = new Map<string, number>();

  // Base bow amount in screen pixels
  const baseBow = 12 * Math.sqrt(camera.zoom);

  ctx.lineCap = 'round';

  // Draw each segment as a curved line
  for (let i = 0; i < screenPoints.length - 1; i++) {
    const start = screenPoints[i];
    const end = screenPoints[i + 1];

    // Get traversal count for this directed edge
    const edgeKey = directedEdgeKey(currentPath[i], currentPath[i + 1]);
    const count = edgeCounts.get(edgeKey) || 0;
    edgeCounts.set(edgeKey, count + 1);

    // Calculate direction vector
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (len < 0.1) continue;

    // Perpendicular unit vector
    const perpX = dy / len;
    const perpY = -dx / len;

    // Bow amount increases with repetition
    const bowAmount = baseBow * (1 + count * 0.7);

    // Control point at midpoint
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const controlX = midX + perpX * bowAmount;
    const controlY = midY + perpY * bowAmount;

    // Get color for this edge (based on destination node)
    const destGray = getPathGrayscale(i + 1, total);
    const borderGray = destGray.lightness > 50 ? 20 : 80;

    // Draw border stroke
    ctx.strokeStyle = `hsl(0, 0%, ${borderGray}%)`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.quadraticCurveTo(controlX, controlY, end.x, end.y);
    ctx.stroke();

    // Draw main stroke
    ctx.strokeStyle = destGray.fill;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.quadraticCurveTo(controlX, controlY, end.x, end.y);
    ctx.stroke();
  }

  // Draw 7th chord indicators first (behind nodes)
  // Connect from the 5th to the 7th (stacked thirds: root→3rd→5th→7th)
  for (let i = 0; i < currentPath.length; i++) {
    const point = currentPath[i];
    if (point.seventhQuality && point.seventhPitchClass !== undefined) {
      const isPlaying = i === playingIndex;

      // Calculate 7th tone position
      const seventhInterval = ((point.seventhPitchClass - point.rootPC + 12) % 12);
      const seventhCell = getGridCellForInterval(point.rootCell, seventhInterval);
      const seventhWorld = cellToWorld(seventhCell, cellSize);
      const seventhScreen = worldToScreen(seventhWorld, camera, width, height);

      // Get the 5th (interval 7 from root)
      const fifthCell = getGridCellForInterval(point.rootCell, 7);
      const fifthWorld = cellToWorld(fifthCell, cellSize);
      const fifthScreen = worldToScreen(fifthWorld, camera, width, height);

      // Get quality-specific color
      const qualityColor = SEVENTH_QUALITY_COLORS[point.seventhQuality!];

      // Draw connecting line from 5th to 7th
      ctx.strokeStyle = hexToRgba(qualityColor, 0.6);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(fifthScreen.x, fifthScreen.y);
      ctx.lineTo(seventhScreen.x, seventhScreen.y);
      ctx.stroke();

      // Draw 7th tone circle
      if (isPlaying) {
        ctx.shadowColor = hexToRgba(qualityColor, 0.9);
        ctx.shadowBlur = 12;
      }
      ctx.beginPath();
      ctx.arc(seventhScreen.x, seventhScreen.y, 3.75 * Math.sqrt(camera.zoom), 0, Math.PI * 2);
      ctx.fillStyle = isPlaying ? hexToRgba(qualityColor, 1) : hexToRgba(qualityColor, 0.9);
      ctx.fill();
      ctx.strokeStyle = hexToRgba(qualityColor, 1);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }
  }

  // Draw circles at each point
  for (let i = 0; i < screenPoints.length; i++) {
    const isPlaying = i === playingIndex;
    const point = currentPath[i];
    const hasSeventh = !!point?.seventhQuality;
    const { fill, lightness } = getPathGrayscale(i, total);
    const borderColor = lightness > 50 ? 'hsl(0, 0%, 15%)' : 'hsl(0, 0%, 85%)';
    const radius = isPlaying ? 10 : 6;

    // Get quality-specific color if 7th chord
    const qualityColor = hasSeventh ? SEVENTH_QUALITY_COLORS[point.seventhQuality!] : null;

    // Add glow for playing node
    if (isPlaying) {
      ctx.shadowColor = qualityColor ? hexToRgba(qualityColor, 0.9) : 'rgba(255, 255, 100, 0.9)';
      ctx.shadowBlur = 25;
    }

    // Use quality-specific color for 7th chords
    let nodeFill = fill;
    let nodeStroke = borderColor;
    if (qualityColor && !isPlaying) {
      nodeFill = hexToRgba(qualityColor, 0.7 + lightness / 300);
      nodeStroke = qualityColor;
    } else if (isPlaying && qualityColor) {
      nodeFill = hexToRgba(qualityColor, 0.9);
      nodeStroke = qualityColor;
    } else if (isPlaying) {
      nodeFill = 'hsl(50, 100%, 70%)';
      nodeStroke = 'hsl(50, 100%, 40%)';
    }

    ctx.beginPath();
    ctx.arc(screenPoints[i].x, screenPoints[i].y, radius, 0, Math.PI * 2);
    ctx.fillStyle = nodeFill;
    ctx.fill();
    ctx.strokeStyle = nodeStroke;
    ctx.lineWidth = isPlaying ? 3 : 1.5;
    ctx.stroke();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  // Draw tiny numbers on top of nodes
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = Math.max(8, Math.min(11, 8 * Math.sqrt(camera.zoom)));
  ctx.font = `600 ${fontSize}px "Palatino", Georgia, serif`;

  for (let i = 0; i < screenPoints.length; i++) {
    const { lightness } = getPathGrayscale(i, total);
    ctx.fillStyle = lightness > 50 ? 'hsl(0, 0%, 5%)' : 'hsl(0, 0%, 95%)';
    ctx.fillText(String(i + 1), screenPoints[i].x, screenPoints[i].y);
  }
}

/**
 * Highlight triangles for a hovered cell (legacy - for cell hover)
 */
export function drawHoveredTriangles(
  rc: RenderContext,
  cell: GridCell
): void {
  const { ctx, width, height, camera, cellSize } = rc;

  // Get major and minor triangles rooted at this cell
  const major = getMajorTriangle(cell, cellSize);
  const minor = getMinorTriangle(cell, cellSize);

  // Draw with brighter colors
  ctx.globalAlpha = 0.6;

  // Major
  const majorVerts = major.vertices.map((v) => worldToScreen(v, camera, width, height));
  ctx.beginPath();
  ctx.moveTo(majorVerts[0].x, majorVerts[0].y);
  ctx.lineTo(majorVerts[1].x, majorVerts[1].y);
  ctx.lineTo(majorVerts[2].x, majorVerts[2].y);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 200, 100, 0.4)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 200, 100, 0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Minor
  const minorVerts = minor.vertices.map((v) => worldToScreen(v, camera, width, height));
  ctx.beginPath();
  ctx.moveTo(minorVerts[0].x, minorVerts[0].y);
  ctx.lineTo(minorVerts[1].x, minorVerts[1].y);
  ctx.lineTo(minorVerts[2].x, minorVerts[2].y);
  ctx.closePath();
  ctx.fillStyle = 'rgba(100, 200, 255, 0.4)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.globalAlpha = 1;
}

// ============================================================================
// SEVENTH CHORD RENDERING
// ============================================================================

/**
 * Draw a seventh chord using the appropriate rendering mode
 *
 * - Two-triangle mode: Draw both triangles with distinct 7th-chord color, single label
 * - Triangle-leg mode: Draw one triangle + added 7th tone with connectors
 * - No-face mode: Draw floating billboard polygon
 */
export function drawSeventhChord(
  ctx: CanvasRenderingContext2D,
  rootCell: GridCell,
  quality: SeventhQuality,
  camera: Camera,
  width: number,
  height: number,
  cellSize: number,
  settings: AppSettings,
  isPlaying: boolean = false
): void {
  const rootPC = gridToPC(rootCell.row, rootCell.col);
  const pitchClasses = CHORD_INTERVALS[quality].map(i =>
    ((rootPC + i) % 12) as PitchClass
  );

  const decomposition = decomposeSeventhChord(pitchClasses);

  switch (decomposition.mode) {
    case 'two-triangle':
      drawTwoTriangleSeventhChord(ctx, rootCell, decomposition, quality, camera, width, height, cellSize, settings, isPlaying);
      break;
    case 'triangle-leg':
      drawTriangleLegSeventhChord(ctx, rootCell, decomposition, quality, camera, width, height, cellSize, settings, isPlaying);
      break;
    case 'no-face':
      drawNoFaceSeventhChord(ctx, rootCell, pitchClasses, quality, camera, width, height, cellSize, settings, isPlaying);
      break;
  }
}

/**
 * Draw a two-triangle seventh chord (maj7, m7)
 * Both triangles drawn with distinct 7th-chord color, single label at centroid
 */
function drawTwoTriangleSeventhChord(
  ctx: CanvasRenderingContext2D,
  rootCell: GridCell,
  decomposition: SeventhChordDecomposition,
  quality: SeventhQuality,
  camera: Camera,
  width: number,
  height: number,
  cellSize: number,
  settings: AppSettings,
  isPlaying: boolean
): void {
  const rootPC = gridToPC(rootCell.row, rootCell.col);
  const allScreenVerts: Point[] = [];

  // Draw both triangles with 7th chord color
  for (const face of decomposition.faces) {
    const triangle = face.type === 'major'
      ? getMajorTriangle(findCellForPC(rootCell, face.rootPC, cellSize), cellSize)
      : getMinorTriangle(findCellForPC(rootCell, face.rootPC, cellSize), cellSize);

    const screenVerts = triangle.vertices.map(v => worldToScreen(v, camera, width, height));
    allScreenVerts.push(...screenVerts);

    // Add glow if playing
    if (isPlaying) {
      ctx.shadowColor = 'rgba(255, 200, 100, 0.8)';
      ctx.shadowBlur = 20;
    }

    ctx.beginPath();
    ctx.moveTo(screenVerts[0].x, screenVerts[0].y);
    ctx.lineTo(screenVerts[1].x, screenVerts[1].y);
    ctx.lineTo(screenVerts[2].x, screenVerts[2].y);
    ctx.closePath();

    ctx.fillStyle = isPlaying ? 'rgba(255, 220, 150, 0.5)' : COLORS.seventhChordFace;
    ctx.fill();

    ctx.strokeStyle = isPlaying ? 'rgba(255, 200, 100, 1)' : COLORS.seventhChordStroke;
    ctx.lineWidth = isPlaying ? 3 : 2;
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  // Draw single label at centroid of all vertices
  const centroid = {
    x: allScreenVerts.reduce((sum, v) => sum + v.x, 0) / allScreenVerts.length,
    y: allScreenVerts.reduce((sum, v) => sum + v.y, 0) / allScreenVerts.length,
  };

  drawSeventhChordLabel(ctx, centroid, rootPC, quality, settings, camera);
}

/**
 * Draw a triangle-leg seventh chord (dom7, minMaj7)
 * One triangle + added 7th tone with connector lines
 */
function drawTriangleLegSeventhChord(
  ctx: CanvasRenderingContext2D,
  rootCell: GridCell,
  decomposition: SeventhChordDecomposition,
  quality: SeventhQuality,
  camera: Camera,
  width: number,
  height: number,
  cellSize: number,
  settings: AppSettings,
  isPlaying: boolean
): void {
  const rootPC = gridToPC(rootCell.row, rootCell.col);

  // Draw the primary triangle
  if (decomposition.faces.length > 0) {
    const face = decomposition.faces[0];
    const triangle = face.type === 'major'
      ? getMajorTriangle(findCellForPC(rootCell, face.rootPC, cellSize), cellSize)
      : getMinorTriangle(findCellForPC(rootCell, face.rootPC, cellSize), cellSize);

    const screenVerts = triangle.vertices.map(v => worldToScreen(v, camera, width, height));

    // Draw triangle with 7th chord color
    if (isPlaying) {
      ctx.shadowColor = 'rgba(255, 200, 100, 0.8)';
      ctx.shadowBlur = 20;
    }

    ctx.beginPath();
    ctx.moveTo(screenVerts[0].x, screenVerts[0].y);
    ctx.lineTo(screenVerts[1].x, screenVerts[1].y);
    ctx.lineTo(screenVerts[2].x, screenVerts[2].y);
    ctx.closePath();

    ctx.fillStyle = isPlaying ? 'rgba(255, 220, 150, 0.5)' : COLORS.seventhChordFace;
    ctx.fill();
    ctx.strokeStyle = isPlaying ? 'rgba(255, 200, 100, 1)' : COLORS.seventhChordStroke;
    ctx.lineWidth = isPlaying ? 3 : 2;
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Draw leg tones (the added 7th)
    for (const legPC of decomposition.legTones) {
      const interval = ((legPC - rootPC + 12) % 12);
      const legCell = getGridCellForInterval(rootCell, interval);
      const legWorld = cellToWorld(legCell, cellSize);
      const legScreen = worldToScreen(legWorld, camera, width, height);

      // Draw connector lines to triangle vertices
      ctx.strokeStyle = COLORS.seventhLeg;
      ctx.lineWidth = 2;
      for (const v of screenVerts) {
        ctx.beginPath();
        ctx.moveTo(legScreen.x, legScreen.y);
        ctx.lineTo(v.x, v.y);
        ctx.stroke();
      }

      // Draw the 7th tone as a distinct circle
      if (isPlaying) {
        ctx.shadowColor = 'rgba(255, 220, 100, 0.9)';
        ctx.shadowBlur = 15;
      }

      ctx.beginPath();
      ctx.arc(legScreen.x, legScreen.y, 6 * Math.sqrt(camera.zoom), 0, Math.PI * 2);
      ctx.fillStyle = isPlaying ? 'rgba(255, 255, 180, 1)' : COLORS.seventhTone;
      ctx.fill();
      ctx.strokeStyle = COLORS.seventhToneStroke;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

    // Draw label at triangle center
    const triCenter = triangleCenter(triangle);
    const triCenterScreen = worldToScreen(triCenter, camera, width, height);
    drawSeventhChordLabel(ctx, triCenterScreen, rootPC, quality, settings, camera);
  }
}

/**
 * Draw a no-face seventh chord (dim7, aug families)
 * Floating billboard polygon with all tones connected
 */
function drawNoFaceSeventhChord(
  ctx: CanvasRenderingContext2D,
  rootCell: GridCell,
  pitchClasses: PitchClass[],
  quality: SeventhQuality,
  camera: Camera,
  width: number,
  height: number,
  cellSize: number,
  settings: AppSettings,
  isPlaying: boolean
): void {
  const rootPC = gridToPC(rootCell.row, rootCell.col);

  // Get screen positions for all tones
  const screenPositions: Point[] = [];
  for (const pc of pitchClasses) {
    const interval = ((pc - rootPC + 12) % 12);
    const cell = getGridCellForInterval(rootCell, interval);
    const world = cellToWorld(cell, cellSize);
    screenPositions.push(worldToScreen(world, camera, width, height));
  }

  // Draw connecting lines between all tones (forming a quadrilateral or graph)
  if (isPlaying) {
    ctx.shadowColor = 'rgba(200, 150, 255, 0.8)';
    ctx.shadowBlur = 15;
  }

  ctx.strokeStyle = isPlaying ? 'rgba(220, 180, 255, 0.8)' : COLORS.noFaceChordStroke;
  ctx.lineWidth = 2;

  // Draw as a filled polygon (connect in order of pitch class)
  ctx.beginPath();
  ctx.moveTo(screenPositions[0].x, screenPositions[0].y);
  for (let i = 1; i < screenPositions.length; i++) {
    ctx.lineTo(screenPositions[i].x, screenPositions[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = isPlaying ? 'rgba(220, 180, 255, 0.4)' : COLORS.noFaceChord;
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Draw all tone vertices
  for (const pos of screenPositions) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 4.5 * Math.sqrt(camera.zoom), 0, Math.PI * 2);
    ctx.fillStyle = COLORS.seventhTone;
    ctx.fill();
    ctx.strokeStyle = COLORS.seventhToneStroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Draw floating billboard label at centroid with rotation to match plane
  const centroid = {
    x: screenPositions.reduce((sum, p) => sum + p.x, 0) / screenPositions.length,
    y: screenPositions.reduce((sum, p) => sum + p.y, 0) / screenPositions.length,
  };

  // Draw label background (billboard effect)
  const label = getSeventhChordName(rootPC, quality, settings.preferSharps);
  const fontSize = Math.min(Math.max(11, 13 * Math.sqrt(camera.zoom)), 16);
  ctx.font = `700 ${fontSize}px "Palatino", "Book Antiqua", Georgia, serif`;
  const textWidth = ctx.measureText(label).width;

  ctx.save();
  ctx.translate(centroid.x, centroid.y);
  // Apply both tilt and rotation
  const tiltRad = (camera.tilt * Math.PI) / 180;
  const rotRad = (camera.rotation * Math.PI) / 180;
  ctx.scale(1, Math.cos(tiltRad));
  ctx.rotate(rotRad);

  ctx.fillStyle = 'rgba(30, 30, 50, 0.85)';
  ctx.beginPath();
  ctx.roundRect(-textWidth / 2 - 6, -fontSize / 2 - 4, textWidth + 12, fontSize + 8, 4);
  ctx.fill();

  ctx.fillStyle = COLORS.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 0);
  ctx.restore();
}

/**
 * Draw the chord label at a given position with tilt and rotation to match plane
 */
function drawSeventhChordLabel(
  ctx: CanvasRenderingContext2D,
  position: Point,
  rootPC: PitchClass,
  quality: SeventhQuality,
  settings: AppSettings,
  camera: Camera
): void {
  const label = getSeventhChordName(rootPC, quality, settings.preferSharps);
  const fontSize = Math.min(Math.max(11, 13 * Math.sqrt(camera.zoom)), 15);

  ctx.save();
  ctx.translate(position.x, position.y);
  // Apply both tilt and rotation to match plane
  const tiltRad = (camera.tilt * Math.PI) / 180;
  const rotRad = (camera.rotation * Math.PI) / 180;
  ctx.scale(1, Math.cos(tiltRad));
  ctx.rotate(rotRad);

  ctx.font = `700 ${fontSize}px "Palatino", "Book Antiqua", Georgia, serif`;
  ctx.fillStyle = 'rgba(40, 25, 10, 0.95)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 0);
  ctx.restore();
}

/**
 * Find the grid cell for a given pitch class, relative to a root cell
 * Used to locate triangle roots for decomposed seventh chords
 */
function findCellForPC(rootCell: GridCell, targetPC: PitchClass, _cellSize: number): GridCell {
  const rootPC = gridToPC(rootCell.row, rootCell.col);
  const interval = ((targetPC - rootPC + 12) % 12);
  return getGridCellForInterval(rootCell, interval);
}
