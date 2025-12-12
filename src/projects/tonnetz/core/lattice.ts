import type { PitchClass, GridCell, Point } from '../state/types';
import { CELL_SIZE, PATCH_ROWS, PATCH_COLS } from '../state/types';
import { mod12 } from './musicMath';

/**
 * Tonnetz lattice math
 *
 * Core equation: pc(row, col) ≡ 4*col + 3*row (mod 12)
 *
 * Axes:
 * - Right step (+1 col) = +4 semitones (M3)
 * - Down step (+1 row) = +3 semitones (m3)
 * - Diagonal (down-right) = +7 semitones (P5)
 *
 * The fundamental patch is 4 rows × 3 cols, containing all 12 pitch classes exactly once.
 * The infinite lattice is tiled copies of this patch (torus topology).
 */

/**
 * Convert grid cell to pitch class
 * pc(row, col) = (4*col + 3*row) mod 12
 */
export function gridToPC(row: number, col: number): PitchClass {
  return mod12(4 * col + 3 * row);
}

/**
 * Convert grid cell to MIDI pitch number
 * pitch(row, col) = centerPitch + 4*col + 3*row
 *
 * At origin (0,0), pitch = centerPitch (default 60 = middle C)
 * Moving right: +4 semitones (M3)
 * Moving down: +3 semitones (m3)
 */
export function gridToPitch(row: number, col: number, centerPitch: number = 60): number {
  return centerPitch + 4 * col + 3 * row;
}

/**
 * Get the center point of a cell in world coordinates
 */
export function cellToWorld(cell: GridCell, cellSize: number = CELL_SIZE): Point {
  return {
    x: cell.col * cellSize + cellSize / 2,
    y: cell.row * cellSize + cellSize / 2,
  };
}

/**
 * Get the top-left corner of a cell in world coordinates
 */
export function cellToWorldCorner(cell: GridCell, cellSize: number = CELL_SIZE): Point {
  return {
    x: cell.col * cellSize,
    y: cell.row * cellSize,
  };
}

/**
 * Convert world coordinates to grid cell
 */
export function worldToCell(point: Point, cellSize: number = CELL_SIZE): GridCell {
  return {
    row: Math.floor(point.y / cellSize),
    col: Math.floor(point.x / cellSize),
  };
}

/**
 * Check if a row is a patch boundary (every PATCH_ROWS rows)
 */
export function isRowPatchBoundary(row: number): boolean {
  return row % PATCH_ROWS === 0;
}

/**
 * Check if a col is a patch boundary (every PATCH_COLS cols)
 */
export function isColPatchBoundary(col: number): boolean {
  return col % PATCH_COLS === 0;
}

/**
 * Get the canonical cell within the fundamental patch for any cell
 * This maps any cell to its equivalent in the 4×3 patch
 */
export function canonicalCell(cell: GridCell): GridCell {
  return {
    row: ((cell.row % PATCH_ROWS) + PATCH_ROWS) % PATCH_ROWS,
    col: ((cell.col % PATCH_COLS) + PATCH_COLS) % PATCH_COLS,
  };
}

/**
 * Calculate visible grid range from camera state
 */
export function getVisibleRange(
  camera: { x: number; y: number; zoom: number },
  canvasWidth: number,
  canvasHeight: number,
  cellSize: number = CELL_SIZE,
  buffer: number = 2
): { minRow: number; maxRow: number; minCol: number; maxCol: number } {
  // World coordinates of canvas corners
  const halfWidth = canvasWidth / 2;
  const halfHeight = canvasHeight / 2;

  const worldLeft = camera.x - halfWidth / camera.zoom;
  const worldRight = camera.x + halfWidth / camera.zoom;
  const worldTop = camera.y - halfHeight / camera.zoom;
  const worldBottom = camera.y + halfHeight / camera.zoom;

  return {
    minRow: Math.floor(worldTop / cellSize) - buffer,
    maxRow: Math.ceil(worldBottom / cellSize) + buffer,
    minCol: Math.floor(worldLeft / cellSize) - buffer,
    maxCol: Math.ceil(worldRight / cellSize) + buffer,
  };
}

/**
 * Convert screen coordinates to world coordinates
 */
export function screenToWorld(
  screenPoint: Point,
  camera: { x: number; y: number; zoom: number },
  canvasWidth: number,
  canvasHeight: number
): Point {
  return {
    x: camera.x + (screenPoint.x - canvasWidth / 2) / camera.zoom,
    y: camera.y + (screenPoint.y - canvasHeight / 2) / camera.zoom,
  };
}

/**
 * Convert world coordinates to screen coordinates
 */
export function worldToScreen(
  worldPoint: Point,
  camera: { x: number; y: number; zoom: number },
  canvasWidth: number,
  canvasHeight: number
): Point {
  return {
    x: (worldPoint.x - camera.x) * camera.zoom + canvasWidth / 2,
    y: (worldPoint.y - camera.y) * camera.zoom + canvasHeight / 2,
  };
}

/**
 * Find the cell at (row=0, col=0) - this is where pc=0 (tonic) is located at origin
 * Actually with our formula: pc(0,0) = 0, so origin cell is the tonic
 */
export function getTonicCell(): GridCell {
  return { row: 0, col: 0 };
}

/**
 * Get neighbor cells in Tonnetz directions
 */
export function getNeighbors(cell: GridCell): {
  right: GridCell;      // +M3
  left: GridCell;       // -M3
  down: GridCell;       // +m3
  up: GridCell;         // -m3
  downRight: GridCell;  // +P5
  upLeft: GridCell;     // -P5
} {
  return {
    right: { row: cell.row, col: cell.col + 1 },
    left: { row: cell.row, col: cell.col - 1 },
    down: { row: cell.row + 1, col: cell.col },
    up: { row: cell.row - 1, col: cell.col },
    downRight: { row: cell.row + 1, col: cell.col + 1 },
    upLeft: { row: cell.row - 1, col: cell.col - 1 },
  };
}

/**
 * Check if two cells are the same
 */
export function cellsEqual(a: GridCell, b: GridCell): boolean {
  return a.row === b.row && a.col === b.col;
}

/**
 * Get a unique key for a cell (for React keys, Maps, etc.)
 */
export function cellKey(cell: GridCell): string {
  return `${cell.row},${cell.col}`;
}
