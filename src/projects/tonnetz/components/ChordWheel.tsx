import { useEffect, useRef } from 'react';
import { useChordWheel, usePath } from '../state/AppContext';
import type { SeventhQuality } from '../state/types';
import { CHORD_QUALITY_NAMES } from '../core/seventhChords';

// Extended chord options filtered by base triad type
// Major triads can become: maj7 (add M7), dom7 (add m7), or 6 (add M6)
// Minor triads can become: m7 (add m7), mMaj7 (add M7), or m6 (add M6)
// The others (ø7, °7, augMaj7) require changing the 5th, which we don't support
const MAJOR_SEVENTH_QUALITIES: SeventhQuality[] = ['maj7', 'dom7', '6'];
const MINOR_SEVENTH_QUALITIES: SeventhQuality[] = ['min7', 'minMaj7', 'm6'];

// Colors for each extended chord quality - matches their "feel"
export const SEVENTH_QUALITY_COLORS: Record<SeventhQuality, string> = {
  maj7: '#5cb8e8',     // Bright cyan - dreamy, bright
  dom7: '#e8a45c',     // Warm amber - bluesy, tense
  min7: '#a87ed3',     // Soft purple - mellow, jazzy
  minMaj7: '#d35ca8',  // Deep magenta - dark, mysterious
  halfDim7: '#6b9dad', // Muted teal - melancholy
  dim7: '#d35c5c',     // Warm red - tense, dramatic
  augMaj7: '#c8d35c',  // Golden lime - ethereal, unstable
  '6': '#7ed38a',      // Soft green - sweet, nostalgic
  'm6': '#8a7ed3',     // Lavender - bittersweet, jazzy
};

const WHEEL_RADIUS = 60;

export function ChordWheel() {
  const { chordWheel, hideChordWheel, upgradeToSeventh, removeSeventh, setSeventhPreview } = useChordWheel();
  const { currentPath } = usePath();
  const wheelRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    if (!chordWheel) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (wheelRef.current && !wheelRef.current.contains(e.target as Node)) {
        hideChordWheel();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        hideChordWheel();
      }
    };

    // Delay adding listener to avoid immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [chordWheel, hideChordWheel]);

  if (!chordWheel) return null;

  const { pathIndex, position } = chordWheel;
  const chord = currentPath[pathIndex];
  if (!chord) return null;

  const hasExistingSeventh = !!chord.seventhQuality;

  // Get valid 7th qualities based on base triad type
  const validQualities = chord.type === 'major' ? MAJOR_SEVENTH_QUALITIES : MINOR_SEVENTH_QUALITIES;

  // Calculate positions for wheel items in a circle
  const getItemPosition = (index: number, total: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2; // Start from top
    return {
      x: Math.cos(angle) * WHEEL_RADIUS,
      y: Math.sin(angle) * WHEEL_RADIUS,
    };
  };

  const handleSelectQuality = (quality: SeventhQuality) => {
    upgradeToSeventh(pathIndex, quality);
  };

  const handleRemoveSeventh = () => {
    removeSeventh(pathIndex);
  };

  return (
    <>
      {/* Backdrop with localized blur effect centered on wheel */}
      <div
        className="chord-wheel-backdrop"
        onClick={hideChordWheel}
        style={{ left: position.x, top: position.y }}
      />

      <div
        ref={wheelRef}
        className="chord-wheel"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {/* Center button - shows current chord or remove option */}
        <button
          className={`chord-wheel-center ${hasExistingSeventh ? 'has-seventh' : ''}`}
          onClick={hasExistingSeventh ? handleRemoveSeventh : hideChordWheel}
          onMouseEnter={() => setSeventhPreview(null)}
          title={hasExistingSeventh ? 'Remove 7th (click to revert to triad)' : 'Current chord'}
        >
          {hasExistingSeventh ? '×' : (chord.type === 'major' ? 'M' : 'm')}
        </button>

        {/* Radial buttons for each valid 7th quality */}
        {validQualities.map((quality, index) => {
          const pos = getItemPosition(index, validQualities.length);
          const isSelected = chord.seventhQuality === quality;

          const color = SEVENTH_QUALITY_COLORS[quality];
          return (
            <button
              key={quality}
              className={`chord-wheel-item ${isSelected ? 'selected' : ''}`}
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                backgroundColor: isSelected ? color : `${color}33`,
                borderColor: color,
                color: isSelected ? '#fff' : color,
              }}
              onClick={() => handleSelectQuality(quality)}
              onMouseEnter={() => setSeventhPreview(quality)}
              onMouseLeave={() => setSeventhPreview(null)}
              title={getQualityDescription(quality)}
            >
              {CHORD_QUALITY_NAMES[quality]}
            </button>
          );
        })}
      </div>
    </>
  );
}

function getQualityDescription(quality: SeventhQuality): string {
  const descriptions: Record<SeventhQuality, string> = {
    maj7: 'Major 7th - bright, dreamy',
    min7: 'Minor 7th - mellow, jazzy',
    dom7: 'Dominant 7th - bluesy, tense',
    minMaj7: 'Minor-Major 7th - dark, mysterious',
    halfDim7: 'Half-Diminished 7th (ø7) - melancholy',
    dim7: 'Diminished 7th (°7) - tense, dramatic',
    augMaj7: 'Augmented Major 7th - ethereal, unstable',
    '6': 'Major 6th - sweet, nostalgic',
    'm6': 'Minor 6th - bittersweet, jazzy',
  };
  return descriptions[quality];
}
