import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type {
  AppState,
  AppSettings,
  Camera,
  GridCell,
  TrianglePathPoint,
  TrianglePath,
  PitchClass,
} from './types';
import {
  DEFAULT_SETTINGS,
  DEFAULT_CAMERA,
  MIN_ZOOM,
  MAX_ZOOM,
} from './types';
import { gridToPC, gridToPitch } from '../core/lattice';
import { mod12 } from '../core/musicMath';

// Action types
type Action =
  | { type: 'SET_CAMERA'; camera: Camera }
  | { type: 'PAN'; dx: number; dy: number }
  | { type: 'ZOOM'; factor: number; centerX: number; centerY: number }
  | { type: 'RECENTER' }
  | { type: 'SET_LABEL_MODE'; mode: AppSettings['labelMode'] }
  | { type: 'SET_KEY_CENTER'; keyCenter: PitchClass }
  | { type: 'TOGGLE_SHARPS' }
  | { type: 'TOGGLE_TRIANGLES' }
  | { type: 'TOGGLE_PATCH_BOUNDARIES' }
  | { type: 'TOGGLE_MAJOR_TRIANGLES' }
  | { type: 'TOGGLE_MINOR_TRIANGLES' }
  | { type: 'SET_HOVERED_CELL'; cell: GridCell | null }
  | { type: 'SET_HOVERED_TRIANGLE'; triangle: { rootCell: GridCell; type: 'major' | 'minor' } | null }
  | { type: 'ADD_TRIANGLE_TO_PATH'; rootCell: GridCell; triType: 'major' | 'minor' }
  | { type: 'UNDO_PATH' }
  | { type: 'CLEAR_PATH' }
  | { type: 'SAVE_PATH'; name: string; color: string }
  | { type: 'LOAD_PATH'; path: TrianglePath }
  | { type: 'DELETE_SAVED_PATH'; id: string }
  | { type: 'SET_PLAYING'; isPlaying: boolean }
  | { type: 'SET_TEMPO'; tempo: number }
  | { type: 'SET_SETTINGS'; settings: Partial<AppSettings> };

// Initial state
const initialState: AppState = {
  camera: DEFAULT_CAMERA,
  settings: DEFAULT_SETTINGS,
  currentPath: [],
  savedPaths: [],
  hoveredCell: null,
  hoveredTriangle: null,
  isPlaying: false,
  tempo: 120,
};

// Reducer
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_CAMERA':
      return { ...state, camera: action.camera };

    case 'PAN':
      return {
        ...state,
        camera: {
          ...state.camera,
          x: state.camera.x + action.dx,
          y: state.camera.y + action.dy,
        },
      };

    case 'ZOOM': {
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, state.camera.zoom * action.factor));
      const zoomRatio = newZoom / state.camera.zoom;
      return {
        ...state,
        camera: {
          x: action.centerX + (state.camera.x - action.centerX) * zoomRatio,
          y: action.centerY + (state.camera.y - action.centerY) * zoomRatio,
          zoom: newZoom,
        },
      };
    }

    case 'RECENTER':
      return {
        ...state,
        camera: DEFAULT_CAMERA,
      };

    case 'SET_LABEL_MODE':
      return {
        ...state,
        settings: { ...state.settings, labelMode: action.mode },
      };

    case 'SET_KEY_CENTER':
      return {
        ...state,
        settings: { ...state.settings, keyCenter: action.keyCenter },
      };

    case 'TOGGLE_SHARPS':
      return {
        ...state,
        settings: { ...state.settings, preferSharps: !state.settings.preferSharps },
      };

    case 'TOGGLE_TRIANGLES':
      return {
        ...state,
        settings: { ...state.settings, showTriangles: !state.settings.showTriangles },
      };

    case 'TOGGLE_PATCH_BOUNDARIES':
      return {
        ...state,
        settings: { ...state.settings, showPatchBoundaries: !state.settings.showPatchBoundaries },
      };

    case 'TOGGLE_MAJOR_TRIANGLES':
      return {
        ...state,
        settings: { ...state.settings, showMajorTriangles: !state.settings.showMajorTriangles },
      };

    case 'TOGGLE_MINOR_TRIANGLES':
      return {
        ...state,
        settings: { ...state.settings, showMinorTriangles: !state.settings.showMinorTriangles },
      };

    case 'SET_HOVERED_CELL':
      return { ...state, hoveredCell: action.cell };

    case 'SET_HOVERED_TRIANGLE':
      return { ...state, hoveredTriangle: action.triangle };

    case 'ADD_TRIANGLE_TO_PATH': {
      const rootPC = gridToPC(action.rootCell.row, action.rootCell.col);
      const third = action.triType === 'major' ? 4 : 3;
      const pitchClasses: [PitchClass, PitchClass, PitchClass] = [
        rootPC,
        mod12(rootPC + third),
        mod12(rootPC + 7),
      ];

      // Calculate MIDI pitches based on grid position
      const rootMidi = gridToPitch(action.rootCell.row, action.rootCell.col);
      const midiPitches: [number, number, number] = [
        rootMidi,
        rootMidi + third,
        rootMidi + 7,
      ];

      const newPoint: TrianglePathPoint = {
        rootCell: action.rootCell,
        type: action.triType,
        rootPC,
        pitchClasses,
        midiPitches,
      };

      return {
        ...state,
        currentPath: [...state.currentPath, newPoint],
      };
    }

    case 'UNDO_PATH':
      return {
        ...state,
        currentPath: state.currentPath.slice(0, -1),
      };

    case 'CLEAR_PATH':
      return {
        ...state,
        currentPath: [],
      };

    case 'SAVE_PATH': {
      const newPath: TrianglePath = {
        id: `path-${Date.now()}`,
        name: action.name,
        points: [...state.currentPath],
        color: action.color,
      };
      return {
        ...state,
        savedPaths: [...state.savedPaths, newPath],
        currentPath: [],
      };
    }

    case 'LOAD_PATH':
      return {
        ...state,
        currentPath: [...action.path.points],
      };

    case 'DELETE_SAVED_PATH':
      return {
        ...state,
        savedPaths: state.savedPaths.filter((p) => p.id !== action.id),
      };

    case 'SET_PLAYING':
      return { ...state, isPlaying: action.isPlaying };

    case 'SET_TEMPO':
      return { ...state, tempo: action.tempo };

    case 'SET_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
      };

    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | null>(null);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Convenience hooks
