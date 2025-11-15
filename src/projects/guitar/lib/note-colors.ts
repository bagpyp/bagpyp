/**
 * Note color mapping based on the Circle of Fifths
 *
 * Maps all 12 chromatic notes to distinct colors arranged around a color wheel,
 * following the circle of fifths progression for musical coherence.
 *
 * Circle of Fifths order: C → G → D → A → E → B → F#/Gb → Db → Ab → Eb → Bb → F → C
 *
 * This creates smooth harmonic relationships between adjacent colors:
 * - Related keys (perfect fifths apart) have similar hues
 * - Distant keys have contrasting colors
 */

/**
 * Note pitch classes mapped to their enharmonic equivalents
 * Uses sharps as canonical names, but maps flats to the same pitch class
 */
const NOTE_TO_PITCH_CLASS: Record<string, number> = {
  'C': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4,
  'F': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11,
};

/**
 * Circle of fifths color palette
 * Each color is carefully chosen to be visually distinct and aesthetically pleasing
 *
 * Colors progress through the spectrum following the circle of fifths:
 * C (red) → G (orange) → D (yellow) → A (lime) → E (green) → B (cyan)
 * → F#/Gb (blue) → C#/Db (indigo) → G#/Ab (violet) → D#/Eb (magenta)
 * → A#/Bb (pink) → F (red-orange)
 */
const CIRCLE_OF_FIFTHS_COLORS: Record<number, { bg: string; text: string; name: string }> = {
  0:  { bg: '#ef4444', text: '#ffffff', name: 'C' },   // Red - Starting point
  7:  { bg: '#f97316', text: '#ffffff', name: 'G' },   // Orange
  2:  { bg: '#eab308', text: '#000000', name: 'D' },   // Yellow (dark text for contrast)
  9:  { bg: '#84cc16', text: '#000000', name: 'A' },   // Lime
  4:  { bg: '#10b981', text: '#ffffff', name: 'E' },   // Green
  11: { bg: '#06b6d4', text: '#000000', name: 'B' },   // Cyan
  6:  { bg: '#3b82f6', text: '#ffffff', name: 'F#/Gb' }, // Blue
  1:  { bg: '#6366f1', text: '#ffffff', name: 'C#/Db' }, // Indigo
  8:  { bg: '#8b5cf6', text: '#ffffff', name: 'G#/Ab' }, // Violet
  3:  { bg: '#d946ef', text: '#ffffff', name: 'D#/Eb' }, // Magenta
  10: { bg: '#ec4899', text: '#ffffff', name: 'A#/Bb' }, // Pink
  5:  { bg: '#f43f5e', text: '#ffffff', name: 'F' },   // Rose/Red-pink
};

/**
 * Get the color for a note name
 *
 * @param noteName - Note name (e.g., "C", "C#", "Db", "F#")
 * @returns Color object with background, text color, and canonical name
 */
export function getNoteColor(noteName: string): { bg: string; text: string; name: string } {
  // Extract just the note name without octave (e.g., "C4" → "C", "F#3" → "F#")
  const noteOnly = noteName.replace(/[0-9]/g, '');

  const pitchClass = NOTE_TO_PITCH_CLASS[noteOnly];

  if (pitchClass === undefined) {
    console.warn(`Unknown note name: ${noteName}, defaulting to gray`);
    return { bg: '#6b7280', text: '#ffffff', name: noteOnly };
  }

  return CIRCLE_OF_FIFTHS_COLORS[pitchClass];
}

/**
 * Get all 12 chromatic note colors in circle of fifths order
 * Useful for creating comprehensive legends
 *
 * @returns Array of pitch classes in circle of fifths order with their colors
 */
export function getAllNoteColorsInCircleOfFifths(): Array<{
  pitchClass: number;
  bg: string;
  text: string;
  name: string;
}> {
  // Circle of fifths order starting from C
  const circleOrder = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];

  return circleOrder.map(pc => ({
    pitchClass: pc,
    ...CIRCLE_OF_FIFTHS_COLORS[pc],
  }));
}

/**
 * Get colors for just the notes present in a given key's scale
 *
 * @param keyNotes - Array of note names in the key (e.g., ["C", "D", "E", "F", "G", "A", "B"])
 * @returns Array of colors for those notes in circle of fifths order
 */
