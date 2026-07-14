I had almost convinced myself that I understood CAGED.

Not in the usual sense of being able to name five chord silhouettes. I mean that I had found a way to fit it into the system that was already forming in my head: the fretboard as a lattice, triads as local three-note bodies, inversions as rotations of the cyclic word $4,3,5$, and hand positions as overlapping neighborhoods rather than sealed boxes.

The explanation was clean. Fix a chord—say C major—and mark every C, E, and G on the neck. A three-string triad is a local cross-section of that constellation. A CAGED form is a larger, hand-sized patch made by gluing several such cross-sections together. Move the hand-window toward the bridge and the patch changes shape. The five familiar letters are names for the five overlapping charts that appear during one twelve-fret period.

That explanation works beautifully for C into A. Both forms are organized around the same low C on the fifth string. It also works for G into E. Both are organized around the same low C on the sixth string. In each case the chord seems to change posture while keeping its feet planted.

Then the D form arrives.

The lowest root of an E-form C chord is C3. The lowest root of the neighboring D-form C chord is C4. It is not the same C moved to another string. It is the next C, one octave higher.

Worse, there appears to be a hole between the forms. The E form occupies frets 8 through 10. The D form reaches from its root on fret 10 to notes on frets 12 and 13. Fret 11 looks skipped.

It turns out that this impression is exactly right, and stronger than it first appears. Fret 11 contains no C-major chord tones. In fact, it contains no notes from the C-major scale at all. Every note on that fret is outside the key.

So there are two different things to explain:

1. Why the bass root remains in the same absolute register through C–A–G–E and then jumps at D.
2. Why the geometry around that jump contains a literal one-fret musical desert.

Once register is restored to the model, CAGED stops being a five-shape circle. It becomes a helix. The letters return, but the final letter lands on the next floor.

This essay is a companion to [The Octave Lattice](/blog/octave-lattice) and [Unwarping the Fretboard](/blog/unwarping-fretboard). The first article treated octave shapes as vectors. The second treated a major triad as the cyclic interval word $(4,3,5)$ and removed the apparent distortion caused by the G–B tuning seam. Here I want to keep all of that structure, then ask a different question:

> What happens when a hand-sized neighborhood can no longer contain the root that had been acting as its center of gravity?

The answer is the hidden architecture of CAGED.

## The explanation that almost works

For a fixed major chord with root $R$, define its chord-tone lattice

$$
L_R=\{(s,f):\operatorname{pitch}(s,f)\in\{R,R+4,R+7\}\}.
$$

This is not yet a collection of shapes. It is simply every physical location where a root, major third, or perfect fifth occurs.

A close-position triad selects three nearby points of $L_R$, one on each of three adjacent strings. Its inversion records which chord tone is lowest. In the language of the previous essay, each inversion is a two-step window into the circular interval word

$$
(4,3,5).
$$

A CAGED form selects something larger: a connected, playable patch of $L_R$ contained in a roughly hand-sized fret region. It usually repeats some chord tones and omits others. The familiar full-chord fingering is one playable subset of that patch, not the patch itself.

This distinction resolves the first counting problem:

| Object | What varies | Count |
|---|---|---:|
| Triad inversion | Which chord tone is lowest | $3$ |
| Adjacent string group | Which three strings contain the voices | $4$ |
| Triad placements | Inversion $\times$ string group | $12$ |
| CAGED chart | Which hand-sized longitudinal patch is visible | $5$ per octave |

The numbers are different because the systems vary different coordinates. A CAGED form is not a fourth or fifth inversion. It contains several of the triad placements, and a single triad can belong to more than one form where the charts overlap.

The open C neighborhood makes the gluing literal. I will list strings from low to high, so the low three-string shape that appears as `2–3–3` when read in string-number order $4$–$5$–$6$ appears here as `3–3–2` on strings $6$–$5$–$4$:

| Strings | Frets | Notes | Inversion |
|---|---:|---|---|
| 6–5–4 | `3–3–2` | G–C–E | Second |
| 5–4–3 | `3–2–0` | C–E–G | Root |
| 4–3–2 | `2–0–1` | E–G–C | First |
| 3–2–1 | `0–1–0` | G–C–E | Second |

Each row shares two physical notes with the next. We drop the lowest voice, add a new highest voice, and rotate the inversion:

$$
GCE\longrightarrow CEG\longrightarrow EGC\longrightarrow GCE.
$$

