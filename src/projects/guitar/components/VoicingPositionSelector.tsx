'use client';

import React from 'react';

export interface VoicingSlot {
  stringGroup: number;
  position: number;
}

interface VoicingPositionSelectorProps {
  selected: VoicingSlot;
  onChange: (slot: VoicingSlot) => void;
}

export default function VoicingPositionSelector({
  selected,
  onChange,
}: VoicingPositionSelectorProps) {
  return (
    <div className="inline-grid grid-cols-4 gap-1 p-1 rounded-md border border-slate-700 bg-slate-800">
      {[0, 1, 2, 3].map(stringGroup =>
        [0, 1, 2, 3].map(position => {
          const isSelected =
            selected.stringGroup === stringGroup &&
            selected.position === position;
          return (
            <button
              key={`${stringGroup}-${position}`}
              type="button"
              onClick={() => onChange({ stringGroup, position })}
              aria-label={`String group ${stringGroup + 1}, Position ${position}`}
              aria-pressed={isSelected}
              className={`w-4 h-4 rounded-sm transition-colors ${
                isSelected
                  ? 'bg-primary-500 ring-1 ring-primary-300'
                  : 'bg-slate-900 hover:bg-slate-700'
              }`}
            />
          );
        }),
      )}
    </div>
  );
}
