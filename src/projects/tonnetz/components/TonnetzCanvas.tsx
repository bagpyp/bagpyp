import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useApp, useCamera, useHover, usePath } from '../state/AppContext';
import type { GridCell, Point } from '../state/types';
import { CELL_SIZE } from '../state/types';
import { render, isInBounds } from '../rendering/renderer';
import type { RenderContext } from '../rendering/renderer';
import { screenToWorld, worldToCell } from '../core/lattice';
import { findTriangleAtPoint } from '../core/triads';

interface TonnetzCanvasProps {
  className?: string;
}

export function TonnetzCanvas({ className }: TonnetzCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state } = useApp();
  const { pan, zoom } = useCamera();
  const { setHoveredCell, setHoveredTriangle } = useHover();
  const { addTriangleToPath } = usePath();

  // Track dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [lastMousePos, setLastMousePos] = useState<Point | null>(null);

  // Touch state for pinch zoom
  const lastTouchDistRef = useRef<number | null>(null);
  const lastTouchCenterRef = useRef<Point | null>(null);

  // Inertia state
  const velocityRef = useRef<Point>({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

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

  // Get world point from screen position
  const getWorldPoint = useCallback(
    (screenPoint: Point): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

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

        // Update velocity for inertia
        velocityRef.current = { x: dx, y: dy };

        pan(-dx / state.camera.zoom, -dy / state.camera.zoom);
        setLastMousePos(point);
      }
    },
    [getCanvasPoint, getCellAtScreen, getWorldPoint, isDragging, lastMousePos, pan, setHoveredCell, setHoveredTriangle, state.camera.zoom]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      const point = getCanvasPoint(e);

      // If we didn't drag much, treat as click (add triangle to path)
      if (dragStart) {
        const dx = point.x - dragStart.x;
        const dy = point.y - dragStart.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
          // Find the triangle at click position (only if in bounds)
          const worldPoint = getWorldPoint(point);
          const triangle = findTriangleAtPoint(worldPoint, CELL_SIZE);
          if (triangle && isInBounds(triangle.rootCell.row, triangle.rootCell.col)) {
            addTriangleToPath(triangle.rootCell, triangle.type);
          }
        }
      }

      setIsDragging(false);
      setDragStart(null);
      setLastMousePos(null);
    },
    [getCanvasPoint, dragStart, getWorldPoint, addTriangleToPath]
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

  // Touch helper to get canvas point from touch
  const getTouchPoint = useCallback((touch: React.Touch | Touch): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }, []);

  // Get distance between two touches
  const getTouchDistance = useCallback((touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Get center point between two touches
  const getTouchCenter = useCallback((touches: React.TouchList): Point => {
    const canvas = canvasRef.current;
    if (!canvas || touches.length < 2) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2 - rect.left,
      y: (touches[0].clientY + touches[1].clientY) / 2 - rect.top,
    };
  }, []);

  // Touch start handler
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 1) {
        // Single finger - start drag
        const point = getTouchPoint(e.touches[0]);
        setIsDragging(true);
        setDragStart(point);
        setLastMousePos(point);
        velocityRef.current = { x: 0, y: 0 };

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      } else if (e.touches.length === 2) {
        // Two fingers - prepare for pinch zoom
        lastTouchDistRef.current = getTouchDistance(e.touches);
        lastTouchCenterRef.current = getTouchCenter(e.touches);
        setIsDragging(false);
      }
    },
    [getTouchPoint, getTouchDistance, getTouchCenter]
  );

  // Touch move handler
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 1 && isDragging && lastMousePos) {
        // Single finger drag
        const point = getTouchPoint(e.touches[0]);
        const dx = point.x - lastMousePos.x;
        const dy = point.y - lastMousePos.y;

        velocityRef.current = { x: dx, y: dy };
        pan(-dx / state.camera.zoom, -dy / state.camera.zoom);
        setLastMousePos(point);
      } else if (e.touches.length === 2) {
        // Pinch zoom
        const newDist = getTouchDistance(e.touches);
        const newCenter = getTouchCenter(e.touches);

        if (lastTouchDistRef.current !== null && lastTouchCenterRef.current !== null) {
          const canvas = canvasRef.current;
          if (!canvas) return;

          const width = canvas.width / window.devicePixelRatio;
          const height = canvas.height / window.devicePixelRatio;

          // Calculate zoom factor from pinch
          const scale = newDist / lastTouchDistRef.current;

          // Calculate world position of pinch center
          const worldPoint = screenToWorld(newCenter, state.camera, width, height);

          // Apply zoom
          zoom(scale, worldPoint.x, worldPoint.y);

          // Also pan if center moved
          const dx = newCenter.x - lastTouchCenterRef.current.x;
          const dy = newCenter.y - lastTouchCenterRef.current.y;
          pan(-dx / state.camera.zoom, -dy / state.camera.zoom);
        }

        lastTouchDistRef.current = newDist;
        lastTouchCenterRef.current = newCenter;
      }
    },
    [getTouchPoint, getTouchDistance, getTouchCenter, isDragging, lastMousePos, pan, zoom, state.camera]
  );

  // Touch end handler
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 0) {
        // All fingers lifted - check for tap
        if (dragStart && lastMousePos) {
          const dx = lastMousePos.x - dragStart.x;
          const dy = lastMousePos.y - dragStart.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 10) {
            // Treat as tap - add triangle
            const worldPoint = getWorldPoint(lastMousePos);
            const triangle = findTriangleAtPoint(worldPoint, CELL_SIZE);
            if (triangle && isInBounds(triangle.rootCell.row, triangle.rootCell.col)) {
              addTriangleToPath(triangle.rootCell, triangle.type);
            }
          }
        }

        setIsDragging(false);
        setDragStart(null);
        setLastMousePos(null);
        lastTouchDistRef.current = null;
        lastTouchCenterRef.current = null;
      } else if (e.touches.length === 1) {
        // One finger remains - switch to single finger drag
        const point = getTouchPoint(e.touches[0]);
        setIsDragging(true);
        setDragStart(point);
        setLastMousePos(point);
        lastTouchDistRef.current = null;
        lastTouchCenterRef.current = null;
      }
    },
    [dragStart, lastMousePos, getWorldPoint, addTriangleToPath, getTouchPoint]
  );

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          display: 'block',
          touchAction: 'none',
        }}
      />
    </div>
  );
}
