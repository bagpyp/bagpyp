import {
  getDisplayOrderedBoxPatterns,
  generateBoxShapePatterns,
  getPitchClass,
  getRelativeMajorKeyFromMinor,
  getRelativeMinorKeyFromMajor,
  normalizeMajorKeyName,
} from '@/lib/guitar/box-shapes';

const STANDARD_TUNING_PCS = [4, 9, 2, 7, 11, 4]; // E A D G B E

function pitchClassAt(stringIndex: number, fret: number): number {
  return (STANDARD_TUNING_PCS[stringIndex] + fret) % 12;
}

describe('box shape generation', () => {
  describe('five major boxes', () => {
    const fiveBoxes = (key: string) => generateBoxShapePatterns(key, 'major', { majorBoxCount: 5 });

    it('computes the five A-minor positions, folding complete boxes by an octave', () => {
      const boxes = fiveBoxes('C');
      expect(boxes.map((box) => box.modeName)).toEqual([
        'Aeolian', 'Ionian', 'Dorian', 'Lydian', 'Mixolydian',
      ]);
      expect(boxes.map((box) => box.shapeRootNote)).toEqual(['A', 'C', 'D', 'F', 'G']);
      expect(boxes.map((box) => box.pattern)).toEqual([
        [[5, 7, 8], [5, 7, 8], [5, 7], [4, 5, 7], [5, 6, 8], [5, 7, 8]],
        [[7, 8, 10], [7, 8, 10], [7, 9, 10], [7, 9, 10], [8, 10], [7, 8, 10]],
        [[10, 12, 13], [10, 12], [9, 10, 12], [9, 10, 12], [10, 12, 13], [10, 12, 13]],
        [[0, 1, 3], [0, 2, 3], [0, 2, 3], [0, 2], [0, 1, 3], [0, 1, 3]],
        [[3, 5], [2, 3, 5], [2, 3, 5], [2, 4, 5], [3, 5, 6], [3, 5]],
      ]);
      expect(getDisplayOrderedBoxPatterns(boxes, 'major').map((box) => box.shapeNumber))
        .toEqual([4, 5, 1, 2, 3]);
    });

    it('moves E minor intact to fret 12 instead of dropping the F# behind the nut', () => {
      const aeolian = fiveBoxes('G')[0];
      expect(aeolian.pattern).toEqual([
        [12, 14, 15], [12, 14, 15], [12, 14], [11, 12, 14], [12, 13, 15], [12, 14, 15],
      ]);
      expect(aeolian.windowStart).toBe(11);
      expect(aeolian.windowEnd).toBe(15);
      expect(fiveBoxes('Ab')[0].pattern[3]).toEqual([0, 1, 3]); // F minor can use open G.
      expect(fiveBoxes('A')[0].pattern[0]).toEqual([2, 4, 5]);
      expect(fiveBoxes('A')[0].pattern[3]).toEqual([1, 2, 4]);
    });

    it('places the G Ionian B on the A string behind the next starting point', () => {
      const ionian = fiveBoxes('G')[1];
      expect(ionian.pattern[0]).toEqual([2, 3, 5]); // F# below the G anchor.
      expect(ionian.pattern[1]).toEqual([2, 3, 5]);
    });

    it.each(['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'])(
      'preserves the pentatonic skeleton and continuous diatonic runs in %s',
      (key) => {
        const majorIntervals = [0, 2, 4, 5, 7, 9, 11];
        const midiTuning = [40, 45, 50, 55, 59, 64];
        const majorRoot = getPitchClass(key);
        const skeletons = generateBoxShapePatterns(getRelativeMinorKeyFromMajor(key), 'pentatonic');
        const boxes = fiveBoxes(key);
        expect(boxes).toHaveLength(5);
        boxes.forEach((box, index) => {
          const skeleton = skeletons[index];
          expect(box.pattern[5]).toEqual(box.pattern[0]);
          expect(box.windowStart).toBe(Math.min(...box.pattern.flat()));
          expect(box.windowEnd).toBe(Math.max(...box.pattern.flat()));
          const octaveShift = box.pattern[0].find((fret) =>
            (fret - skeleton.pattern[0][0]) % 12 === 0
          )! - skeleton.pattern[0][0];
          expect(Math.abs(octaveShift % 12)).toBe(0);
          box.pattern.forEach((frets, stringIndex) => {
            expect(frets.length).toBeGreaterThanOrEqual(2);
            expect(frets.length).toBeLessThanOrEqual(3);
            expect(frets[frets.length - 1] - frets[0]).toBeLessThanOrEqual(3);
            skeleton.pattern[stringIndex].forEach((fret) => expect(frets).toContain(fret + octaveShift));
            frets.forEach((fret) => {
              expect(fret).toBeGreaterThanOrEqual(0);
              expect(fret).toBeLessThanOrEqual(24);
              expect(majorIntervals).toContain((pitchClassAt(stringIndex, fret) - majorRoot + 12) % 12);
            });
          });
          const pitches = box.pattern.flatMap((frets, s) => frets.map((fret) => midiTuning[s] + fret));
          for (let i = 1; i < pitches.length; i++) {
            const nextInterval = majorIntervals.find((interval) =>
              (majorRoot + interval + 12) % 12 === pitches[i - 1] % 12
            )!;
            const degree = majorIntervals.indexOf(nextInterval);
            const step = (majorIntervals[(degree + 1) % 7] - nextInterval + 12) % 12;
            expect(pitches[i] - pitches[i - 1]).toBe(step);
          }
          expect(box.rootPositions).toEqual(box.pattern.flatMap((frets, s) =>
            frets.filter((fret) => pitchClassAt(s, fret) === box.shapeRootPitchClass)
              .map((fret) => [s, fret])
          ));
        });
      }
    );
  });

  it('generates seven major mode boxes with expected mode names', () => {
    const patterns = generateBoxShapePatterns('C', 'major');

    expect(patterns).toHaveLength(7);
    expect(patterns.map((p) => p.modeName)).toEqual([
      'Ionian',
      'Dorian',
      'Phrygian',
      'Lydian',
      'Mixolydian',
      'Aeolian',
      'Locrian',
    ]);

    patterns.forEach((pattern, index) => {
      expect(pattern.shapeNumber).toBe(index + 1);
      expect(pattern.pattern).toHaveLength(6);
      pattern.pattern.forEach((stringFrets) => {
        expect(stringFrets.length).toBeGreaterThan(0);
        expect(stringFrets.length).toBeLessThanOrEqual(3);
      });
    });
  });

  it('uses expected 2NPS string map for major boxes', () => {
    // String indexes: 0=low E, 1=A, 2=D, 3=G, 4=B, 5=high E
    const twoNpsStringByBox = [4, 3, 3, 4, 4, 4, 4];
    const patterns = generateBoxShapePatterns('G', 'major');

    patterns.forEach((pattern, boxIndex) => {
      const twoNpsString = twoNpsStringByBox[boxIndex];
      pattern.pattern.forEach((stringFrets, stringIndex) => {
        if (stringIndex === twoNpsString) {
          expect(stringFrets.length).toBe(2);
        } else {
          expect(stringFrets.length).toBe(3);
        }
      });
    });
  });

  it('shifts major boxes to the right by a constant amount', () => {
    const patterns = generateBoxShapePatterns('G', 'major');
    const starts = patterns.map((p) => p.windowStart);

    expect(starts).toEqual([3, 5, 7, 9, 11, 13, 15]);

    for (let i = 1; i < starts.length; i++) {
      expect(starts[i] - starts[i - 1]).toBe(2);
    }
  });

  it('keeps G on high E but not on B in G Ionian box 1', () => {
    const box1 = generateBoxShapePatterns('G', 'major')[0];
    const gPc = getPitchClass('G');

    const bStringHasG = box1.pattern[4].some((fret) => pitchClassAt(4, fret) === gPc);
    const highEHasG = box1.pattern[5].some((fret) => pitchClassAt(5, fret) === gPc);

    expect(bStringHasG).toBe(false);
    expect(highEHasG).toBe(true);
  });

  it('keeps C on low E in A Dorian box 2 for G major system', () => {
    const box2 = generateBoxShapePatterns('G', 'major')[1];
    const expected = new Set([getPitchClass('A'), getPitchClass('B'), getPitchClass('C')]);

    const lowEStringPcs = new Set(box2.pattern[0].map((fret) => pitchClassAt(0, fret)));

    expect(lowEStringPcs).toEqual(expected);
  });

  it('connects B Phrygian to C Lydian on low E with shared tail notes', () => {
    const patterns = generateBoxShapePatterns('G', 'major');
    const box3 = patterns[2]; // B Phrygian
    const box4 = patterns[3]; // C Lydian

    const box3LowE = box3.pattern[0];
    const box4LowE = box4.pattern[0];
    const cPc = getPitchClass('C');
    const dPc = getPitchClass('D');
    const ePc = getPitchClass('E');
    const box4LowEPcs = box4LowE.map((fret) => pitchClassAt(0, fret));

    expect(box4LowE[0]).toBe(box3LowE[1]);
    expect(box4LowE[1]).toBe(box3LowE[2]);
    expect(box4LowEPcs).toEqual([cPc, dPc, ePc]);
  });

  it('continues from D string to G string in C Lydian box 4 as E F# G', () => {
    const box4 = generateBoxShapePatterns('G', 'major')[3];

    const dStringPcs = box4.pattern[2].map((fret) => pitchClassAt(2, fret));
    const gStringPcs = box4.pattern[3].map((fret) => pitchClassAt(3, fret));

    expect(dStringPcs).toEqual([
      getPitchClass('B'),
      getPitchClass('C'),
      getPitchClass('D'),
    ]);
    expect(gStringPcs).toEqual([
      getPitchClass('E'),
      getPitchClass('F#'),
      getPitchClass('G'),
    ]);
  });

  it('keeps high E identical to low E on every major box', () => {
    const patterns = generateBoxShapePatterns('G', 'major');

    patterns.forEach((box) => {
      expect(box.pattern[5]).toEqual(box.pattern[0]);
    });
  });

  it('keeps late G major boxes out of open position', () => {
    const patterns = generateBoxShapePatterns('G', 'major');
    const lateBoxes = patterns.filter((box) => box.shapeNumber >= 6);

    lateBoxes.forEach((box) => {
      box.pattern.forEach((stringFrets) => {
        expect(Math.min(...stringFrets)).toBeGreaterThanOrEqual(12);
      });
    });
  });

  it('generates five minor pentatonic boxes with compact per-string note counts', () => {
    const patterns = generateBoxShapePatterns('A', 'pentatonic');

    expect(patterns).toHaveLength(5);

    patterns.forEach((pattern) => {
      expect(pattern.pattern).toHaveLength(6);
      pattern.pattern.forEach((stringFrets) => {
        expect(stringFrets.length).toBe(2);
      });
    });
  });

  it('connects pentatonic boxes so each string starts from previous box second note', () => {
    const patterns = generateBoxShapePatterns('E', 'pentatonic');

    for (let boxIndex = 1; boxIndex < patterns.length; boxIndex++) {
      for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
        expect(patterns[boxIndex].pattern[stringIndex][0]).toBe(
          patterns[boxIndex - 1].pattern[stringIndex][1]
        );
      }
    }
  });

  it('generates five blues boxes by default and validates blue-note markers', () => {
    const key = 'E';
    const patterns = generateBoxShapePatterns(key, 'blues');
    const rootPc = getPitchClass(key);

    expect(patterns).toHaveLength(5);

    patterns.forEach((pattern) => {
      expect(pattern.blueNotePositions.length).toBeGreaterThan(0);

      pattern.blueNotePositions.forEach(([stringIndex, fret]) => {
        const pc = pitchClassAt(stringIndex, fret);
        const interval = (pc - rootPc + 12) % 12;
        expect(interval).toBe(6); // b5 blue note
      });

      // Rule: blues is 2NPS, except strings that contain a displayed blue note are 3NPS.
      pattern.pattern.forEach((stringFrets, stringIndex) => {
        const blueOnString = pattern.blueNotePositions.filter(([s]) => s === stringIndex);
        if (blueOnString.length > 0) {
          expect(stringFrets.length).toBe(3);
          expect(stringFrets.some((fret) => blueOnString.some(([, blueFret]) => blueFret === fret))).toBe(true);
        } else {
          expect(stringFrets.length).toBe(2);
        }
      });
    });
  });

  it('builds blues as pentatonic plus blue notes with expected per-box blue-note counts', () => {
    const key = 'E';
    const pentatonic = generateBoxShapePatterns(key, 'pentatonic');
    const blues = generateBoxShapePatterns(key, 'blues');
    const expectedBlueCounts = [2, 3, 3, 2, 2];

    blues.forEach((box, boxIndex) => {
      const base = pentatonic[boxIndex];
      expect(box.blueNotePositions.length).toBe(expectedBlueCounts[boxIndex]);

      for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
        base.pattern[stringIndex].forEach((fret) => {
          expect(box.pattern[stringIndex]).toContain(fret);
        });
      }
    });
  });

  it('places one blue note on high E in blues boxes 2 and 3', () => {
    const blues = generateBoxShapePatterns('E', 'blues');

    // string index 5 = high E
    expect(blues[1].blueNotePositions.some(([stringIndex]) => stringIndex === 5)).toBe(true);
    expect(blues[2].blueNotePositions.some(([stringIndex]) => stringIndex === 5)).toBe(true);
  });

  it('keeps E blues box 4 anchored on low E B and adds A# on the B string', () => {
    const bluesBox4 = generateBoxShapePatterns('E', 'blues')[3];
    const lowEString = bluesBox4.pattern[0];
    const bString = bluesBox4.pattern[4];

    expect(lowEString[0]).toBe(7); // B on low E, not A#
    expect(bluesBox4.blueNotePositions).toEqual(
      expect.arrayContaining([
        [4, 11], // A# on B string
      ])
    );
    expect(bString).toContain(11);
  });

  it('keeps open strings and both A# blue notes in E blues box 1', () => {
    const box1 = generateBoxShapePatterns('E', 'blues')[0];

    // All six strings should include open position in open E blues box.
    box1.pattern.forEach((stringFrets) => {
      expect(stringFrets[0]).toBe(0);
    });

    // E blues has two A# notes in box 1 (A string fret 1, G string fret 3).
    expect(box1.blueNotePositions).toEqual(
      expect.arrayContaining([
        [1, 1],
        [3, 3],
      ])
    );
  });

  it('can include an experimental sixth blues box', () => {
    const patterns = generateBoxShapePatterns('G', 'blues', {
      includeExperimentalBluesShape: true,
    });

    expect(patterns).toHaveLength(6);
    expect(patterns[5].label).toContain('Box 6');
  });

  it('marks root positions using each shape root pitch class', () => {
    const patterns = generateBoxShapePatterns('D', 'major');

    patterns.forEach((pattern) => {
      expect(pattern.rootPositions.length).toBeGreaterThan(0);
      pattern.rootPositions.forEach(([stringIndex, fret]) => {
        const pc = pitchClassAt(stringIndex, fret);
        expect(pc).toBe(pattern.shapeRootPitchClass);
      });
    });
  });

  it('maps major keys to expected relative minors for box families', () => {
    expect(getRelativeMinorKeyFromMajor('G')).toBe('E');
    expect(getRelativeMinorKeyFromMajor('C')).toBe('A');
    expect(getRelativeMinorKeyFromMajor('Db')).toBe('Bb');
  });

  it('maps minor keys to expected relative majors for box families', () => {
    expect(getRelativeMajorKeyFromMinor('E')).toBe('G');
    expect(getRelativeMajorKeyFromMinor('A')).toBe('C');
    expect(getRelativeMajorKeyFromMinor('Bb')).toBe('Db');
  });

  it('normalizes enharmonic major names to circle-of-fifths keys', () => {
    expect(normalizeMajorKeyName('C#')).toBe('Db');
    expect(normalizeMajorKeyName('D#')).toBe('Eb');
    expect(normalizeMajorKeyName('A#')).toBe('Bb');
    expect(normalizeMajorKeyName('F#')).toBe('F#');
  });

  it('orders non-A pentatonic and blues display by neck position (left to right)', () => {
    const pentatonic = generateBoxShapePatterns('E', 'pentatonic');
    const blues = generateBoxShapePatterns('E', 'blues');
    const pentatonicOrdered = getDisplayOrderedBoxPatterns([...pentatonic].reverse(), 'pentatonic');
    const bluesOrdered = getDisplayOrderedBoxPatterns([...blues].reverse(), 'blues');

    [pentatonicOrdered, bluesOrdered].forEach((ordered) => {
      for (let i = 1; i < ordered.length; i++) {
        const prev = ordered[i - 1];
        const curr = ordered[i];
        expect(curr.windowStart).toBeGreaterThanOrEqual(prev.windowStart);
        if (curr.windowStart === prev.windowStart) {
          expect(curr.windowEnd).toBeGreaterThanOrEqual(prev.windowEnd);
        }
      }
    });
  });

  it('starts A minor pentatonic/blues from higher boxes (4 then 5)', () => {
    const aPentatonic = generateBoxShapePatterns('A', 'pentatonic');
    const aBlues = generateBoxShapePatterns('A', 'blues');

    const orderedPent = getDisplayOrderedBoxPatterns(aPentatonic, 'pentatonic');
    const orderedBlues = getDisplayOrderedBoxPatterns(aBlues, 'blues');

    expect(orderedPent.map((box) => box.shapeNumber)).toEqual([4, 5, 1, 2, 3]);
    expect(orderedBlues.map((box) => box.shapeNumber)).toEqual([4, 5, 1, 2, 3]);

    for (let i = 1; i < orderedPent.length; i++) {
      expect(orderedPent[i].windowStart).toBeGreaterThanOrEqual(orderedPent[i - 1].windowStart);
    }
    for (let i = 1; i < orderedBlues.length; i++) {
      expect(orderedBlues[i].windowStart).toBeGreaterThanOrEqual(orderedBlues[i - 1].windowStart);
    }
  });

  it('starts experimental A blues from 4, 5, then 6', () => {
    const aBlues6 = generateBoxShapePatterns('A', 'blues', {
      includeExperimentalBluesShape: true,
    });

    const ordered = getDisplayOrderedBoxPatterns(aBlues6, 'blues');
    expect(ordered.map((box) => box.shapeNumber)).toEqual([4, 5, 6, 1, 2, 3]);

    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i].windowStart).toBeGreaterThanOrEqual(ordered[i - 1].windowStart);
    }
  });

  it('starts C minor pentatonic/blues from higher boxes too', () => {
    const cPent = getDisplayOrderedBoxPatterns(
      generateBoxShapePatterns('C', 'pentatonic'),
      'pentatonic'
    );
    const cBlues = getDisplayOrderedBoxPatterns(
      generateBoxShapePatterns('C', 'blues'),
      'blues'
    );

    expect(cPent.slice(0, 2).map((box) => box.shapeNumber)).toEqual([4, 5]);
    expect(cBlues.slice(0, 2).map((box) => box.shapeNumber)).toEqual([4, 5]);
  });

  it('starts experimental C blues from 4, 5, then 6', () => {
    const cBlues6 = getDisplayOrderedBoxPatterns(
      generateBoxShapePatterns('C', 'blues', {
        includeExperimentalBluesShape: true,
      }),
      'blues'
    );

    expect(cBlues6.slice(0, 3).map((box) => box.shapeNumber)).toEqual([4, 5, 6]);
  });

  it('orders non-A experimental blues display by neck position too', () => {
    const blues6 = generateBoxShapePatterns('E', 'blues', {
      includeExperimentalBluesShape: true,
    });
    const blues6Shuffled = [...blues6].reverse();
    const ordered = getDisplayOrderedBoxPatterns(blues6Shuffled, 'blues');

    for (let i = 1; i < ordered.length; i++) {
      const prev = ordered[i - 1];
      const curr = ordered[i];
      expect(curr.windowStart).toBeGreaterThanOrEqual(prev.windowStart);
      if (curr.windowStart === prev.windowStart) {
        expect(curr.windowEnd).toBeGreaterThanOrEqual(prev.windowEnd);
      }
    }
  });

  it('keeps F# and G# pentatonic boxes compact after display ordering', () => {
    ['F#', 'G#'].forEach((minorKey) => {
      const ordered = getDisplayOrderedBoxPatterns(
        generateBoxShapePatterns(minorKey, 'pentatonic'),
        'pentatonic'
      );

      ordered.forEach((box) => {
        const allFrets = box.pattern.flat();
        const span = Math.max(...allFrets) - Math.min(...allFrets);
        expect(span).toBeLessThanOrEqual(7);
      });
    });
  });

  it('can start F major pentatonic from position 2 so low E shows F at fret 1', () => {
    const ordered = getDisplayOrderedBoxPatterns(
      generateBoxShapePatterns('D', 'pentatonic'),
      'pentatonic',
      2
    );

    expect(ordered[0]?.shapeNumber).toBe(2);
    expect(ordered[0]?.pattern[0]).toEqual([1, 3]);
    expect(ordered.map((box) => box.shapeNumber)).toEqual([2, 3, 4, 5, 1]);
  });
});
