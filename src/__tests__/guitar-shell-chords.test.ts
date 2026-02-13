import { generateChordData } from '@/lib/guitar/chords';
import { buildChord } from '@/lib/guitar/chord-types';

describe('guitar shell-chord generation', () => {
  it('generates dominant 7 shell voicings (1-3-b7) from triad framework', () => {
    const chordData = generateChordData('E', '7');
    expect(chordData).toBeTruthy();

    if (!chordData) {
      return;
    }

    const expectedShell = new Set([
      buildChord('E', '7')[0],
      buildChord('E', '7')[1],
      buildChord('E', '7')[3],
    ]);
    const perfectFifth = buildChord('E', '7')[2];

    expect(chordData.stringGroups.length).toBe(4);
    chordData.stringGroups.forEach((group) => {
      expect(group.voicings.length).toBeGreaterThan(0);
      group.voicings.forEach((voicing) => {
        const voicingSet = new Set(voicing.notes);
        expect(voicingSet.size).toBe(3);
        expect([...voicingSet].every((pc) => expectedShell.has(pc))).toBe(true);
        expect(voicingSet.has(perfectFifth)).toBe(false);
      });
    });
  });

  it('generates minor 7 shell voicings (1-b3-b7) from minor transformation + b7 swap', () => {
    const chordData = generateChordData('A', 'min7');
    expect(chordData).toBeTruthy();

    if (!chordData) {
      return;
    }

    const expectedShell = new Set([
      buildChord('A', 'min7')[0],
      buildChord('A', 'min7')[1],
      buildChord('A', 'min7')[3],
    ]);
    const perfectFifth = buildChord('A', 'min7')[2];

    chordData.stringGroups.forEach((group) => {
      group.voicings.forEach((voicing) => {
        const voicingSet = new Set(voicing.notes);
        expect(voicingSet.size).toBe(3);
        expect([...voicingSet].every((pc) => expectedShell.has(pc))).toBe(true);
        expect(voicingSet.has(perfectFifth)).toBe(false);
      });
    });
  });

  it('retains full chord-note metadata while rendering shell voicings', () => {
    const chordData = generateChordData('G', 'maj7');
    expect(chordData).toBeTruthy();

    if (!chordData) {
      return;
    }

    // UI can still show chord identity, even though voicings are shell subsets.
    expect(chordData.chordNotes).toEqual(['G', 'B', 'D', 'F#']);
  });
});

