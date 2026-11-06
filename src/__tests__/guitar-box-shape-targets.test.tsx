import '@testing-library/jest-dom';
import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import BoxShapes from '@/components/BoxShapes';
import type { FretboardMarker } from '@/components/ScalePatternFretboard';

jest.mock('@/components/CircleOfFifthsSelector', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/components/ScalePatternFretboard', () => ({
  __esModule: true,
  default: ({ title, pattern, markers }: {
    title: string;
    pattern: number[][];
    markers: FretboardMarker[];
  }) => (
    <div
      data-testid="box"
      data-title={title}
      data-pattern={JSON.stringify(pattern)}
      data-markers={JSON.stringify(markers)}
    />
  ),
}));
jest.mock('@/components/MajorScaleRunExplorer', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/ChordCheatSheetPanel', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/PracticeProgressionsPanel', () => ({ __esModule: true, default: () => null }));

function BoxShapesWithKey({ initialKey }: { initialKey: string }) {
  const [selectedKey, setSelectedKey] = useState(initialKey);
  return (
    <BoxShapes
      selectedMajorKey={selectedKey}
      onSelectedMajorKeyChange={setSelectedKey}
      scaleFamily="pentatonic"
    />
  );
}

function firstBox() {
  const box = screen.getAllByTestId('box')[0];
  const pattern: number[][] = JSON.parse(box.dataset.pattern!);
  const markers: FretboardMarker[] = JSON.parse(box.dataset.markers!);
  return { pattern, targetPositions: markers.flatMap((marker) => marker.positions) };
}

describe('pentatonic box target positions', () => {
  it.each(['Ionian', 'Aeolian'])(
    'includes G# before A on the G string in the A/F# minor system with %s selected',
    (mode) => {
      render(<BoxShapesWithKey initialKey="F#" />);
      fireEvent.click(screen.getByRole('button', { name: mode }));

      const { pattern, targetPositions } = firstBox();
      expect(pattern[3]).toEqual([1, 2, 4]);
      expect(targetPositions).toContainEqual([3, 1]);
      expect(screen.getByRole('heading', {
        name: mode === 'Ionian'
          ? 'A Major Pentatonic - 5 Box Shapes'
          : 'F# Minor Pentatonic - 5 Box Shapes',
      })).toBeInTheDocument();
    }
  );

  it('adds and removes the same G# with the individual 2/9 target toggle', () => {
    render(<BoxShapesWithKey initialKey="F#" />);
    expect(firstBox().pattern[3]).toEqual([2, 4]);

    const toggle = screen.getByRole('button', { name: /Add 2\/9 targets/ });
    fireEvent.click(toggle);
    expect(firstBox().pattern[3]).toEqual([1, 2, 4]);
    expect(firstBox().targetPositions).toContainEqual([3, 1]);

    fireEvent.click(toggle);
    expect(firstBox().pattern[3]).toEqual([2, 4]);
    expect(firstBox().targetPositions).not.toContainEqual([3, 1]);
  });

  it('includes the open G string as the target immediately before F minor box 1', () => {
    render(<BoxShapesWithKey initialKey="F" />);
    fireEvent.click(screen.getByRole('button', { name: /Add 2\/9 targets/ }));

    expect(firstBox().pattern[3]).toEqual([0, 1, 3]);
    expect(firstBox().targetPositions).toContainEqual([3, 0]);
  });

  it('keeps box 2 compact instead of borrowing D a whole step before its B-string pair', () => {
    render(<BoxShapesWithKey initialKey="F#" />);
    fireEvent.click(screen.getByRole('button', { name: 'Aeolian' }));

    const box = screen.getAllByTestId('box').find((item) => (
      item.dataset.title === 'F# Minor Pentatonic (Box 2)'
    ))!;
    const pattern: number[][] = JSON.parse(box.dataset.pattern!);
    const markers: FretboardMarker[] = JSON.parse(box.dataset.markers!);
    expect(pattern[4]).toEqual([5, 7]);
    expect(markers.flatMap((marker) => marker.positions)).not.toContainEqual([4, 3]);
  });

  it('clips the corresponding F# below the nut in the G/E minor system', () => {
    render(<BoxShapesWithKey initialKey="E" />);
    fireEvent.click(screen.getByRole('button', { name: 'Aeolian' }));

    expect(firstBox().pattern[3]).toEqual([0, 2]);
    for (const box of screen.getAllByTestId('box')) {
      const pattern: number[][] = JSON.parse(box.dataset.pattern!);
      const markers: FretboardMarker[] = JSON.parse(box.dataset.markers!);
      expect(pattern.flat().every((fret) => fret >= 0 && fret <= 24)).toBe(true);
      expect(markers.flatMap((marker) => marker.positions)
        .every(([, fret]) => fret >= 0 && fret <= 24)).toBe(true);
    }
  });
});
