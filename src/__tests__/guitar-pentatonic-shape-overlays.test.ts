import { generateBoxShapePatterns, getPitchClass } from '@/lib/guitar/box-shapes';
import { buildPentatonicShapeOverlays } from '@/lib/guitar/pentatonic-shape-overlays';

const STANDARD_TUNING_PCS = [4, 9, 2, 7, 11, 4]; // E A D G B E
const DEGREE_BY_INTERVAL: Record<number, 'one' | 'two' | 'three' | 'five' | 'six'> = {
  0: 'one',
  2: 'two',
  4: 'three',
  7: 'five',
  9: 'six',
};

function getDegreeAtPosition(
  stringIndex: number,
  fret: number,
  majorRootPitchClass: number
): 'one' | 'two' | 'three' | 'five' | 'six' {
  const normalizedString = ((stringIndex % 6) + 6) % 6;
  const pitchClass = (STANDARD_TUNING_PCS[normalizedString] + fret) % 12;
  const interval = (pitchClass - majorRootPitchClass + 12) % 12;
  const degree = DEGREE_BY_INTERVAL[interval];
  if (!degree) {
    throw new Error(`Unexpected non-pentatonic interval ${interval} at ${stringIndex}:${fret}`);
  }
  return degree;
}

describe('pentatonic shape overlays', () => {
  it('builds rectangle and stack overlays for every E minor pentatonic box', () => {
    const boxes = generateBoxShapePatterns('E', 'pentatonic');

    boxes.forEach((box) => {
      const overlays = buildPentatonicShapeOverlays(box.pattern, 'G');
      const rectangle = overlays.find((overlay) => overlay.id === 'rectangle');
      const stack = overlays.find((overlay) => overlay.id === 'stack');

      expect(rectangle).toBeDefined();
      expect(stack).toBeDefined();
      expect(rectangle?.points).toHaveLength(5);
      expect(stack?.points).toHaveLength(7);
      overlays.forEach((overlay) => {
        expect(overlay.points[0]).toEqual(overlay.points[overlay.points.length - 1]);
      });
    });
  });

  it('uses only note positions that exist inside each pentatonic box pattern', () => {
    const boxes = generateBoxShapePatterns('A', 'pentatonic');
    const majorRootPitchClass = getPitchClass('C');

    boxes.forEach((box) => {
      const overlays = buildPentatonicShapeOverlays(box.pattern, 'C');

      overlays.forEach((overlay) => {
        const allowProjectedNonScalePoint = overlay.id.startsWith('rectangle-ext');
        overlay.points.forEach(([stringIndex, fret]) => {
          if (allowProjectedNonScalePoint) {
            return;
          }
          if (stringIndex >= 0 && stringIndex < box.pattern.length) {
            expect(box.pattern[stringIndex]).toContain(fret);
            return;
          }

          // Edge-overflow points use virtual string indices. They should still
          // resolve to valid major-pentatonic degrees relative to the center.
          expect(() => getDegreeAtPosition(stringIndex, fret, majorRootPitchClass)).not.toThrow();
        });
      });
    });
  });

  it('traces canonical stack boundary in order 2-3-6-2-1-5-2 when a full stack exists', () => {
    const majorRootPitchClass = getPitchClass('G');
    const boxes = generateBoxShapePatterns('E', 'pentatonic');

    boxes.forEach((box) => {
      const overlays = buildPentatonicShapeOverlays(box.pattern, 'G');
      const stack = overlays
        .filter((overlay) => overlay.id.startsWith('stack'))
        .find((overlay) => (
          overlay.points
            .slice(0, -1)
            .every(([stringIndex]) => stringIndex >= 0 && stringIndex <= 5)
        ));
      if (!stack) {
        return;
      }
      const degreeOrder = stack.points.map(([stringIndex, fret]) => (
        getDegreeAtPosition(stringIndex, fret, majorRootPitchClass)
      ));
      expect(degreeOrder).toEqual(['two', 'three', 'six', 'two', 'one', 'five', 'two']);
    });
  });

  it('traces rectangle boundary in order 3-5-1-6-3 for G major pentatonic overlays', () => {
    const majorRootPitchClass = getPitchClass('G');
    const boxes = generateBoxShapePatterns('E', 'pentatonic');

    boxes.forEach((box) => {
      const overlays = buildPentatonicShapeOverlays(box.pattern, 'G');
      const rectangle = overlays.find((overlay) => overlay.id === 'rectangle');
      expect(rectangle).toBeDefined();
      const degreeOrder = rectangle!.points.map(([stringIndex, fret]) => (
        getDegreeAtPosition(stringIndex, fret, majorRootPitchClass)
      ));
      expect(degreeOrder).toEqual(['three', 'five', 'one', 'six', 'three']);
    });
  });

  it('keeps virtual overflow stack points near the local fret window', () => {
    const boxes = generateBoxShapePatterns('G', 'pentatonic');

    boxes.forEach((box) => {
      const overlays = buildPentatonicShapeOverlays(box.pattern, 'Bb');
      const stack = overlays.find((overlay) => overlay.id === 'stack');
      expect(stack).toBeDefined();

      const allFrets = box.pattern.flat();
      const minFret = Math.min(...allFrets);
      const maxFret = Math.max(...allFrets);

      stack!.points.forEach(([stringIndex, fret]) => {
        if (stringIndex < 0 || stringIndex > 5) {
          expect(fret).toBeGreaterThanOrEqual(Math.max(0, minFret - 2));
          expect(fret).toBeLessThanOrEqual(Math.min(24, maxFret + 2));
        }
      });
    });
  });
});
