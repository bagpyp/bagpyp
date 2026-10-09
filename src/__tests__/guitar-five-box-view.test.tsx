import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import BoxShapes from '@/components/BoxShapes';

jest.mock('@/components/CircleOfFifthsSelector', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <h1>{title}</h1>,
}));
jest.mock('@/components/ScalePatternFretboard', () => ({
  __esModule: true,
  default: ({ title, pattern }: { title: string; pattern: number[][] }) => (
    <div data-testid="box" data-title={title} data-pattern={JSON.stringify(pattern)}>{title}</div>
  ),
}));
jest.mock('@/components/MajorScaleRunExplorer', () => ({
  __esModule: true,
  default: () => <div data-testid="routes" />,
}));
jest.mock('@/components/ChordCheatSheetPanel', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/PracticeProgressionsPanel', () => ({ __esModule: true, default: () => null }));

it('switches between routes, five complete pentatonic-aligned boxes, and seven modal boxes', () => {
  render(<BoxShapes selectedMajorKey="E" onSelectedMajorKeyChange={jest.fn()} scaleFamily="major" />);
  expect(screen.getByTestId('routes')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: '5 Boxes' }));
  expect(screen.queryByTestId('routes')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'G Major System - 5 Box Shapes' })).toBeInTheDocument();
  const boxes = screen.getAllByTestId('box');
  expect(boxes).toHaveLength(5);
  expect(boxes.map((box) => box.dataset.title)).toEqual([
    'G Ionian (Box 2)', 'A Dorian (Box 3)', 'C Lydian (Box 4)',
    'D Mixolydian (Box 5)', 'E Aeolian (Box 1)',
  ]);
  expect(JSON.parse(boxes[4].dataset.pattern!)[3]).toEqual([11, 12, 14]);

  fireEvent.click(screen.getByRole('button', { name: '7 Boxes' }));
  expect(screen.getAllByTestId('box')).toHaveLength(7);
  expect(screen.getByRole('heading', { name: 'G Major System - 7 Modal Box Shapes' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: '21 Routes' }));
  expect(screen.getByTestId('routes')).toBeInTheDocument();
  expect(screen.queryByTestId('box')).not.toBeInTheDocument();
});