The first row is the low face of a C-form C-major body. Beginner chord diagrams usually mute the low G, which hides precisely the triangle that makes the larger geometry obvious. Restore it, and the C form is no longer a silhouette to memorize. It is a strip of triadic faces glued edge to edge.

That is the right starting abstraction:

> Triads are the local faces. CAGED forms are overlapping neighborhoods assembled from those faces.

But it is not yet enough, because the definition of $L_R$ uses pitch classes. It treats every C as simply C. The discomfort around D is information that pitch class has erased.

## Put the octave numbers back

The note names C, E, and G describe pitch classes. They identify notes modulo the octave. C3, C4, and C5 all project to the same pitch class C, but they do not occupy the same register, vibrate at the same frequency, or exert the same physical and perceptual weight inside a voicing.

This is especially important on guitar because the same absolute pitch often has several physical representatives. C3 can be played at string 5, fret 3 or string 6, fret 8. That is a unison transfer: the body moves, but the sounding pitch does not. C4 has an even longer diagonal of representatives:

$$
(s2,f1)=(s3,f5)=(s4,f10)=(s5,f15)=(s6,f20)=C4.
$$

The first step is four frets because it crosses the G–B seam. The remaining steps are five frets. This is the same unison lattice already implicit in the interval-translation rule from the previous essay.

Now write out only the roots contained in each C-major form:

| Form | Physical root locations | Absolute roots present |
|---|---|---|
| C | $s5f3,\ s2f1$ | C3, C4 |
| A | $s5f3,\ s3f5$ | C3, C4 |
| G | $s6f8,\ s3f5,\ s1f8$ | C3, C4, C5 |
| E | $s6f8,\ s4f10,\ s1f8$ | C3, C4, C5 |
| D | $s4f10,\ s2f13$ | C4, C5 |
| next C | $s5f15,\ s2f13$ | C4, C5 |

The ordinary root-string mnemonic is still visible:

| Form | Root-bearing strings |
|---|---|
| C | 5 and 2 |
| A | 5 and 3 |
| G | 6, 3, and 1 |
| E | 6, 4, and 1 |
| D | 4 and 2 |

But the absolute-pitch table reveals the event that the mnemonic hides.

The same C3 remains available throughout C, A, G, and E. In C and A it lives at $s5f3$. In G and E it lives at $s6f8$. The A-to-G transition changes its physical representative, but not its frequency or register.

Then, at D, C3 is gone.

C4, which had been an interior root of the E form at $s4f10$, becomes the lowest root of the D form. Nothing happened to the root *class*. Everything happened to the selected root *representative*.

That gives us a more honest way to write the cycle. Let $R_n$ denote a root in a particular absolute register. Then the conventional sequence

$$
C\longrightarrow A\longrightarrow G\longrightarrow E\longrightarrow D\longrightarrow C
$$

really behaves like

$$
C_n\longrightarrow A_n\longrightarrow G_n\longrightarrow E_n
\longrightarrow D_{n+1}\longrightarrow C_{n+1}.
$$

The subscript is not the octave of every note in the voicing. It records the register of the lowest available root—the root acting as the chord body's gravitational floor.

This is the discontinuity I could feel. CAGED notation had identified $R_n$ and $R_{n+1}$ because they belong to the same pitch class. My ear and hand had not.

<div style="text-align: center; margin: 2rem 0;">
    <img src="/blog/caged-is-a-helix/img/root-braid.svg" style="width: 100%; max-width: 900px;" alt="A root braid for C major showing C3 continuing through the C, A, G, and E forms, then disappearing at D while C4 becomes the lowest root">
</div>

## Two rooted families and one bridge

The five letters are usually presented democratically, as though they were five equal stations around a loop. They do not feel equal because they do not preserve the bass root equally.

C and A form a fifth-string-root family. Both are organized around the same low root on string 5. For C major, that anchor is $s5f3=C3$.

G and E form a sixth-string-root family. Both are organized around the same low root on string 6. For C major, that anchor is $s6f8=C3$.

D is the only fourth-string-root form. Its lowest root is $s4f10=C4$.

So the bodily grouping is not five isolated letters. It is

$$
\underbrace{C\leftrightarrow A}_{\text{string-5 bass-root family}}
\rightsquigarrow
\underbrace{G\leftrightarrow E}_{\text{string-6 bass-root family}}
\rightsquigarrow
\underbrace{D}_{\text{string-4 register bridge}}
\rightsquigarrow C'.
$$