export function useCamera() {
  const { state, dispatch } = useApp();
  return {
    camera: state.camera,
    setCamera: (camera: Camera) => dispatch({ type: 'SET_CAMERA', camera }),
    pan: (dx: number, dy: number) => dispatch({ type: 'PAN', dx, dy }),
    zoom: (factor: number, centerX: number, centerY: number) =>
      dispatch({ type: 'ZOOM', factor, centerX, centerY }),
    recenter: () => dispatch({ type: 'RECENTER' }),
  };
}

export function useSettings() {
  const { state, dispatch } = useApp();
  return {
    settings: state.settings,
    setLabelMode: (mode: AppSettings['labelMode']) =>
      dispatch({ type: 'SET_LABEL_MODE', mode }),
    setKeyCenter: (keyCenter: PitchClass) =>
      dispatch({ type: 'SET_KEY_CENTER', keyCenter }),
    toggleSharps: () => dispatch({ type: 'TOGGLE_SHARPS' }),
    toggleTriangles: () => dispatch({ type: 'TOGGLE_TRIANGLES' }),
    togglePatchBoundaries: () => dispatch({ type: 'TOGGLE_PATCH_BOUNDARIES' }),
    toggleMajorTriangles: () => dispatch({ type: 'TOGGLE_MAJOR_TRIANGLES' }),
    toggleMinorTriangles: () => dispatch({ type: 'TOGGLE_MINOR_TRIANGLES' }),
  };
}

export function usePath() {
  const { state, dispatch } = useApp();
  return {
    currentPath: state.currentPath,
    savedPaths: state.savedPaths,
    addTriangleToPath: (rootCell: GridCell, triType: 'major' | 'minor') =>
      dispatch({ type: 'ADD_TRIANGLE_TO_PATH', rootCell, triType }),
    undoPath: () => dispatch({ type: 'UNDO_PATH' }),
    clearPath: () => dispatch({ type: 'CLEAR_PATH' }),
    savePath: (name: string, color: string) =>
      dispatch({ type: 'SAVE_PATH', name, color }),
    loadPath: (path: TrianglePath) => dispatch({ type: 'LOAD_PATH', path }),
    deleteSavedPath: (id: string) => dispatch({ type: 'DELETE_SAVED_PATH', id }),
  };
}

export function usePlayback() {
  const { state, dispatch } = useApp();
  return {
    isPlaying: state.isPlaying,
    tempo: state.tempo,
    setPlaying: (isPlaying: boolean) => dispatch({ type: 'SET_PLAYING', isPlaying }),
    setTempo: (tempo: number) => dispatch({ type: 'SET_TEMPO', tempo }),
  };
}

export function useHover() {
  const { state, dispatch } = useApp();
  return {
    hoveredCell: state.hoveredCell,
    hoveredTriangle: state.hoveredTriangle,
    setHoveredCell: (cell: GridCell | null) =>
      dispatch({ type: 'SET_HOVERED_CELL', cell }),
    setHoveredTriangle: (triangle: { rootCell: GridCell; type: 'major' | 'minor' } | null) =>
      dispatch({ type: 'SET_HOVERED_TRIANGLE', triangle }),
  };
}
