import type {
  Camera,
  GridCell,
  AppSettings,
  TrianglePathPoint,
  Triangle,
  Point,
} from '../state/types';
import {
  getVisibleRange,
  gridToPC,
  gridToPitch,
  worldToScreen,
  cellToWorld,
  cellToWorldCorner,
  isRowPatchBoundary,
  isColPatchBoundary,
} from '../core/lattice';
import { getLabel, getTriangleLabel } from '../core/musicMath';
import { getMajorTriangle, getMinorTriangle, triangleCenter } from '../core/triads';

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

export function isInBounds(row: number, col: number): boolean {
  return row >= GRID_BOUNDS.minRow && row <= GRID_BOUNDS.maxRow &&
         col >= GRID_BOUNDS.minCol && col <= GRID_BOUNDS.maxCol;
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
}

/**
 * Main render function - draws the entire Tonnetz visualization
 */
export function render(rc: RenderContext): void {
  const { ctx, width, height } = rc;

  // Clear canvas
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, width, height);

  // Get visible range, clamped to grid boundaries
  const visibleRange = getVisibleRange(rc.camera, width, height, rc.cellSize);
  const range = clampRange(visibleRange);

  // Draw layers in order
  drawPatchBoundaries(rc, range);
  drawTriangles(rc, range);
  drawGridLines(rc, range);
  drawCells(rc, range);
  drawHoveredTriangle(rc);
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
 * Build a map of triangle keys to their path position info
 */
function buildPathMap(path: TrianglePathPoint[]): Map<string, { position: number; total: number }> {
  const map = new Map<string, { position: number; total: number }>();
  path.forEach((point, i) => {
    const key = `${point.rootCell.row},${point.rootCell.col},${point.type}`;
    // Latest position wins (for repeated chords)
    map.set(key, { position: i, total: path.length });
  });
  return map;
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

  // Build path map for checking if triangles are in the path
  const pathMap = buildPathMap(currentPath);

  for (let row = range.minRow; row <= range.maxRow; row++) {
    for (let col = range.minCol; col <= range.maxCol; col++) {
      const cell: GridCell = { row, col };
      const rootPC = gridToPC(row, col);

      // Major triangle
      if (settings.showMajorTriangles) {
        const major = getMajorTriangle(cell, cellSize);
        const pathKey = `${row},${col},major`;
        const pathInfo = pathMap.get(pathKey);
        drawTriangle(ctx, major, camera, width, height, 'major', rootPC, settings, pathInfo);
      }

      // Minor triangle
      if (settings.showMinorTriangles) {
        const minor = getMinorTriangle(cell, cellSize);
        const pathKey = `${row},${col},minor`;
        const pathInfo = pathMap.get(pathKey);
        drawTriangle(ctx, minor, camera, width, height, 'minor', rootPC, settings, pathInfo);
      }
    }
  }
}

/**
 * Draw a single triangle with label based on settings
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
  pathInfo?: { position: number; total: number }
): void {
  const [v1, v2, v3] = triangle.vertices.map((v) =>
    worldToScreen(v, camera, width, height)
  );

  ctx.beginPath();
  ctx.moveTo(v1.x, v1.y);
  ctx.lineTo(v2.x, v2.y);
  ctx.lineTo(v3.x, v3.y);
  ctx.closePath();

  // Determine fill and stroke colors
  let fillColor: string;
  let strokeColor: string;
  let labelColor: string;

  if (pathInfo) {
    // Triangle is in path - use grayscale based on position
    const grayscale = getPathGrayscale(pathInfo.position, pathInfo.total);
    fillColor = grayscale.fill;
    strokeColor = grayscale.lightness < 50 ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)';
    labelColor = grayscale.lightness < 50 ? '#ffffff' : '#222222';
  } else {
    // Normal triangle colors
    fillColor = type === 'major' ? COLORS.majorTriangle : COLORS.minorTriangle;
    strokeColor = type === 'major' ? COLORS.majorTriangleStroke : COLORS.minorTriangleStroke;
    labelColor = type === 'major' ? 'rgba(100, 220, 100, 0.9)' : 'rgba(100, 150, 255, 0.9)';
  }

  // Fill
  ctx.fillStyle = fillColor;
  ctx.fill();

  // Stroke
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = pathInfo ? 2 : 1;
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
    const fontSize = Math.min(Math.max(10, triangleSize * 0.25), 16);

    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillStyle = labelColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, centerX, centerY);
  }
}

/**
 * Draw grid lines
 */