C-to-A and G-to-E feel stable because the low root remains on the same string at the same fret. The body changes posture while its center of mass stays put.

A-to-G and D-to-C feel stranger because the same absolute root is handed from one physical location to another. The pitch remains equal, but the body changes feet.

E-to-D is categorically different. It is not a unison handoff of the bass root. The lower root leaves the neighborhood and the next octave is promoted into its role.

This is why a statement like “adjacent CAGED forms share roots” is true but psychologically incomplete. A root shared in an inner or upper voice does not stabilize a chord body the way persistence of the lowest root does. Root identity is harmonic. Bass continuity is registral, perceptual, and physical.

The distinction also explains why the D form often feels more like a high chord fragment than a complete body. The standard D-form C chord is

```text
strings:  4   3   2   1
frets:   10  12  13  12
notes:   C4  G4  C5  E5
```

Its lowest note is already C4. Add the C3 at $s6f8$ underneath it and much of the apparent instability disappears—but the hand now spans E-form territory again. The discontinuity is not a defect in C major. It is a consequence of asking a finite hand-window to move across an infinite, register-bearing lattice.

## The root braid

The transition sequence becomes systematic when we track every root voice, not only the lowest one.

Suppose the root $R_n$ lies on the sixth string at fret $r$. For C major, $r=8$. The root representatives used by the forms can be written relative to $r$:

| Form | Root representatives |
|---|---|
| C | $s5(r-5)=R_n$, $s2(r-7)=R_{n+1}$ |
| A | $s5(r-5)=R_n$, $s3(r-3)=R_{n+1}$ |
| G | $s6r=R_n$, $s3(r-3)=R_{n+1}$, $s1r=R_{n+2}$ |
| E | $s6r=R_n$, $s4(r+2)=R_{n+1}$, $s1r=R_{n+2}$ |
| D | $s4(r+2)=R_{n+1}$, $s2(r+5)=R_{n+2}$ |
| next C | $s5(r+7)=R_{n+1}$, $s2(r+5)=R_{n+2}$ |

Each transition retains at least one exact physical root and transfers another absolute root along its unison diagonal:

| Transition | Root retained in place | Root transferred |
|---|---|---|
| C → A | $R_n$ on string 5 | $R_{n+1}: s2(r-7)\to s3(r-3)$ |
| A → G | $R_{n+1}$ on string 3 | $R_n: s5(r-5)\to s6r$ |
| G → E | $R_n$ on string 6 and $R_{n+2}$ on string 1 | $R_{n+1}: s3(r-3)\to s4(r+2)$ |
| E → D | $R_{n+1}$ on string 4 | $R_{n+2}: s1r\to s2(r+5)$; $R_n$ exits |
| D → C′ | $R_{n+2}$ on string 2 | $R_{n+1}: s4(r+2)\to s5(r+7)$ |

The four- or five-fret displacement of a transferred root is not a musical interval. It is a physical change of representative for a unison. In the pitch graph, the move has weight zero. In fret-space, it has substantial distance.

This gives us two different metrics that a useful guitar model should never confuse:

1. **Pitch displacement:** how far a voice moves in sounding semitones.
2. **Embodiment displacement:** how far the fretting hand moves between equivalent locations.

The A-to-G bass transfer has pitch displacement $0$ but embodiment displacement one string and five frets. The E-to-D bass event has pitch displacement $+12$ because the selected lowest root changes register. Both may look like “root movement” on a diagram, but they are different species of motion.

There is one more asymmetry in the braid. The G form introduces an upper root $R_{n+2}$ without disturbing the bass. That new register enters quietly at the top of the body. The D form removes $R_n$ from the bottom, which changes the body's floor. Every traversal of the octave therefore contains an upper-register birth and a lower-register death. Hearing weights the death much more heavily because bass is where harmonic mass accumulates.

## The missing fret is real

Now return to the suspected gap.

For C major, the E-form chord is

```text
strings:  6   5   4   3   2   1
frets:    8  10  10   9   8   8
notes:   C3  G3  C4  E4  G4  C5
```

The D form begins at the E form's middle root, $s4f10=C4$, then reaches to frets 12 and 13:

```text
strings:  4   3   2   1
frets:   10  12  13  12
notes:   C4  G4  C5  E5
```

There is no fret-11 note in either chord. That could have been a coincidence of the triad. It is not.

Let a major key's root lie on the sixth string at fret $r$. Relative to that root, the six open-string pitch classes are

