I was running G major from the low G at `s6f3` when the usual seven-box picture split open.

The same two-octave ascent did not seem to belong to only one box. I could launch it with one note on the sixth string, with two notes there, or with three. Each choice poured the same scale through a different neighboring position.

That observation is bigger than a fingering trick. It reveals a small, complete system:

$$
7\ \text{modal tonics}\times 3\ \text{launches}=21\ \text{two-octave routes}.
$$

Every route contains **15 distinct absolute pitches** from tonic to tonic over **24 semitones**. Every route uses all six strings and the same seven-note collection. What changes is where the 15-note window begins inside a 17-note box, which neighboring box hosts it, and how its notes are distributed across the strings.

This is the thought that turned seven boxes into twenty-one paths.

<div class="major-scale-route-hero" role="region" aria-label="Scrollable overview of the three A Dorian routes">
    <img src="/images/blog/major-scale-three-ways.svg" alt="Three rows of six string cells showing the one-note, two-note, and three-note A Dorian launches, each containing fifteen notes and a highlighted tonic spine">
</div>
<p class="major-scale-route-hero-hint"><em>Swipe sideways to inspect the full route diagram.</em></p>

## First, two useful refinements

The discovery was right; two neighboring labels had simply crossed while I was saying it out loud.

If the tonic is **A** at `s6f5`, the three launches live inside the positions conventionally named **F# Locrian**, **G Ionian**, and **A Dorian**. If the tonic is **G** at `s6f3`, everything shifts back one degree: the hosts are **E Aeolian**, **F# Locrian**, and **G Ionian**.

That off-by-one is not a problem with the idea. It is the clue that makes the entire system calculable.

There is one note-level refinement too. The original two-note A launch was sketched as

```text
s6f5, s6f7, s5f2, ...
```

The pitches are A–B–B: `s6f7` and `s5f2` are the same B in the same register. That can be a useful **unison transfer**, but it repeats a note. For a strictly ascending scalar route, the third note is C at `s5f3`:

```text
s6f5(A), s6f7(B), s5f3(C), ...
```

The underlying observation survives both refinements. In fact, it becomes exact.

## What the boxes actually contain

It is tempting to call these “three-notes-per-string” boxes and assume that every string contains three notes. The live app's major boxes are more precise than that.

Each box is a strictly ascending sequence of **17 notes**, which I will call

$$
x_0,x_1,\ldots,x_{16}.
$$

The low and high E strings show the same three scale degrees at the same frets. Between them, exactly one interior string contains two notes instead of three. So every box has the string-count multiset

$$
3+3+3+3+2+3=17.
$$

That two-note string is structural. Together, the five strings below high E contain 14 notes, so high E restarts 14 scale steps after $x_0$ on the same degree triplet:

$$
14\equiv0\pmod7.
$$

If all five lower strings carried three notes, they would contribute 15 steps. High E would begin one scale degree later than low E, and the shape would drift bridgeward instead of closing into E-to-E symmetry.

In this implementation, the two-note exception falls on string 3 for the Dorian and Phrygian hosts, and on string 2 for Ionian, Lydian, Mixolydian, Aeolian, and Locrian. That is why the launch loads are not one universal `[1,3,3,3,3,2]`-style formula. They inherit the host box's interior seam.

## Three windows hiding in every box

A two-octave run through a seven-note scale, including both tonic endpoints, contains

$$
7+7+1=15
$$

notes. A 17-note box therefore contains exactly three consecutive 15-note windows:

| Window | Low-E launch | High-E finish |
|---|---:|---:|
| $x_0\ldots x_{14}$ | 3 notes | 1 note |
| $x_1\ldots x_{15}$ | 2 notes | 2 notes |
| $x_2\ldots x_{16}$ | 1 note | 3 notes |

This is the heart of the discovery. The three routes are not extra diagrams laid on top of a box. They are the three maximal two-octave windows already contained inside it.

The load on low E and high E is complementary:

$$
\text{low-E load}+\text{high-E load}=4.
$$

The host's one interior two-note string stays where it is. All three routes use all six strings and all three end on high E at the same fret where they began on low E.