export function getKeyNoteColors(keyNotes: string[]): Array<{
  noteName: string;
  bg: string;
  text: string;
}> {
  const noteSet = new Set(keyNotes.map(n => n.replace(/[0-9]/g, '')));

  return getAllNoteColorsInCircleOfFifths()
    .filter(({ name }) => {
      // Check if this note (or its enharmonic) is in the key
      const variants = name.split('/');
      return variants.some(v => noteSet.has(v));
    })
    .map(({ name, bg, text }) => ({
      noteName: name.split('/')[0], // Use first variant (sharp notation)
      bg,
      text,
    }));
}

/**
 * Get a color for a pitch class number (0-11)
 *
 * @param pitchClass - Pitch class (0=C, 1=C#, 2=D, etc.)
 * @returns Color object
 */
export function getPitchClassColor(pitchClass: number): { bg: string; text: string; name: string } {
  return CIRCLE_OF_FIFTHS_COLORS[pitchClass % 12];
}

/**
 * Convert hex color to HSL
 *
 * @param hex - Hex color string (e.g., "#ef4444")
 * @returns Object with h (0-360), s (0-100), l (0-100)
 */
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse RGB
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to hex color
 *
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns Hex color string (e.g., "#ef4444")
 */
function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Get a color for a note with octave-based brightness/saturation adjustment
 *
 * Lower octaves are rendered darker and less saturated
 * Higher octaves are rendered brighter and more saturated
 *
 * Guitar range is typically octaves 2-5:
 * - Octave 2: Darkest (6th string low frets)
 * - Octave 3: Medium-dark
 * - Octave 4: Medium-bright
 * - Octave 5: Brightest (1st string high frets)
 *
 * @param pitchClass - Pitch class (0-11)
 * @param octave - Octave number (typically 2-5 for guitar)
 * @param options - Optional configuration
 * @param options.includeOctaves - Whether to apply octave-based color shift (default: true)
 * @returns Color object with octave-adjusted colors
 */
export function getNoteColorWithOctave(
  pitchClass: number,
  octave: number,
  options: { includeOctaves?: boolean } = {}
): { bg: string; text: string; name: string } {
  const baseColor = CIRCLE_OF_FIFTHS_COLORS[pitchClass % 12];

  // If octave coloring is disabled, return base color
  if (options.includeOctaves === false) {
    return baseColor;
  }

  // Convert base color to HSL
  const hsl = hexToHSL(baseColor.bg);

  // Apply octave-based adjustments
  // Octave 2: -15% lightness, -20% saturation (darker, duller)
  // Octave 3: -5% lightness, -10% saturation (slightly darker)
  // Octave 4: +5% lightness, +5% saturation (slightly brighter)
  // Octave 5: +15% lightness, +10% saturation (brighter, more vivid)

  let lightnessAdjust = 0;
  let saturationAdjust = 0;

  switch (octave) {
    case 2:
      lightnessAdjust = -15;
      saturationAdjust = -20;
      break;
    case 3:
      lightnessAdjust = -5;
      saturationAdjust = -10;
      break;
    case 4:
      lightnessAdjust = 5;
      saturationAdjust = 5;
      break;
    case 5:
      lightnessAdjust = 15;
      saturationAdjust = 10;
      break;
    default:
      // For octaves outside typical range, extrapolate
      if (octave < 2) {
        lightnessAdjust = -15 - (2 - octave) * 10;
        saturationAdjust = -20 - (2 - octave) * 10;
      } else if (octave > 5) {
        lightnessAdjust = 15 + (octave - 5) * 10;
        saturationAdjust = 10 + (octave - 5) * 5;
      }
  }

  // Apply adjustments with clamping
  const newL = Math.max(10, Math.min(90, hsl.l + lightnessAdjust));
  const newS = Math.max(20, Math.min(100, hsl.s + saturationAdjust));

  // Convert back to hex
  const newBg = hslToHex(hsl.h, newS, newL);

  return {
    bg: newBg,
    text: baseColor.text, // Keep original text color for consistency
    name: baseColor.name,
  };
}