$$
(0,5,10,3,7,0)
$$

on strings 6 through 1. The repeated zero comes from the two E strings; the $7$ on string 2 encodes the G–B tuning seam.

At fret $r+3$, the intervals relative to the root are

$$
(3,8,1,6,10,3).
$$

In musical names:

| String | Interval at fret $r+3$ |
|---:|---|
| 6 | $\flat3$ |
| 5 | $\flat6$ |
| 4 | $\flat2$ |
| 3 | $\flat5$ |
| 2 | $\flat7$ |
| 1 | $\flat3$ |

The five distinct pitch classes are

$$
\{\flat2,\flat3,\flat5,\flat6,\flat7\}.
$$

Those are exactly the five pitch classes excluded by the major scale.

Therefore:

$$
\boxed{\text{If a major key has its E-form root at fret }r,
\text{ then fret }r+3\text{ contains no notes from that major scale.}}
$$

For C major, $r=8$, so $r+3=11$. The entire eleventh fret is outside C major:

$$
D\sharp,\ G\sharp,\ C\sharp,\ F\sharp,\ A\sharp,\ D\sharp.
$$

The two E strings duplicate D-sharp; the five unique notes are the chromatic complement of the C-major scale.

The contrast on the next fret is almost comically sharp. At fret $r+4$, the relative intervals are

$$
(4,9,2,7,11,4)
=(3,6,2,5,7,3),
$$

using scale-degree names. Every string is now inside the major scale. For C major, fret 12 contains

$$
E,\ A,\ D,\ G,\ B,\ E.
$$

So the local major-scale density goes from a full diatonic column at $r+2$, to zero at $r+3$, back to a full diatonic column at $r+4$.

<div style="text-align: center; margin: 2rem 0;">
    <img src="/blog/caged-is-a-helix/img/missing-fret.svg" style="width: 100%; max-width: 900px;" alt="A fretboard density diagram for C major showing all six strings in the scale at frets 10 and 12 and no strings in the scale at fret 11">
</div>

This is the fret skip I was seeing. There is no topological gap between the CAGED charts: E and D share the exact root at $s4f10$. But there is a one-column gap in the embedded musical subset. D plants one foot on fret 10, reaches over the empty fret 11, and lands its upper structure on frets 12 and 13.

The distinction matters:

- **No chart gap:** E and D overlap at C4.
- **A real chord-tone gap:** no C, E, or G occurs anywhere on fret 11.
- **A stronger scale gap:** no C-major scale degree occurs anywhere on fret 11.
- **A register jump:** the C3 root leaves and C4 becomes the floor.

All four statements are simultaneously true.

## D is a bridge chart

The D form makes more sense when it is viewed less as the fifth member of the previous family and more as a bridge into the next register.

Its bottom root, $s4f10=C4$, belongs to the E form behind it. Its upper three-string triad

$$
(s3f12,s2f13,s1f12)=G4,C5,E5
$$

belongs exactly to the next C form ahead of it. That `12–13–12` second-inversion triangle is simultaneously the top face of the D-form chord and a face of the octave-higher C-form neighborhood.

<div style="text-align: center; margin: 2rem 0;">
    <img src="/blog/caged-is-a-helix/img/d-bridge.svg" style="width: 100%; max-width: 940px;" alt="The E, D, and next C forms for C major, showing the D form sharing its lower root with E and its upper G-C-E triad with the next C form across the empty eleventh fret">
</div>

This gives D a precise structural job:

> D takes an interior root from the E neighborhood, promotes it to bass, crosses the zero-density fret, and hands its upper triad to the next C neighborhood.

It is a transition chart between register sheets.

The apparent awkwardness of the D form is therefore useful information. Its compact four-string shape is not failing to resemble the six-string E form. It is recording the fact that the old bass register is no longer available inside the new hand-window.

This also explains why trying to learn D as merely another large chord grip can feel conceptually thin. Its identity is clearest in relation to both neighbors:

- looking backward, it inherits its lowest root from E;
- looking forward, it shares its upper triad with C′;
- looking downward in register, it has abandoned the C3 that unified C–A–G–E;
- looking upward, it establishes C4 as the new bass-root level for the next turn.

D is not an isolated box. It is the hinge where one octave of the atlas becomes the next.

## A circle in pitch class, a helix in pitch

There is a standard mathematical operation hiding underneath this experience.