function drawGridLines(
  rc: RenderContext,
  range: { minRow: number; maxRow: number; minCol: number; maxCol: number }
): void {
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
 * Calculate brightness based on MIDI pitch
 * Origin (0,0) = MIDI 60 = neutral
 * Higher pitch = brighter (more white), Lower pitch = darker (more dark)
 */
function getPitchBrightness(row: number, col: number): { r: number; g: number; b: number; a: number } {
  const midi = gridToPitch(row, col);
  const deviation = midi - 60; // How far from middle C

  // Map deviation to brightness: roughly -36 to +36 semitones visible
  // Clamp to reasonable range
  const normalizedDev = Math.max(-36, Math.min(36, deviation)) / 36;

  if (normalizedDev > 0) {
    // Higher pitch = subtle warm white overlay
    const intensity = normalizedDev * 0.12;
    return { r: 255, g: 250, b: 220, a: intensity };
  } else if (normalizedDev < 0) {
    // Lower pitch = subtle cool dark overlay
    const intensity = Math.abs(normalizedDev) * 0.15;
    return { r: 20, g: 20, b: 40, a: intensity };
  }
  return { r: 0, g: 0, b: 0, a: 0 };
}

/**
 * Draw cells with labels
 */
function drawCells(
  rc: RenderContext,
  range: { minRow: number; maxRow: number; minCol: number; maxCol: number }
): void {
  const { ctx, width, height, camera, cellSize, settings } = rc;

  for (let row = range.minRow; row <= range.maxRow; row++) {
    for (let col = range.minCol; col <= range.maxCol; col++) {
      const cell: GridCell = { row, col };
      const pc = gridToPC(row, col);
      const center = cellToWorld(cell, cellSize);
      const screenCenter = worldToScreen(center, camera, width, height);
      const corner = cellToWorldCorner(cell, cellSize);
      const screenCorner = worldToScreen(corner, camera, width, height);
      const screenSize = cellSize * camera.zoom;

      // Draw pitch brightness overlay
      const brightness = getPitchBrightness(row, col);
      if (brightness.a > 0) {
        ctx.fillStyle = `rgba(${brightness.r}, ${brightness.g}, ${brightness.b}, ${brightness.a})`;
        ctx.fillRect(screenCorner.x, screenCorner.y, screenSize, screenSize);
      }

      const isMiddleC = row === 0 && col === 0;
      const isC = pc === 0;

      // Draw label if zoom is sufficient
      const effectiveSize = cellSize * camera.zoom;
      if (effectiveSize > 25) {
        const label = getLabel(
          pc,
          settings.labelMode,
          settings.keyCenter,
          settings.preferSharps
        );

        // Font size scales with zoom but has limits
        const fontSize = Math.min(Math.max(12, effectiveSize * 0.3), 24);
        const middleCFontSize = Math.round(fontSize * 1.15);
        ctx.font = isMiddleC
          ? `bold ${middleCFontSize}px -apple-system, BlinkMacSystemFont, sans-serif`
          : `${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillStyle = isC ? '#ffd700' : COLORS.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, screenCenter.x, screenCenter.y);
      }
    }
  }
}

/**
 * Draw hovered triangle highlight
 */
function drawHoveredTriangle(rc: RenderContext): void {
  const { ctx, width, height, camera, cellSize, hoveredTriangle } = rc;
  if (!hoveredTriangle) return;

  // Don't draw if outside grid bounds
  const { row, col } = hoveredTriangle.rootCell;
  if (!isInBounds(row, col)) return;

  const triangle = hoveredTriangle.type === 'major'
    ? getMajorTriangle(hoveredTriangle.rootCell, cellSize)
    : getMinorTriangle(hoveredTriangle.rootCell, cellSize);

  const verts = triangle.vertices.map((v) => worldToScreen(v, camera, width, height));

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
 * Simple deterministic pseudo-random based on coordinates
 * Returns a value between -1 and 1
 */
function seededRandom(row: number, col: number, type: string, seed: number): number {
  const hash = Math.sin(row * 12.9898 + col * 78.233 + (type === 'major' ? 1 : 0) * 43.758 + seed * 93.9) * 43758.5453;
  return (hash - Math.floor(hash)) * 2 - 1;
}

/**
 * Draw the current path with bowed curves to show repeated traversals
 *
 * Algorithm: Each directed edge (A→B) gets a bow perpendicular to the travel direction.
 * The bow amount increases with each repeated traversal of that same directed edge.
 * Since A→B and B→A have opposite travel directions, their bows naturally go opposite ways.
 */
function drawPath(rc: RenderContext): void {
  const { ctx, width, height, camera, cellSize, currentPath } = rc;

  if (currentPath.length < 2) return;

  const total = currentPath.length;

  // Calculate offset amount (~12% of cell size, scaled with zoom)
  const offsetAmount = cellSize * camera.zoom * 0.12;

  // Convert all path points to screen coordinates with small random offsets
  const screenPoints = currentPath.map((p, i) => {
    const worldCenter = getPathPointCenter(p, cellSize);
    const base = worldToScreen(worldCenter, camera, width, height);

    // Add deterministic random offset based on position in path (not just triangle)
    // This way the same triangle at different path positions gets different offsets
    const offsetX = seededRandom(p.rootCell.row, p.rootCell.col, p.type, i) * offsetAmount;
    const offsetY = seededRandom(p.rootCell.row, p.rootCell.col, p.type, i + 100) * offsetAmount;

    return { x: base.x + offsetX, y: base.y + offsetY };
  });

  // Track directed edge traversal counts
  const edgeCounts = new Map<string, number>();

  // Base bow amount in screen pixels, scales slightly with zoom for consistency
  const baseBow = 12 * Math.sqrt(camera.zoom);

  ctx.lineCap = 'round';

  // Draw each segment as a curved line
  // Edge from k to k+1 uses the color of node k+1
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

    if (len < 0.1) continue; // Skip zero-length segments

    // Perpendicular unit vector ("right" of travel direction)
    const perpX = dy / len;
    const perpY = -dx / len;

    // Bow amount increases with repetition
    const bowAmount = baseBow * (1 + count * 0.7);

    // Control point at midpoint, offset perpendicular to the line
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const controlX = midX + perpX * bowAmount;
    const controlY = midY + perpY * bowAmount;

    // Get color for this edge (based on destination node k+1)
    const destGray = getPathGrayscale(i + 1, total);
    const borderGray = destGray.lightness > 50 ? 20 : 80; // Contrasting border

    // Draw border stroke (thicker, contrasting color)
    ctx.strokeStyle = `hsl(0, 0%, ${borderGray}%)`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.quadraticCurveTo(controlX, controlY, end.x, end.y);
    ctx.stroke();

    // Draw main stroke (destination node color)
    ctx.strokeStyle = destGray.fill;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.quadraticCurveTo(controlX, controlY, end.x, end.y);
    ctx.stroke();
  }

  // Draw circles at each point with grayscale fill and contrasting border
  for (let i = 0; i < screenPoints.length; i++) {
    const { fill, lightness } = getPathGrayscale(i, total);
    const borderColor = lightness > 50 ? 'hsl(0, 0%, 15%)' : 'hsl(0, 0%, 85%)';

    const radius = i === 0 ? 7 : (i === screenPoints.length - 1 ? 6 : 4);

    // Draw circle
    ctx.beginPath();
    ctx.arc(screenPoints[i].x, screenPoints[i].y, radius, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Draw tiny numbers on top of nodes
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = Math.max(8, Math.min(11, 8 * Math.sqrt(camera.zoom)));
  ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;

  for (let i = 0; i < screenPoints.length; i++) {
    const { lightness } = getPathGrayscale(i, total);
    // Contrasting text color
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
