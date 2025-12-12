import type { GridCell, Point, Triangle } from '../state/types';
import { CELL_SIZE } from '../state/types';
import { gridToPC, cellToWorld } from './lattice';
import { mod12 } from './musicMath';

/**
 * Triad geometry for the Tonnetz
 *
 * For a cell at (row, col) with pitch class R:
 *
 * Major triangle (pointing down-right):
 *   Vertices: (row,col), (row,col+1), (row+1,col+1)
 *   Pitch classes: R, R+4, R+7 = {root, M3, P5}
 *
 * Minor triangle (pointing down-left):
 *   Vertices: (row,col), (row+1,col), (row+1,col+1)
 *   Pitch classes: R, R+3, R+7 = {root, m3, P5}
 *
 * Both triangles share the edge from the root to the fifth (the down-right diagonal).
 */

/**
 * Get the major triangle rooted at a cell
 */
export function getMajorTriangle(rootCell: GridCell, cellSize: number = CELL_SIZE): Triangle {
  const rootPC = gridToPC(rootCell.row, rootCell.col);

  // Vertices: root (top-left corner), right neighbor (top-right corner of cell+1),
  // and down-right neighbor (bottom-right corner)
  const v1 = cellToWorld(rootCell, cellSize); // root center
  const v2 = cellToWorld({ row: rootCell.row, col: rootCell.col + 1 }, cellSize); // right
  const v3 = cellToWorld({ row: rootCell.row + 1, col: rootCell.col + 1 }, cellSize); // down-right

  return {
    type: 'major',
    rootCell,
    rootPC,
    vertices: [v1, v2, v3],
    pitchClasses: [rootPC, mod12(rootPC + 4), mod12(rootPC + 7)],
  };
}

/**
 * Get the minor triangle rooted at a cell
 */
export function getMinorTriangle(rootCell: GridCell, cellSize: number = CELL_SIZE): Triangle {
  const rootPC = gridToPC(rootCell.row, rootCell.col);

  // Vertices: root, down neighbor, down-right neighbor
  const v1 = cellToWorld(rootCell, cellSize); // root center
  const v2 = cellToWorld({ row: rootCell.row + 1, col: rootCell.col }, cellSize); // down
  const v3 = cellToWorld({ row: rootCell.row + 1, col: rootCell.col + 1 }, cellSize); // down-right

  return {
    type: 'minor',
    rootCell,
    rootPC,
    vertices: [v1, v2, v3],
    pitchClasses: [rootPC, mod12(rootPC + 3), mod12(rootPC + 7)],
  };
}

/**
 * Check if a point is inside a triangle using barycentric coordinates
 */
export function pointInTriangle(p: Point, triangle: Triangle): boolean {
  const [v1, v2, v3] = triangle.vertices;

  const denominator = (v2.y - v3.y) * (v1.x - v3.x) + (v3.x - v2.x) * (v1.y - v3.y);

  if (Math.abs(denominator) < 0.0001) {
    return false; // Degenerate triangle
  }

  const a = ((v2.y - v3.y) * (p.x - v3.x) + (v3.x - v2.x) * (p.y - v3.y)) / denominator;
  const b = ((v3.y - v1.y) * (p.x - v3.x) + (v1.x - v3.x) * (p.y - v3.y)) / denominator;
  const c = 1 - a - b;

  return a >= 0 && b >= 0 && c >= 0;
}

/**
 * Get all triangles that include a given cell as a vertex
 * A cell is part of 6 triangles total (3 major + 3 minor)
 */
export function getTrianglesForCell(cell: GridCell, cellSize: number = CELL_SIZE): Triangle[] {
  const triangles: Triangle[] = [];

  // Major triangles where this cell is a vertex:
  // 1. Root at this cell
  triangles.push(getMajorTriangle(cell, cellSize));
  // 2. Root at left neighbor (this cell is the +4)
  triangles.push(getMajorTriangle({ row: cell.row, col: cell.col - 1 }, cellSize));
  // 3. Root at up-left neighbor (this cell is the +7)
  triangles.push(getMajorTriangle({ row: cell.row - 1, col: cell.col - 1 }, cellSize));

  // Minor triangles where this cell is a vertex:
  // 1. Root at this cell
  triangles.push(getMinorTriangle(cell, cellSize));
  // 2. Root at up neighbor (this cell is the +3)
  triangles.push(getMinorTriangle({ row: cell.row - 1, col: cell.col }, cellSize));
  // 3. Root at up-left neighbor (this cell is the +7)
  triangles.push(getMinorTriangle({ row: cell.row - 1, col: cell.col - 1 }, cellSize));

  return triangles;
}

/**
 * Find which triangle (if any) contains a world point
 * Checks both major and minor triangles in the vicinity
 */
export function findTriangleAtPoint(
  worldPoint: Point,
  cellSize: number = CELL_SIZE
): Triangle | null {
  // Determine which cell the point is in
  const col = Math.floor(worldPoint.x / cellSize);
  const row = Math.floor(worldPoint.y / cellSize);

  // Check triangles that could contain this point
  // The point is in the area of cell (row, col), so check:
  // - Major triangle rooted at (row, col) - upper right of cell
  // - Minor triangle rooted at (row, col) - lower left of cell
  // - Major triangle rooted at (row-1, col-1) - this cell is the P5
  // - Minor triangle rooted at (row-1, col) - this cell is the P5

  const candidateCells: GridCell[] = [
    { row, col },
    { row: row - 1, col: col - 1 },
    { row: row - 1, col },
    { row, col: col - 1 },
  ];

  for (const rootCell of candidateCells) {
    const major = getMajorTriangle(rootCell, cellSize);
    if (pointInTriangle(worldPoint, major)) {
      return major;
    }

    const minor = getMinorTriangle(rootCell, cellSize);
    if (pointInTriangle(worldPoint, minor)) {
      return minor;
    }
  }

  return null;
}

/**
 * Get the center point of a triangle
 */
export function triangleCenter(triangle: Triangle): Point {
  const [v1, v2, v3] = triangle.vertices;
  return {
    x: (v1.x + v2.x + v3.x) / 3,
    y: (v1.y + v2.y + v3.y) / 3,
  };
}

/**
 * Check if two triangles are the same (same root and type)
 */
export function trianglesEqual(a: Triangle, b: Triangle): boolean {
  return (
    a.type === b.type &&
    a.rootCell.row === b.rootCell.row &&
    a.rootCell.col === b.rootCell.col
  );
}