Absolute pitches live in an integer-like space: move twelve semitones and we reach a different pitch with the same pitch class. Pitch classes live in the quotient

$$
\mathbb Z/12\mathbb Z.
$$

The projection

$$
\pi:\mathbb Z\to\mathbb Z/12\mathbb Z
$$

forgets register. It sends C3, C4, C5, and every other C to one point labeled C.

CAGED is usually drawn after this projection. Roots are marked R, not $R_n$, $R_{n+1}$, and $R_{n+2}$. In that quotient, the path closes:

$$
C\to A\to G\to E\to D\to C.
$$

But lift the path back into absolute pitch and the final C is not the initial C. It is twelve semitones higher. The lifted path is not a circle. It is an infinite chain whose projection looks circular:

$$
\cdots\to C_n\to A_n\to G_n\to E_n\to D_{n+1}
\to C_{n+1}\to A_{n+1}\to\cdots
$$

Wrap that chain around the pitch-class circle and it becomes a helix. Each traversal returns to the same angular position while rising one octave.

<div style="text-align: center; margin: 2rem 0;">
    <img src="/blog/caged-is-a-helix/img/helix.svg" style="width: 100%; max-width: 880px;" alt="CAGED drawn first as a closed pitch-class circle and then as a rising helix whose next C is one octave above the first">
</div>

The technical word for this kind of failure-to-close is **monodromy**: travel around a closed loop in the quotient, lift the trip into the covering space, and discover that the endpoint differs from the starting point by a deck transformation. Here the deck transformation is simply

$$
p\mapsto p+12.
$$

No one needs the word *monodromy* to play a C chord. But the concept captures exactly why CAGED can feel coherent and discontinuous at the same time. It is coherent modulo octaves. It is discontinuous when the body keeps track of which octave it inhabits.

The D form is where the lifted path most visibly changes floors. The cycle itself does not create the register shift; moving twelve frets necessarily does that. D is where the conventional hand-sized cover exposes it in the bass.

## The two seams are different

The previous essay described the G–B boundary as a seam. This essay has introduced a register seam. They should not be conflated.

### The tuning seam

The G–B seam is a defect in the physical embedding of interval geometry. Most adjacent strings are five semitones apart; G and B are four. A musical shape crossing that boundary must move everything on the B-string side one fret toward the bridge.

It can be removed by changing coordinates:

$$
x=f-\varepsilon(s),
$$

with $\varepsilon=1$ on B and high E. In unwarped coordinates the fretboard behaves like an all-fourths instrument. The abstract interval path never changed; only its drawing bent.

### The register seam

The E–D event is not a tuning defect. No coordinate correction can keep C3 inside a D-form-sized window centered around frets 10–13. The note is physically back at fret 8 on the low E string. We can include it only by widening the window or by allowing the hand to occupy both neighborhoods.

The register seam arises from three simultaneous choices:

1. quotienting absolute pitches into pitch classes;
2. restricting attention to a finite hand-window;
3. selecting the lowest root inside that window as the gravitational anchor.

The tuning seam bends a shape. The register seam changes which lift of the root is present.

One can be unwarped. The other must be tracked.

This suggests that a complete coordinate system for the fretboard needs at least three layers:

$$
(\text{pitch class},\ \text{absolute register},\ \text{physical representative}).
$$

Pitch class tells us harmonic identity. Register tells us height and gravitational weight. Physical representative tells us where the body must go.

Most guitar diagrams show the first and third while suppressing the second. CAGED's D-form discontinuity is the suppressed coordinate becoming audible.

## CAGED as a moving hand-window

The helix model becomes physical if we stop imagining that the chord moves and instead let a window move over a stationary lattice.

Fix every C, E, and G on the neck. Now place a translucent hand-sized window over the open position. The visible points assemble into the C form. Slide the window toward the bridge. Points exit on the nut side; new unison and octave representatives enter on the bridge side. The silhouette changes through A, G, E, D, and C′.

Three different events occur during this motion:

| Event | Harmonic change | Sounding-pitch change | Physical change |
|---|---|---|---|
| Rigidly move a fingering | Chord transposes | Every voice moves | Shape remains fixed |
| Change CAGED chart for one fixed chord | Chord stays fixed | Voices choose unison/octave representatives | Shape morphs |
| Move a triad floorward through string groups | Chord stays fixed | Inversion may rotate | Shape crosses the tuning seam |

These operations are often mixed together under the vague instruction “move the shape.” They are not the same transformation.

