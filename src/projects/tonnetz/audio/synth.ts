import type { PitchClass, TrianglePathPoint, MidiRange } from '../state/types';
import { DEFAULT_MIDI_RANGE } from '../state/types';
import { clampToRange } from '../core/voicing';

/**
 * Simple WebAudio synthesizer for playing triads
 */

let audioContext: AudioContext | null = null;

// Configurable playback range (can be narrower than the full piano range)
let playbackRange: MidiRange = DEFAULT_MIDI_RANGE;

/**
 * Set the MIDI range for playback clamping
 */
export function setPlaybackRange(range: MidiRange): void {
  playbackRange = range;
}

// Get or create audio context
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

// Pitch class to frequency (A4 = 440 Hz)
function pcToFrequency(pc: PitchClass, octave: number = 4): number {
  const semitonesFromA4 = (pc - 9) + (octave - 4) * 12;
  return 440 * Math.pow(2, semitonesFromA4 / 12);
}

// MIDI note to frequency with range clamping via voicing utilities
function midiToFrequency(midiNote: number): number {
  const clampedMidi = clampToRange(midiNote, playbackRange);
  // MIDI 69 = A4 = 440Hz
  return 440 * Math.pow(2, (clampedMidi - 69) / 12);
}

// Simple ADSR envelope
interface EnvelopeParams {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

const DEFAULT_ENVELOPE: EnvelopeParams = {
  attack: 0.02,
  decay: 0.1,
  sustain: 0.3,
  release: 0.3,
};

/**
 * Play a single note
 */
export function playNote(
  pc: PitchClass,
  octave: number = 4,
  duration: number = 0.5,
  volume: number = 0.3
): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Create oscillator
  const osc = ctx.createOscillator();
  osc.type = 'triangle'; // Softer sound
  osc.frequency.value = pcToFrequency(pc, octave);

  // Create gain for envelope
  const gainNode = ctx.createGain();
  gainNode.gain.value = 0;

  // ADSR envelope
  const env = DEFAULT_ENVELOPE;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume, now + env.attack);
  gainNode.gain.linearRampToValueAtTime(volume * env.sustain, now + env.attack + env.decay);
  gainNode.gain.setValueAtTime(volume * env.sustain, now + duration - env.release);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);

  // Connect and play
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.1);
}

/**
 * Play a triad (3 notes together)
 */
export function playTriad(
  pitchClasses: [PitchClass, PitchClass, PitchClass],
  octave: number = 4,
  duration: number = 0.5,
  volume: number = 0.2
): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Create master gain
  const masterGain = ctx.createGain();
  masterGain.gain.value = volume;
  masterGain.connect(ctx.destination);

  // ADSR envelope for master
  const env = DEFAULT_ENVELOPE;
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(volume, now + env.attack);
  masterGain.gain.linearRampToValueAtTime(volume * env.sustain, now + env.attack + env.decay);
  masterGain.gain.setValueAtTime(volume * env.sustain, now + duration - env.release);
  masterGain.gain.linearRampToValueAtTime(0, now + duration);

  // Play each note of the triad
  pitchClasses.forEach((pc, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';

    // Spread voices across octaves for richer sound
    let noteOctave = octave;
    if (i === 0) noteOctave = octave; // Root
    if (i === 1) noteOctave = octave; // Third
    if (i === 2) noteOctave = octave; // Fifth

    osc.frequency.value = pcToFrequency(pc, noteOctave);

    // Individual note gain
    const noteGain = ctx.createGain();
    noteGain.gain.value = 0.5; // Each note at half volume

    osc.connect(noteGain);
    noteGain.connect(masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.2);
  });
}

/**
 * Play a chord using MIDI note numbers (supports triads and 7th chords)
 */
export function playChordMidi(
  midiPitches: number[],
  duration: number = 0.5,
  volume: number = 0.2
): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Create master gain
  const masterGain = ctx.createGain();
  masterGain.gain.value = volume;
  masterGain.connect(ctx.destination);

  // ADSR envelope for master
  const env = DEFAULT_ENVELOPE;
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(volume, now + env.attack);
  masterGain.gain.linearRampToValueAtTime(volume * env.sustain, now + env.attack + env.decay);
  masterGain.gain.setValueAtTime(volume * env.sustain, now + duration - env.release);
  masterGain.gain.linearRampToValueAtTime(0, now + duration);

  // Play each note of the chord
  const noteVolume = 0.5 / Math.sqrt(midiPitches.length); // Balance volume for more notes
  midiPitches.forEach((midiNote) => {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = midiToFrequency(midiNote);

    // Individual note gain
    const noteGain = ctx.createGain();
    noteGain.gain.value = noteVolume;

    osc.connect(noteGain);
    noteGain.connect(masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.2);
  });
}

/**
 * Play a triad using MIDI note numbers (position-based pitch)
 * @deprecated Use playChordMidi instead for 7th chord support
 */
export function playTriadMidi(
  midiPitches: [number, number, number],
  duration: number = 0.5,
  volume: number = 0.2
): void {
  playChordMidi(midiPitches, duration, volume);
}

/**
 * Play a path of triangles (chords) with timing
 * Supports both triads and 7th chords
 */
export async function playPath(
  path: TrianglePathPoint[],
  tempo: number = 120,
  onStep?: (index: number) => void
): Promise<void> {
  if (path.length === 0) return;

  const ctx = getAudioContext();

  // Resume audio context if suspended (required by browsers)
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  const beatDuration = 60 / tempo; // seconds per beat
  const noteDuration = beatDuration * 0.9; // Slight gap between notes

  for (let i = 0; i < path.length; i++) {
    const point = path[i];

    // Notify callback
    if (onStep) {
      onStep(i);
    }

    // Build the full chord: triad + optional 7th
    const chordPitches: number[] = [...point.midiPitches];
    if (point.seventhMidiPitch !== undefined) {
      chordPitches.push(point.seventhMidiPitch);
    }

    // Play the chord using position-based MIDI pitches
    playChordMidi(chordPitches, noteDuration, 0.25);

    // Wait for next beat
    await new Promise((resolve) => setTimeout(resolve, beatDuration * 1000));
  }

  // Final callback to indicate end
  if (onStep) {
    onStep(-1);
  }
}

/**
 * Play a single chord (for preview on hover/click) - legacy, fixed octave
 */
export function playChordPreview(
  pitchClasses: [PitchClass, PitchClass, PitchClass]
): void {
  playTriad(pitchClasses, 4, 0.3, 0.15);
}

/**
 * Play a single chord using MIDI pitches (position-based preview)
 */
export function playChordPreviewMidi(
  midiPitches: [number, number, number]
): void {
  playTriadMidi(midiPitches, 0.3, 0.15);
}

/**
 * Resume audio context (must be called from user interaction)
 */
export async function initAudio(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}