This is also why a pure all-3NPS extrapolation gives the wrong geometry for these particular boxes. It removes the interior seam, loses the mirrored E-string triplets, and sends one route to string 2. That can define another valid fingering system, but it is not the one drawn by the app or the one analyzed here.

## Collection, mode, position, route

Four ideas tend to collapse into the word *scale*, so it helps to pull them apart.

| Layer | In this example | What it tells us |
|---|---|---|
| **Collection** | G–A–B–C–D–E–F# | Which pitch classes are available; no tonic is implied by the set alone |
| **Mode** | A Dorian | Which note is tonic and how the collection is heard relative to it |
| **Position** | the G Ionian host | Which physical 17-note fretboard neighborhood contains the notes |
| **Route** | A Dorian, 2-note launch | Which ordered, register-specific 15-note window the hand follows |

[Open Music Theory distinguishes a collection from a scale](https://openmusictheory.github.io/scales2.html) by whether a tonal center has been established. [Berklee's guitar-scale overview](https://online.berklee.edu/takenote/how-to-start-learning-your-guitar-scales/) makes the complementary fretboard point: one parent scale yields seven modal fingerings, while each fingering can tonicize its own starting note.

The new piece is the last row of the table. A **route** is not another collection, another mode, or even another box. It is an oriented window through a box.

That is why an A-to-A line can remain A Dorian while living inside a position labeled G Ionian. The host name describes the box's low-E alignment. It does not overrule the tonic being heard.

## The host-position formula

Number the modes of the G-major system in scale order:

$$
\begin{array}{c|ccccccc}
i&0&1&2&3&4&5&6\\
\hline
\text{mode}&G\ I&A\ D&B\ P&C\ L&D\ M&E\ A&F\#\ L
\end{array}
$$

Here the abbreviations mean Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, and Locrian.

Let $i$ be the route's modal-tonic index and $k$ its low-E launch count. Then the canonical host index is

$$
\boxed{h=(i+k-3)\bmod7}.
$$

The reason is visible in the three windows. A one-note launch begins on the host's **third** low-E note, a two-note launch begins on its **second**, and a three-note launch begins on its **first**:

$$
\begin{aligned}
k=1 &: h=i-2,\\
k=2 &: h=i-1,\\
k=3 &: h=i.
\end{aligned}
$$

For A Dorian, $i=1$, so the hosts are

$$
h=6,0,1=F\#\text{ Locrian},\ G\text{ Ionian},\ A\text{ Dorian}.
$$

For G Ionian, $i=0$, so they are

$$
h=5,6,0=E\text{ Aeolian},\ F\#\text{ Locrian},\ G\text{ Ionian}.
$$

The arithmetic is cyclic because the modal labels are cyclic. The physical fretboard keeps going rather than wrapping; the modulo operation wraps names, not registers.

## All 21 routes in the G-major system

The following table is the whole family. Each cell names the host and gives its six-string load vector from strings 6 through 1. The starting fret $r$ is the tonic on low E; every route finishes at `s1f r`.

*On a phone, swipe the table sideways to reveal all three launches.*

| Starting mode | Low tonic | 1-note launch | 2-note launch | 3-note launch |
|---|---:|---|---|---|
| G Ionian | `s6f3` | E Aeolian · `[1,3,3,3,2,3]` | F# Locrian · `[2,3,3,3,2,2]` | G Ionian · `[3,3,3,3,2,1]` |
| A Dorian | `s6f5` | F# Locrian · `[1,3,3,3,2,3]` | G Ionian · `[2,3,3,3,2,2]` | A Dorian · `[3,3,3,2,3,1]` |
| B Phrygian | `s6f7` | G Ionian · `[1,3,3,3,2,3]` | A Dorian · `[2,3,3,2,3,2]` | B Phrygian · `[3,3,3,2,3,1]` |
| C Lydian | `s6f8` | A Dorian · `[1,3,3,2,3,3]` | B Phrygian · `[2,3,3,2,3,2]` | C Lydian · `[3,3,3,3,2,1]` |
| D Mixolydian | `s6f10` | B Phrygian · `[1,3,3,2,3,3]` | C Lydian · `[2,3,3,3,2,2]` | D Mixolydian · `[3,3,3,3,2,1]` |
| E Aeolian | `s6f12` | C Lydian · `[1,3,3,3,2,3]` | D Mixolydian · `[2,3,3,3,2,2]` | E Aeolian · `[3,3,3,3,2,1]` |
| F# Locrian | `s6f14` | D Mixolydian · `[1,3,3,3,2,3]` | E Aeolian · `[2,3,3,3,2,2]` | F# Locrian · `[3,3,3,3,2,1]` |

Read one row horizontally to hold the mode constant while changing the hand's route. Read one column vertically to hold the launch mechanics constant while moving through all seven modal tonics. Read the host names diagonally and the same modal sequence keeps cycling.

This is the 21-pattern expansion: not 21 new modes, but 21 physical embeddings of seven modes into three overlapping-window types.

## A Dorian, written all the way out

The A row makes the abstraction tangible. All three paths spell exactly the same ascending pitches:

$$
A\ B\ C\ D\ E\ F\#\ G\ A\ B\ C\ D\ E\ F\#\ G\ A.
$$

Only the string changes happen in different places.

**1-note launch — hosted by F# Locrian**

```text
s6f5(A) |
s5f2(B)-f3(C)-f5(D) |
s4f2(E)-f4(F#)-f5(G) |
s3f2(A)-f4(B)-f5(C) |
s2f3(D)-f5(E) |
s1f2(F#)-f3(G)-f5(A)
```

Load: `[1,3,3,3,2,3]`.

**2-note launch — hosted by G Ionian**

```text
s6f5(A)-f7(B) |
s5f3(C)-f5(D)-f7(E) |
s4f4(F#)-f5(G)-f7(A) |
s3f4(B)-f5(C)-f7(D) |
s2f5(E)-f7(F#) |
s1f3(G)-f5(A)
```

Load: `[2,3,3,3,2,2]`.

**3-note launch — hosted by A Dorian**

```text
s6f5(A)-f7(B)-f8(C) |
s5f5(D)-f7(E)-f9(F#) |
s4f5(G)-f7(A)-f9(B) |
s3f5(C)-f7(D) |
s2f5(E)-f7(F#)-f8(G) |
s1f5(A)
```

Load: `[3,3,3,2,3,1]`.

The [Guitar World lesson on the seven G-major 3NPS positions](https://www.guitarworld.com/lessons/mastering-the-modes-of-g-major-with-three-notes-per-string) supplies the familiar neighboring-position vocabulary. The app's 17-note boxes add a deliberate refinement: one interior 2NPS string closes each position into matching low- and high-E triplets. The three routes then appear as overlapping windows through that closed form.

## The tonic spine inside each route

Ignore every non-tonic for a moment. What remains is a three-point spine: tonic, octave, double octave.

If the low tonic is `s6f r`, the app-native spines are

$$
\begin{aligned}
k=1 &: s6f r\longrightarrow s3f(r-3)\longrightarrow s1f r,\\
k=2 &: s6f r\longrightarrow s4f(r+2)\longrightarrow s1f r,\\
k=3 &: s6f r\longrightarrow s4f(r+2)\longrightarrow s1f r.
\end{aligned}
$$

For A, with $r=5$, those become

$$
\begin{aligned}
k=1 &: s6f5\to s3f2\to s1f5,\\
k=2 &: s6f5\to s4f7\to s1f5,\\
k=3 &: s6f5\to s4f7\to s1f5.
\end{aligned}
$$

The two- and three-note launches share the same tonic spine even though their surrounding notes live in different host boxes and cross strings at different scale degrees. That is a useful visual lesson: identical skeletons can support different scalar surfaces.

These landmarks are octave equivalences, not arbitrary dots. In [standard tuning](https://www.fender.com/articles/setup/standard-tuning-how-eadgbe-came-to-be), the open strings are E–A–D–G–B–E; all adjacent pairs are fourths except G–B, which is a major third. That one seam accounts for the apparent one-fret change among physical octave shapes.

This connects the routes directly to [The Octave Lattice](/blog/octave-lattice). Each scale path fills in the diatonic steps between three vertices of that lattice. The load vector describes the route's **surface**; the tonic spine describes its **skeleton**.

## Why the three routes feel different

The pitch content and endpoints are invariant, but the body's job is not.

The one-note launch changes strings immediately. It makes the first octave arrive on string 3 and leaves three notes for high E. This is useful for learning to see a tonic at the *right edge* of a neighboring box rather than assuming every pattern begins at its lowest visible note.

The two-note launch is the balanced bridge. It begins on the middle low-E note, reaches its middle tonic on string 4, and places two notes on high E. It is also the route most likely to expose the difference between a real ascent and a unison transfer: `s6f7(B) → s5f2(B)` preserves pitch, while `s6f7(B) → s5f3(C)` continues the scale.

The three-note launch begins at $x_0$, the host's first note. Its low and high E loads are 3 and 1, and its first octave arrives on string 4. It feels most like the canonical position because route and host have the same modal name.

None is the master fingering. They illuminate different boundaries of the same position system.

## How I would practice the 7×3 map

**1. Separate tonic from host.** Say both names before playing: “A Dorian, F# Locrian host, one-note launch.” That sentence prevents the position label from quietly becoming the tonal center.

**2. Play the spine first.** Touch only the three tonics, then fill in the scale tones between them. The route becomes two octave spans rather than fifteen unrelated dots.

**3. Keep one row fixed.** Play all three A Dorian routes over an A drone. The collection stays fixed, the heard tonic stays fixed, and only the physical embedding changes.

**4. Keep one column fixed.** Take the two-note launch through G Ionian, A Dorian, B Phrygian, and onward. Now the low/high string rhythm stays fixed while the modal root and fretboard location move.

**5. Find the two-note seam.** Before playing a host box, predict whether its interior 2NPS string is string 3 or string 2. That turns the apparent exception into the landmark that keeps the box from drifting.

**6. Turn routes into phrases.** Pause on the characteristic degree of each mode, sequence groups of three or four, reverse only one octave, or connect one route upward to a different route downward. The 21 forms are scaffolding for phrasing, not a demand to play scales straight forever.

## A better visualization than seven sealed boxes

The usual box diagram answers one question: *where are the allowed notes?* This discovery asks four more:

- Which 15-note window is active inside the 17-note host?
- Where does the route enter and leave the box?
- Where is the host's two-note interior seam?
- Which octave representatives form the tonic spine?

That is why the live major-scale page now includes a **Two-octave route lab** with two complementary views. **21 routes** expands every modal tonic into the 1-note, 2-note, and 3-note launches. **7 boxes** folds those paths back into their 17-note hosts. The selected-route detail keeps the route's tonic separate from its `host: tonic mode` label, and the diagram can speak in **Degrees**, **Notes**, or **Steps**.

[Open the interactive 21-route map](/projects/guitar/boxes/major) and try reading it in all four directions: across launches, down modes, diagonally through hosts, and vertically through each tonic spine.

## Coda

Seven modal boxes are useful, but they are static nouns. The twenty-one routes are verbs.

The collection tells us which notes exist. The mode tells us which note feels like home. The position tells us where the hand is. The route tells us how the hand moves. Once those layers are separated, a shape labeled F# Locrian can carry an A Dorian ascent without contradiction, and a 17-note position reveals three complete two-octave paths already nested inside it.

The deeper lesson is not that there are more patterns to memorize. It is that the patterns were overlapping all along.

## Sources and further reading

- [Berklee Online — How to Start Learning Your Guitar Scales](https://online.berklee.edu/takenote/how-to-start-learning-your-guitar-scales/)
- [Open Music Theory — Collections and Scales](https://openmusictheory.github.io/scales2.html)
- [Fender — Standard Tuning: How EADGBE Came to Be](https://www.fender.com/articles/setup/standard-tuning-how-eadgbe-came-to-be)
- [Guitar World — Mastering the Modes of G Major with Three Notes Per String](https://www.guitarworld.com/lessons/mastering-the-modes-of-g-major-with-three-notes-per-string)