If the fingering remains rigid while moving bridgeward, C major becomes C-sharp, then D, and so on. That is transposition.

If C major remains fixed while the hand moves bridgeward, the shape cannot remain rigid. The window must choose different physical representatives of C, E, and G. That is the CAGED chart transition.

If a local C-major triad moves toward the floor across adjacent string groups, its inversion and physical drawing change according to the $4,3,5$ cycle and the G–B seam operator. That is triadic translation through the fretboard embedding.

CAGED is valuable because it organizes the second operation. Triad geometry explains the third. The octave lattice explains why equivalent representatives exist. They are not rival systems; they are different actions on the same underlying object.

## Neighborhood membership is multiple

A point on the neck does not belong to exactly one CAGED form. The forms overlap, just as coordinate charts in an atlas overlap.

For C major, the second-inversion triad

$$
(s4f5,s3f5,s2f5)=G3,C4,E4
$$

belongs to both the A and G neighborhoods. It is an exact three-note overlap, not merely a conceptual resemblance.

The E and D neighborhoods overlap more sparsely at $s4f10=C4$. D and the next C neighborhood overlap richly at the upper `12–13–12` G–C–E triad.

These overlaps have different dimensions:

- some neighboring forms share a whole triadic face;
- some share several roots;
- some share one root and exchange the surrounding body;
- the E–D transition shares a root while changing the bass register.

That is why forcing each fretboard point into one exclusive “box” destroys useful structure. Membership should be allowed to be plural. At an overlap, the question is not “Which shape owns this note?” but “Which neighborhoods can use this note, and what role does it play in each?”

This is particularly important for improvisation. A shared point is not a border. It is a portal. A chord tone that belongs to two neighborhoods is a place where the hand can reinterpret its surroundings without abandoning the sounding note.

The lattice is the geography. The CAGED labels are neighborhood names. Triads are the local gravitational bodies. Pentatonic shapes are movement corridors. Modal degrees determine atmosphere. None of these systems should erase the others.

## What CAGED contributes—and what it does not

CAGED is often oversold as a complete theory of the fretboard. It is more precise and more useful to assign it a narrower job.

CAGED contributes:

- a five-chart cover of one twelve-fret period;
- recognizable root configurations;
- hand-sized chord-tone neighborhoods;
- overlaps that support horizontal relocation;
- a way to anchor arpeggios, pentatonics, and scales to chord bodies.

CAGED does not, by itself, explain:

- why inversions cycle as they do;
- why the G–B shapes distort;
- which absolute root register is anchoring a form;
- why some transitions feel stable and others discontinuous;
- how much a voice moves in pitch versus fret-space;
- how to choose musically meaningful paths between the neighborhoods.

Those missing pieces come from interval geometry, register, voice leading, and the lattice of equivalent notes.

This is good news. It means I do not need to memorize five more opaque objects. I can regenerate each form from things I already understand:

1. locate the root fiber—the unison and octave copies of the root;
2. choose the representatives inside the current hand-window;
3. construct nearby thirds and fifths using interval geometry;
4. apply the G–B seam correction to the physical drawing;
5. identify the triadic faces and their inversions;
6. track which root representative is lowest.

The C, A, G, E, or D silhouette is the result of that construction. It is not the primitive fact.

## What I want the Guitar Workbench to show

This model suggests a set of features for the [Guitar Workbench](/projects/guitar/triads/byvoicing). The application already displays major-triad voicings across four adjacent string groups, identifies inversion, and computes neighboring chord tones. The next step is to make the relationships between those local bodies visible.

The following are not separate gimmicks. They are views of one shared data model.

### 1. An absolute-pitch toggle

Every displayed note should be able to switch between pitch-class labels and scientific pitch notation:

```text
C  →  C3 / C4 / C5
E  →  E3 / E4 / E5
G  →  G2 / G3 / G4
```

Pitch-class mode is useful for harmony. Absolute-pitch mode reveals register continuity, unisons, and octave promotion. Without this toggle, the E-to-D discontinuity is mathematically unavailable to the interface.

The underlying fretboard model already knows string and fret, so absolute MIDI pitch is immediate:

$$
p(s,f)=p_{\text{open}}(s)+f.
$$

Pitch class is then $p\bmod12$ and octave is derived from the quotient.

### 2. A root-braid overlay

Selecting a key should reveal every physical representative of its root, connected in two ways:

