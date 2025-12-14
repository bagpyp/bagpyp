import { useRef, useEffect, useCallback, useState } from 'react';
import { useApp, useCamera, useHover, usePath, useChordWheel } from '../state/AppContext';
import type { GridCell, Point } from '../state/types';
import { CELL_SIZE } from '../state/types';
import { render, isInBounds } from '../rendering/renderer';
import type { RenderContext } from '../rendering/renderer';
import { screenToWorld, screenToWorld3D, worldToCell } from '../core/lattice';
import { findTriangleAtPoint } from '../core/triads';

type DragMode = 'pan' | 'tilt' | 'rotate';

interface TonnetzCanvasProps {
  className?: string;
}

export function TonnetzCanvas({ className }: TonnetzCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state } = useApp();
  const { camera, pan, zoom, setTilt, setRotation, recenter } = useCamera();
  const { setHoveredCell, setHoveredTriangle } = useHover();
  const { addTriangleToPath, undoPath, currentPath } = usePath();
  const { showChordWheel } = useChordWheel();

  // Track dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<DragMode>('pan');
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [lastMousePos, setLastMousePos] = useState<Point | null>(null);

  // Track modifier keys for visual feedback
  const [shiftHeld, setShiftHeld] = useState(false);
  const [metaHeld, setMetaHeld] = useState(false);

  // Derived states - mutually exclusive
  const shiftMetaHeld = shiftHeld && metaHeld;  // Both held = chord edit mode
  const shiftOnly = shiftHeld && !metaHeld;      // Shift alone = tilt mode
  const metaOnly = metaHeld && !shiftHeld;       // Cmd alone = rotate mode

  // Inertia state
  const velocityRef = useRef<Point>({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  // Track modifier keys globally and handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setShiftHeld(true);
      if (e.key === 'Meta') setMetaHeld(true);

      // Cmd+Z to undo last chord
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undoPath();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setShiftHeld(false);
      if (e.key === 'Meta') setMetaHeld(false);
    };
    const handleBlur = () => {
      // Reset when window loses focus
      setShiftHeld(false);
      setMetaHeld(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [undoPath]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply device pixel ratio scaling
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

    const rc: RenderContext = {
      ctx,
      width: canvas.width / window.devicePixelRatio,
      height: canvas.height / window.devicePixelRatio,
      camera: state.camera,
      settings: state.settings,
      hoveredCell: state.hoveredCell,
      hoveredTriangle: state.hoveredTriangle,
      currentPath: state.currentPath,
      cellSize: CELL_SIZE,
      playingIndex: state.playingIndex,
      chordWheel: state.chordWheel,
    };

    render(rc);
  }, [state]);

  // Inertia animation
  useEffect(() => {
    const animate = () => {
      const vel = velocityRef.current;
      if (Math.abs(vel.x) > 0.5 || Math.abs(vel.y) > 0.5) {
        pan(-vel.x / state.camera.zoom, -vel.y / state.camera.zoom);
        vel.x *= 0.92;
        vel.y *= 0.92;
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    if (!isDragging && (Math.abs(velocityRef.current.x) > 0.5 || Math.abs(velocityRef.current.y) > 0.5)) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDragging, pan, state.camera.zoom]);

  // Get canvas-relative position
  const getCanvasPoint = useCallback((e: React.MouseEvent | MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  // Get world point from screen position (accounting for tilt/rotation)
  const getWorldPoint = useCallback(
    (screenPoint: Point): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Use 3D projection when tilted or rotated
      if (state.camera.tilt !== 0 || state.camera.rotation !== 0) {
        return screenToWorld3D(screenPoint, state.camera, width, height);
      }
      return screenToWorld(screenPoint, state.camera, width, height);
    },
    [state.camera]
  );

  // Get grid cell from screen position
  const getCellAtScreen = useCallback(
    (screenPoint: Point): GridCell => {
      const worldPoint = getWorldPoint(screenPoint);
      return worldToCell(worldPoint, CELL_SIZE);
    },
    [getWorldPoint]
  );

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const point = getCanvasPoint(e);
      setIsDragging(true);
      setDragStart(point);
      setLastMousePos(point);
      velocityRef.current = { x: 0, y: 0 };

      // Determine drag mode based on modifier keys
      // Shift+Cmd together = chord edit mode (use pan, click will handle chord wheel)
      if (e.shiftKey && e.metaKey) {
        setDragMode('pan'); // No special drag, just allow click-through for chord edit
      } else if (e.shiftKey) {
        setDragMode('tilt');
      } else if (e.metaKey) {
        setDragMode('rotate');
      } else {
        setDragMode('pan');
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    },
    [getCanvasPoint]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const point = getCanvasPoint(e);
      const cell = getCellAtScreen(point);

      // Only set hovered cell if in bounds
      if (isInBounds(cell.row, cell.col)) {
        setHoveredCell(cell);
      } else {
        setHoveredCell(null);
      }

      // Also detect hovered triangle (only if in bounds)
      const worldPoint = getWorldPoint(point);
      const triangle = findTriangleAtPoint(worldPoint, CELL_SIZE);
      if (triangle && isInBounds(triangle.rootCell.row, triangle.rootCell.col)) {
        setHoveredTriangle({ rootCell: triangle.rootCell, type: triangle.type });
      } else {
        setHoveredTriangle(null);
      }

      if (isDragging && lastMousePos) {
        const dx = point.x - lastMousePos.x;
        const dy = point.y - lastMousePos.y;

        if (dragMode === 'pan') {
          // Update velocity for inertia
          velocityRef.current = { x: dx, y: dy };
          pan(-dx / state.camera.zoom, -dy / state.camera.zoom);
        } else if (dragMode === 'tilt') {
          // Vertical drag controls tilt (0-75 degrees)
          const newTilt = Math.max(0, Math.min(75, camera.tilt - dy * 0.5));
          setTilt(newTilt);
        } else if (dragMode === 'rotate') {
          // Horizontal drag controls rotation
          const newRotation = camera.rotation + dx * 0.5;
          setRotation(newRotation);
        }

        setLastMousePos(point);
      }
    },
    [getCanvasPoint, getCellAtScreen, getWorldPoint, isDragging, lastMousePos, pan, setHoveredCell, setHoveredTriangle, state.camera.zoom, dragMode, camera.tilt, camera.rotation, setTilt, setRotation]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      const point = getCanvasPoint(e);

      // If we didn't drag much, treat as click
      if (dragStart) {
        const dx = point.x - dragStart.x;
        const dy = point.y - dragStart.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
          const worldPoint = getWorldPoint(point);
          const triangle = findTriangleAtPoint(worldPoint, CELL_SIZE);
          if (triangle && isInBounds(triangle.rootCell.row, triangle.rootCell.col)) {
            // Shift+Cmd click: add chord AND open wheel to choose 7th quality
            if (e.shiftKey && e.metaKey) {
              addTriangleToPath(triangle.rootCell, triangle.type);
              // Show wheel for the newly added chord (will be at the end of path)
              // Use setTimeout to let state update first
              setTimeout(() => {
                showChordWheel(currentPath.length, { x: e.clientX, y: e.clientY });
              }, 0);
            } else if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
              // Normal click (no modifiers): add triangle to path as triad
              addTriangleToPath(triangle.rootCell, triangle.type);
            }
            // If just shift or just cmd, do nothing (those are for drag modes)
          }
        }
      }

      setIsDragging(false);
      setDragStart(null);
      setLastMousePos(null);
    },
    [getCanvasPoint, dragStart, getWorldPoint, addTriangleToPath, currentPath, showChordWheel]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null);
    setHoveredTriangle(null);
    setIsDragging(false);
    setDragStart(null);
    setLastMousePos(null);
  }, [setHoveredCell, setHoveredTriangle]);

  // Wheel handler for zoom (slowed down)
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const point = getCanvasPoint(e);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Calculate world position of cursor
      const worldPoint = screenToWorld(point, state.camera, width, height);

      // Slower zoom factor (was 0.9/1.1, now 0.95/1.05)
      const factor = e.deltaY > 0 ? 0.95 : 1.05;

      zoom(factor, worldPoint.x, worldPoint.y);
    },
    [getCanvasPoint, state.camera, zoom]
  );

  // Helper styles for active modifier indicators
  const getControlStyle = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 6px',
    borderRadius: '4px',
    background: isActive ? 'rgba(100, 180, 255, 0.2)' : 'transparent',
    border: isActive ? '1px solid rgba(100, 180, 255, 0.5)' : '1px solid transparent',
    transition: 'all 0.15s ease',
  });

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: isDragging
          ? (dragMode === 'tilt' ? 'ns-resize' : dragMode === 'rotate' ? 'ew-resize' : 'grabbing')
          : shiftMetaHeld ? 'pointer' : 'grab',
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        style={{
          display: 'block',
          touchAction: 'none',
        }}
      />

      {/* Unified controls panel */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          background: 'rgba(30, 30, 30, 0.9)',
          padding: '10px',
          borderRadius: '8px',
          backdropFilter: 'blur(4px)',
          fontSize: '11px',
          color: '#e0e0e0',
          userSelect: 'none',
          minWidth: '200px',
        }}
      >
        {/* Tilt control - highlights on Shift only (not Shift+Cmd) */}
        <div style={getControlStyle(shiftOnly)}>
          <span style={{
            fontSize: '9px',
            padding: '2px 4px',
            background: shiftOnly ? 'rgba(100, 180, 255, 0.4)' : 'rgba(80, 80, 80, 0.6)',
            borderRadius: '3px',
            fontWeight: 500,
            minWidth: '32px',
            textAlign: 'center',
          }}>
            ⇧
          </span>
          <label style={{ minWidth: '40px', color: shiftOnly ? '#8cf' : '#aaa' }}>Tilt</label>
          <input
            type="range"
            min="0"
            max="75"
            value={camera.tilt}
            onChange={(e) => setTilt(Number(e.target.value))}
            style={{ width: '70px', cursor: 'pointer', accentColor: shiftOnly ? '#8cf' : undefined }}
          />
          <span style={{ minWidth: '28px', textAlign: 'right', fontFamily: 'monospace' }}>
            {Math.round(camera.tilt)}°
          </span>
        </div>

        {/* Rotate control - highlights on Cmd only (not Shift+Cmd) */}
        <div style={getControlStyle(metaOnly)}>
          <span style={{
            fontSize: '9px',
            padding: '2px 4px',
            background: metaOnly ? 'rgba(100, 180, 255, 0.4)' : 'rgba(80, 80, 80, 0.6)',
            borderRadius: '3px',
            fontWeight: 500,
            minWidth: '32px',
            textAlign: 'center',
          }}>
            ⌘
          </span>
          <label style={{ minWidth: '40px', color: metaOnly ? '#8cf' : '#aaa' }}>Rotate</label>
          <input
            type="range"
            min="-180"
            max="180"
            value={camera.rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            style={{ width: '70px', cursor: 'pointer', accentColor: metaOnly ? '#8cf' : undefined }}
          />
          <span style={{ minWidth: '28px', textAlign: 'right', fontFamily: 'monospace' }}>
            {Math.round(camera.rotation)}°
          </span>
        </div>

        {/* Chord edit indicator - highlights on Shift+Cmd */}
        <div style={getControlStyle(shiftMetaHeld)}>
          <span style={{
            fontSize: '9px',
            padding: '2px 4px',
            background: shiftMetaHeld ? 'rgba(255, 180, 100, 0.4)' : 'rgba(80, 80, 80, 0.6)',
            borderRadius: '3px',
            fontWeight: 500,
            minWidth: '32px',
            textAlign: 'center',
          }}>
            ⇧⌘
          </span>
          <span style={{ color: shiftMetaHeld ? '#fc8' : '#888', flex: 1 }}>
            {shiftMetaHeld ? 'Click to add + choose 7th' : 'Add chord with 7th'}
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => {
              setTilt(0);
              setRotation(0);
            }}
            style={{
              flex: 1,
              padding: '6px 8px',
              background: 'rgba(80, 80, 80, 0.6)',
              border: 'none',
              borderRadius: '4px',
              color: '#ccc',
              cursor: 'pointer',
              fontSize: '10px',
            }}
            title="Reset tilt and rotation to 0"
          >
            Reset 3D
          </button>
          <button
            onClick={recenter}
            style={{
              flex: 1,
              padding: '6px 8px',
              background: 'rgba(80, 80, 80, 0.6)',
              border: 'none',
              borderRadius: '4px',
              color: '#ccc',
              cursor: 'pointer',
              fontSize: '10px',
            }}
            title="Snap to middle C (origin)"
          >
            ⌖ Center
          </button>
        </div>
      </div>
    </div>
  );
}
