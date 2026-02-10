# Guitar Workbench Progression Sources

Last updated: 2026-02-10

This file documents where the sidebar progression templates came from and how they map to the guitar workbench controls.

## Canonical Templates Used in Code

`src/projects/guitar/lib/progression-recommendations.ts`

- `12-Bar Blues`: `I7 I7 I7 I7 | IV7 IV7 I7 I7 | V7 IV7 I7 V7`
- `Mixolydian Drive`: `I7 bVII IV I7`
- `Lydian Lift`: `Imaj7 II Imaj7 II`
- `Dorian Vamp`: `i7 IV7 i7 IV7`
- `Natural Minor Rock`: `i bVII bVI bVII`
- `Phrygian Tension Vamp`: `i bII i bII`
- `Pop Major Loop`: `I V vi IV`
- `Major Cadence`: `I IV V I`

## Research References

- 12-bar blues form and Roman numeral convention:
  - https://en.wikipedia.org/wiki/Twelve-bar_blues
- Mixolydian signature progression (`I-bVII-IV` / close variants):
  - https://en.wikipedia.org/wiki/Mixolydian_mode
- Aeolian common progressions (including `i-bVII-bVI-bVII` style movement):
  - https://en.wikipedia.org/wiki/Aeolian_mode
- Ionian/major cadence patterns (`I-IV-V-I`) and pop loop (`I-V-vi-IV`):
  - https://en.wikipedia.org/wiki/I%E2%80%93IV%E2%80%93V%E2%80%93I
  - https://en.wikipedia.org/wiki/I%E2%80%93V%E2%80%93vi%E2%80%93IV_progression
- Dorian modal vamp examples (`i-IV` emphasis):
  - https://www.dummies.com/article/academics-the-arts/music/instruments/guitar/how-to-play-dorian-mode-on-guitar-198517/
- Lydian major-color movement (`I-II` emphasis):
  - https://www.dummies.com/article/academics-the-arts/music/instruments/guitar/how-to-play-lydian-mode-on-guitar-198520/
- Phrygian `bII` tension movement:
  - https://www.dummies.com/article/academics-the-arts/music/instruments/guitar/how-to-play-phrygian-mode-on-guitar-198515/

## Mapping Rules Implemented

- The progression sidebar keys off:
  - active tonal center (`minor` or `major`)
  - active scale family (`major` or `pentatonic`)
  - active hexatonic mode selection
  - enabled single-note color-tone toggles
- Chords are rendered from Roman numerals at runtime:
  - `src/projects/guitar/lib/progression-recommendations.ts:renderRomanProgressionToChords`
- Accidental spelling preference:
  - flat keys and flat Roman degrees use flat spellings (`Bb`, `Eb`, etc.).

## UI Placement

- Sidebar component:
  - `src/projects/guitar/components/PracticeProgressionsPanel.tsx`
- Workbench layout integration:
  - `src/projects/guitar/components/BoxShapes.tsx`

