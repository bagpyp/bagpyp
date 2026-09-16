import {
  MAJOR_MODE_DEFINITIONS,
  generateMajorScaleModeRoutes,
  generateMajorScaleRoute,
  getRouteStringLoads,
  type LaunchCount,
} from '@/lib/guitar/major-scale-runs';
import { generateBoxShapePatterns, getPitchClass } from '@/lib/guitar/box-shapes';

const MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

describe('major scale two-octave routes', () => {
  it.each(MAJOR_KEYS)('generates 21 playable routes for %s major', (key) => {
    const modeGroups = generateMajorScaleModeRoutes(key);
    const routes = modeGroups.flatMap((group) => group.routes);

    expect(modeGroups).toHaveLength(7);
    expect(routes).toHaveLength(21);

    routes.forEach((route) => {
      expect(route.notes).toHaveLength(15);
      expect(route.notes[14].midi - route.notes[0].midi).toBe(24);
      expect(route.notes.map((note) => note.midi)).toEqual(
        [...route.notes.map((note) => note.midi)].sort((a, b) => a - b)
      );
      expect(new Set(route.notes.map((note) => note.midi)).size).toBe(15);
      expect(route.notes.every((note) => note.fret >= 0 && note.fret <= 24)).toBe(true);
      expect(route.pattern.map((frets) => frets.length)).toEqual(
        getRouteStringLoads(route.hostModeIndex, route.launchCount)
      );
      expect(route.rootPositions).toHaveLength(3);
      expect(route.notes.filter((note) => note.isTonic).map((note) => note.step)).toEqual([1, 8, 15]);
    });
  });

  it.each(MAJOR_KEYS)('keeps every %s-major route inside its rendered 17-note host box', (key) => {
    const boxes = generateBoxShapePatterns(key, 'major');
    const routes = generateMajorScaleModeRoutes(key).flatMap((group) => group.routes);

    routes.forEach((route) => {
      const host = boxes[route.hostModeIndex];
      const lowEIndex = 3 - route.launchCount;
      const shift = route.startFret - host.pattern[0][lowEIndex];
      const hostPositions = new Set<string>();

      expect(Math.abs(shift) % 12).toBe(0);
      host.pattern.forEach((frets, stringIndex) => {
        frets.forEach((fret) => hostPositions.add(`${stringIndex}:${fret + shift}`));
      });

      route.notes.forEach((note) => {
        expect(hostPositions.has(`${note.stringIndex}:${note.fret}`)).toBe(true);
      });
    });
  });

  it.each(MAJOR_KEYS)('keeps every %s route spelling enharmonically correct', (key) => {
    generateMajorScaleModeRoutes(key).flatMap((group) => group.routes).forEach((route) => {
      route.notes.forEach((note) => {
        expect(note.pitchClass).toBe(getPitchClass(note.noteName));
      });
    });
  });

  it('keeps the same pitches while changing only the string assignment', () => {
    const routes = generateMajorScaleModeRoutes('G')[1].routes;
    const midiRoutes = routes.map((route) => route.notes.map((note) => note.midi));

    expect(midiRoutes[1]).toEqual(midiRoutes[0]);
    expect(midiRoutes[2]).toEqual(midiRoutes[0]);
    expect(routes.map((route) => route.pattern)).not.toEqual([
      routes[0].pattern,
      routes[0].pattern,
      routes[0].pattern,
    ]);
  });

  it('rotates through the expected modal interval formulas', () => {
    generateMajorScaleModeRoutes('G').forEach((group, modeIndex) => {
      group.routes.forEach((route) => {
        const rootMidi = route.notes[0].midi;
        const firstOctaveOffsets = route.notes.slice(0, 7).map((note) => note.midi - rootMidi);
        expect(firstOctaveOffsets).toEqual([...MAJOR_MODE_DEFINITIONS[modeIndex].intervals]);
        expect(route.notes.slice(0, 7).map((note) => note.degreeLabel)).toEqual(
          [...MAJOR_MODE_DEFINITIONS[modeIndex].degreeLabels]
        );
      });
    });
  });

  it('uses the canonical two-back, previous, and home host positions', () => {
    generateMajorScaleModeRoutes('G').forEach((group) => {
      group.routes.forEach((route) => {
        expect(route.hostModeIndex).toBe((group.modeIndex + route.launchCount - 3 + 7) % 7);
      });
    });

    const aDorian = generateMajorScaleModeRoutes('G')[1].routes;
    expect(aDorian.map((route) => `${route.hostTonicName} ${route.hostModeName}`)).toEqual([
      'F# Locrian',
      'G Ionian',
      'A Dorian',
    ]);

    const gIonian = generateMajorScaleModeRoutes('G')[0].routes;
    expect(gIonian.map((route) => `${route.hostTonicName} ${route.hostModeName}`)).toEqual([
      'E Aeolian',
      'F# Locrian',
      'G Ionian',
    ]);
  });

  it('resolves the A Dorian examples as strict ascending routes', () => {
    const one = generateMajorScaleRoute('G', 1, 1);
    const two = generateMajorScaleRoute('G', 1, 2);
    const three = generateMajorScaleRoute('G', 1, 3);

    expect(one.notes.slice(0, 4).map(({ stringNumber, fret, noteName }) => (
      `s${stringNumber}f${fret}:${noteName}`
    ))).toEqual(['s6f5:A', 's5f2:B', 's5f3:C', 's5f5:D']);

    expect(two.notes.slice(0, 3).map(({ stringNumber, fret, noteName }) => (
      `s${stringNumber}f${fret}:${noteName}`
    ))).toEqual(['s6f5:A', 's6f7:B', 's5f3:C']);

    expect(three.notes.slice(0, 3).map(({ stringNumber, fret, noteName }) => (
      `s${stringNumber}f${fret}:${noteName}`
    ))).toEqual(['s6f5:A', 's6f7:B', 's6f8:C']);

    const byString = (route: typeof one) => route.pattern
      .map((frets, stringIndex) => `s${6 - stringIndex}:${frets.join(',')}`);
    expect(byString(one)).toEqual([
      's6:5', 's5:2,3,5', 's4:2,4,5', 's3:2,4,5', 's2:3,5', 's1:2,3,5',
    ]);
    expect(byString(two)).toEqual([
      's6:5,7', 's5:3,5,7', 's4:4,5,7', 's3:4,5,7', 's2:5,7', 's1:3,5',
    ]);
    expect(byString(three)).toEqual([
      's6:5,7,8', 's5:5,7,9', 's4:5,7,9', 's3:5,7', 's2:5,7,8', 's1:5',
    ]);
  });

  it('uses the app-native tonic-spine geometries and ends on high E', () => {
    ([1, 2, 3] as LaunchCount[]).forEach((launchCount) => {
      const route = generateMajorScaleRoute('G', 1, launchCount);
      const root = route.rootPositions;

      if (launchCount === 1) {
        expect(root).toEqual([[0, 5], [3, 2], [5, 5]]);
      } else {
        expect(root).toEqual([[0, 5], [2, 7], [5, 5]]);
      }
    });
  });

  it('keeps the host box two-note string inside each 15-note slice', () => {
    const aDorian = generateMajorScaleModeRoutes('G')[1].routes;
    expect(aDorian.map((route) => route.stringLoads)).toEqual([
      [1, 3, 3, 3, 2, 3],
      [2, 3, 3, 3, 2, 2],
      [3, 3, 3, 2, 3, 1],
    ]);
  });

  it('raises E, F, and F-sharp tonics to a shared playable register', () => {
    const routes = generateMajorScaleModeRoutes('C').flatMap((group) => group.routes);
    const startsByTonic = new Map(routes.map((route) => [route.tonicName, route.startFret]));

    expect(startsByTonic.get('E')).toBe(12);
    expect(startsByTonic.get('F')).toBe(13);
    expect(generateMajorScaleModeRoutes('G')[6].routes[0].startFret).toBe(14);
  });
});
