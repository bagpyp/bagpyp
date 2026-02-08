import { render, screen } from '@testing-library/react';
import ScalePatternFretboard from '@/components/ScalePatternFretboard';
import { toFlatEnharmonic } from '@/lib/guitar/fretboard-physics';

describe('blue note spelling', () => {
  it('converts sharp accidentals to flat enharmonics', () => {
    expect(toFlatEnharmonic('A#')).toBe('Bb');
    expect(toFlatEnharmonic('C#')).toBe('Db');
    expect(toFlatEnharmonic('F#4')).toBe('Gb4');
    expect(toFlatEnharmonic('E')).toBe('E');
    expect(toFlatEnharmonic('Bb')).toBe('Bb');
  });

  it('renders blue-note labels as flats on the box-shape fretboard', () => {
    render(
      <ScalePatternFretboard
        title="Blue Note Label Test"
        selectedKey="E"
        pattern={[[], [1], [], [], [], []]} // A string, fret 1 = A#
        rootPositions={[]}
        markers={[
          {
            positions: [[1, 1]],
            stroke: '#38bdf8',
            variant: 'blue-vibe',
          },
        ]}
        showTitle={false}
        numFrets={12}
      />
    );

    expect(screen.getByText('Bb')).toBeInTheDocument();
    expect(screen.queryByText('A#')).not.toBeInTheDocument();
  });
});
