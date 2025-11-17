import { generateTriadsData } from './lib/triads';

// Capture all positions for all 12 major keys
const ALL_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const allPositions: Record<string, any> = {};

ALL_KEYS.forEach(key => {
  const data = generateTriadsData(key as any);

  allPositions[key] = {
    triadNotes: data.triadNotes,
    groups: data.stringGroups.map((group, groupIdx) => ({
      groupIndex: groupIdx,
      strings: group.strings,
      voicings: group.voicings.map(v => ({
        position: v.position,
        frets: v.frets,
        inversion: v.inversion,
        noteNames: v.noteNames
      }))
    }))
  };
});

// Output as JSON for inspection
console.log(JSON.stringify(allPositions, null, 2));

// Output as TypeScript test data
console.log('\n\n=== TEST DATA FORMAT ===\n');

console.log('export const MAJOR_TRIAD_POSITIONS = {');
ALL_KEYS.forEach(key => {
  console.log(`  '${key}': {`);
  const keyData = allPositions[key];
  console.log(`    triadNotes: [${keyData.triadNotes.map((n: string) => `'${n}'`).join(', ')}],`);
  console.log(`    groups: [`);

  keyData.groups.forEach((group: any) => {
    console.log(`      { // Group ${group.groupIndex}`);
    console.log(`        strings: [${group.strings.join(', ')}],`);
    console.log(`        voicings: [`);

    group.voicings.forEach((v: any) => {
      console.log(`          { position: ${v.position}, frets: [${v.frets.join(', ')}], inversion: '${v.inversion}' },`);
    });

    console.log(`        ]`);
    console.log(`      },`);
  });

  console.log(`    ]`);
  console.log(`  },`);
});
console.log('};');