- solid links for the same absolute pitch on another string;
- vertical or color-graded links for octave-equivalent roots.

The C3 pair $s5f3\leftrightarrow s6f8$ should read as a unison handoff. The move from C3 to C4 should read as a register change. They should not use the same arrow or animation.

When a CAGED sequence is enabled, the active root representatives can be highlighted form by form. The bass-root trace would visibly remain on C3 through C–A–G–E, then step to C4 at D.

### 3. CAGED neighborhoods generated from chord tones

Rather than drawing five memorized outlines, the application can define each form as a set of chord-tone representatives inside a conventional fret window plus its root-string signature:

```text
C form: roots on 5 and 2
A form: roots on 5 and 3
G form: roots on 6, 3, and 1
E form: roots on 6, 4, and 1
D form: roots on 4 and 2
```

The strict chord grip can be one display mode. A broader “chord-tone neighborhood” mode can include every nearby R, 3, and 5, even when no single conventional fingering sounds all of them.

This would preserve the important distinction between a form's playable voicing and the larger patch of lattice that gives the form meaning.

### 4. Multiple neighborhood membership

Hovering a triad or note should show every CAGED chart containing it. The `5–5–5` G–C–E triad on strings 4–3–2 should light both A and G. The `12–13–12` G–C–E triad should light D and the next C.

An overlap is a navigational affordance. The interface should make it feel like one.

### 5. A moving hand-window

A draggable fret-range window could move horizontally over the complete chord-tone lattice. As it crosses thresholds, the Workbench would classify the visible patch and animate which representatives enter and leave.

The crucial visual distinction would be:

- a note moving to an equivalent unison location;
- an upper octave entering the window;
- a lower octave leaving the window;
- a surviving internal root becoming the new bass root.

This would turn CAGED from five static diagrams into a state transition system.

### 6. A diatonic-density layer

For a selected scale, each fret column can display how many of its six string positions belong to the scale. Around an E-form major root, the pattern at offsets $+2,+3,+4$ is

$$
6,\ 0,\ 6.
$$

The zero-density column should be visually unmistakable. It is not only a curiosity; it predicts where horizontal motion must leap and where shape boundaries may feel detached.

More generally, density can be defined as

$$
d_K(f)=\sum_{s=1}^{6}\mathbf 1[p(s,f)\bmod12\in K],
$$

where $K$ is a selected scale or chord pitch-class set. Switching $K$ between chord, pentatonic, and mode would show how each system fills the same physical geography differently.

### 7. Two movement-cost metrics

The Workbench should separately compute pitch cost and embodiment cost.

For a voice moving from $(s_1,f_1)$ to $(s_2,f_2)$:

$$
c_{\text{pitch}}=|p(s_2,f_2)-p(s_1,f_1)|,
$$

while a simple physical cost might be

$$
c_{\text{body}}=\alpha|f_2-f_1|+\beta|s_2-s_1|.
$$

A unison transfer has zero pitch cost and nonzero body cost. An octave promotion has pitch cost 12 even if it occurs at a nearby fret. A useful voice-leading view needs both.

Eventually the coefficients $\alpha$ and $\beta$ could depend on fret spacing, hand position, or actual physical distance. The current Workbench already models nonlinear fret spacing, so embodiment cost can become genuinely guitar-shaped rather than an abstract Manhattan metric.

### 8. A seam-control panel

There are now two seams worth toggling independently:

- **Unwarp G–B:** display shapes in all-fourths coordinates or physical coordinates.
- **Track register:** collapse octave-equivalent roots to R or show $R_n,R_{n+1},R_{n+2}$.

The four combinations would be educational:

| Tuning coordinates | Register display | What becomes visible |
|---|---|---|
| Physical | Collapsed | Familiar CAGED diagrams |
| Unwarped | Collapsed | Pure interval translations |
| Physical | Absolute | Bodily shapes plus register handoffs |
| Unwarped | Absolute | The abstract chord lattice and its lifted CAGED path |

This is the closest thing to an X-ray view of the system.

### 9. Triad inflation and deflation

Selecting one three-string triad should offer an “inflate” action that adds the nearest chord tones on unused strings and reveals the CAGED neighborhoods compatible with that local face.

Selecting a CAGED form should offer the reverse “deflate” action, showing every complete adjacent-string triad contained in or immediately supported by the form, labeled by inversion.

This would encode the central relationship of the essays:

> A triad is a local face of the chord body; a CAGED form is a neighborhood assembled around such faces.

