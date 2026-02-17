import { render } from '@testing-library/react';
import ChordCheatSheetPanel from '../projects/guitar/components/ChordCheatSheetPanel';

describe('ChordCheatSheetPanel', () => {
  const data = {
    entries: [
      { chordSymbol: 'Em', notes: ['E', 'G', 'B'] },
      { chordSymbol: 'C', notes: ['C', 'E', 'G'] },
      { chordSymbol: 'Bb', notes: ['Bb', 'D', 'F'] },
    ],
    uniqueNotes: ['E', 'G', 'B', 'C', 'Bb', 'D', 'F'],
  };

  it('highlights only the active chord row', () => {
    const { container } = render(
      <ChordCheatSheetPanel
        data={data}
        rootPitchClasses={[]}
        auraPitchClasses={[]}
        activeChordSymbol="C"
      />
    );

    const emRow = container.querySelector('[data-chord-row="Em"]') as HTMLElement;
    const cRow = container.querySelector('[data-chord-row="C"]') as HTMLElement;
    const bbRow = container.querySelector('[data-chord-row="Bb"]') as HTMLElement;

    expect(cRow).toBeTruthy();
    expect(cRow.getAttribute('data-active')).toBe('true');
    expect(cRow.style.opacity).toBe('1');

    expect(emRow.getAttribute('data-active')).toBe('false');
    expect(bbRow.getAttribute('data-active')).toBe('false');
    expect(emRow.style.opacity).toBe('0.34');
    expect(bbRow.style.opacity).toBe('0.34');
  });

  it('matches active chord symbols with unicode accidental names', () => {
    const { container } = render(
      <ChordCheatSheetPanel
        data={data}
        rootPitchClasses={[]}
        auraPitchClasses={[]}
        activeChordSymbol="B♭"
      />
    );

    const bbRow = container.querySelector('[data-chord-row="Bb"]') as HTMLElement;
    expect(bbRow).toBeTruthy();
    expect(bbRow.getAttribute('data-active')).toBe('true');
    expect(bbRow.style.opacity).toBe('1');
  });

  it('moves root halos to the active chord root while looping', () => {
    const { container } = render(
      <ChordCheatSheetPanel
        data={data}
        rootPitchClasses={[4]} // E tonal center root when no active chord
        auraPitchClasses={[]}
        activeChordSymbol="C"
      />
    );

    const cRoot = container.querySelector('[data-chord-symbol="C"][data-chord-note="C"]') as HTMLElement;
    const cThird = container.querySelector('[data-chord-symbol="C"][data-chord-note="E"]') as HTMLElement;
    const emRoot = container.querySelector('[data-chord-symbol="Em"][data-chord-note="E"]') as HTMLElement;

    expect(cRoot.getAttribute('data-root')).toBe('true');
    expect(cThird.getAttribute('data-root')).toBe('false');
    expect(emRoot.getAttribute('data-root')).toBe('false');
  });
});