### 10. Invariants as executable theory

The theory should become tests. For every major key and every valid fret range, the implementation ought to verify at least these claims:

1. C and A share the same fifth-string bass root.
2. G and E share the same sixth-string bass root.
3. The A-to-G bass-root transfer preserves absolute pitch.
4. The E-to-D lowest-root selection rises exactly twelve semitones.
5. D shares its lowest root with E.
6. D shares its upper second-inversion triad with the next C form.
7. A full CAGED traversal returns to the initial form translated by twelve frets and one octave.
8. For a major key rooted at sixth-string fret $r$, scale density at $r+3$ is zero.
9. The five distinct pitch classes at $r+3$ are exactly the complement of the major scale.
10. Unwarping the G–B seam changes physical coordinates without changing any absolute pitch.

Those tests would turn the article from an interpretation into a specification.

## A physical experiment for hearing the seam

The register break should be heard before it is abstracted away.

Start with C major and play only roots through the forms.

For C and A, keep C3 at string 5, fret 3 ringing. Change the surrounding C-major notes while leaving that root untouched.

For A into G, alternate the two physical locations of the same C3:

$$
s5f3\leftrightarrow s6f8.
$$

Listen carefully: the hand moves dramatically, but the pitch does not. This is pure embodiment displacement.

For G and E, keep C3 at string 6, fret 8. Again let the chord body change around a stationary bass-root frequency.

Then move to D and omit C3. Begin from C4 at string 4, fret 10. The harmonic name is still C major and the chord remains in root position, but its floor has risen. The difference should feel like a change of lighting and gravity, not a change of identity.

Now add C3 back underneath the D shape. The mysterious discontinuity largely vanishes. That proves the source: D was not harmonically alien. The finite neighborhood had removed the lower register.

Finally, play every note on fret 11 and compare it to a C-major drone. Every string produces an outside note. Move one fret higher to fret 12 and every string returns inside the key. The abstract density calculation becomes a physical wall: zero, then six.

Repeat the experiment in another key. If the E-form root is at fret $r$, the desert is always at $r+3$.

## Toward a more useful meaning of “position”

Guitar language overloads the word *position*.

It can mean a region under the hand, a CAGED chart, a scale box, a triad occurrence, an inversion, or even the fret under the first finger. Those are not interchangeable.

The model developed here suggests more precise coordinates for a musical event:

$$
(R,\ F,\ g,\ i,\ n,\ W),
$$

where

- $R$ is the harmonic root pitch class;
- $F$ is the CAGED form or neighborhood;
- $g$ is the active string group;
- $i$ is the triad inversion;
- $n$ is the absolute root-register index;
- $W$ is the hand-window or fret region.

A single physical triad can admit multiple values of $F$ because neighborhoods overlap. Changing $g$ may rotate $i$. Moving $W$ while holding $R$ fixed may change $F$ and eventually $n$. Crossing G–B alters the physical embedding but not the abstract interval relations.

This coordinate tuple is too verbose to think consciously while improvising. That is not its purpose. Its purpose is to separate transformations during study and software design so the body can eventually compress them correctly.

The long-term sensation should be simple:

- I know which chord body surrounds me.
- I know which triadic face I am touching.
- I know where the same pitches continue.
- I know whether a root move is a unison handoff or an octave promotion.
- I know when the drawing bends at the tuning seam.
- I know where the neighborhood becomes the next register.

That is a richer kind of “position” than a box number.

## Coda

CAGED is often introduced as five movable open-chord shapes. That description is historically practical and structurally shallow.

Underneath the letters is a chord-tone lattice. Triads are its local faces. CAGED forms are overlapping hand-sized charts. The C and A charts share a fifth-string bass-root family. G and E share a sixth-string family. D is the fourth-string bridge where the lowest root from the previous register has left the window and the next root has become the floor.

The suspected fret skip is real. For a major key with an E-form root at fret $r$, fret $r+3$ contains exactly the five pitch classes outside the major scale. E and D touch at a root, but D reaches across a genuine zero-density column to join the octave-higher C neighborhood.

Collapse octaves into pitch classes and the sequence is a circle:

$$
C\to A\to G\to E\to D\to C.
$$

Restore absolute pitch and it rises:

$$
C_n\to A_n\to G_n\to E_n\to D_{n+1}\to C_{n+1}.
$$

The system was never really a circle. It only looked closed because the notation forgot how high we had climbed.

CAGED is a helix.
