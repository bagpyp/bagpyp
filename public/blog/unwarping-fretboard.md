I was cycling major triads through their inversions on one string group, then moving the same idea toward the floor across the next group, when a pattern stopped feeling like a mnemonic and started feeling structural:

$$
\text{major third},\quad \text{minor third},\quad \text{perfect fourth}.
$$

Or, measured in semitones,

$$
4,\quad 3,\quad 5.
$$

That sequence is not merely hidden inside a major triad. It *is* the major triad, considered as a path all the way around the octave:

$$
R \xrightarrow{4} 3 \xrightarrow{3} 5 \xrightarrow{5} R'.
$$

The three inversions are just the three places where we can begin reading the same circular word. Root position reads $(4,3)$, first inversion reads $(3,5)$, and second inversion reads $(5,4)$.

This gives us a clean way to think about every major-triad shape on the guitar—except, apparently, the shapes containing the B string. Those seem to obey a different geometry. String group 2, D–G–B, is bent; string group 1, G–B–E, can look almost malicious.

But there is no second system. There is one system and one coordinate wrinkle. Once we remove that wrinkle, the triad shapes become translations again—and the $4,3,5$ path turns out to be a factorization of one of the octave vectors from [The Octave Lattice](/blog/octave-lattice).

## The interval word

A major triad divides an octave into three unequal gaps:

<div style="text-align: center; margin: 2rem 0;">
    <img src="/blog/unwarping-fretboard/img/triad-cycle.svg" style="width: 100%; max-width: 820px;" alt="The notes root, third, fifth, and octave connected by major-third, minor-third, and perfect-fourth arrows labeled 4, 3, and 5 semitones">
</div>

Because $4+3+5=12$, the last gap is just as important as the two sounding inside a close-position triad. It is the distance from the fifth back to the next root. So the complete object is the cyclic word

$$
\boxed{(4,3,5)}.
$$

Each inversion is a length-two window into it:

| Bass note | Inversion | Intervals from low to high |
|---|---|---|
| Root | Root position | $M3,\ m3$ |
| Third | First inversion | $m3,\ P4$ |
| Fifth | Second inversion | $P4,\ M3$ |

This is already a useful compression. Instead of memorizing three objects, learn one loop and choose a starting point.

It also suggests a broader equivalence. A chord inversion is a **rotation of a chord's interval word**. A mode is a **rotation of a scale's interval word**. We usually learn these as separate chapters of music theory, but they are the same operation applied to different cyclic partitions of the octave.

## How an interval becomes a fretboard shape

Number strings floorward, from low E toward high E. Moving one string floorward normally raises the open-string pitch by five semitones: a perfect fourth. If we want the played note to rise by only $n$ semitones, the fretting hand must compensate by

$$
\Delta f = n-5.
$$

That one equation produces the three shapes in the major-triad word:

| Musical interval | Semitones $n$ | Ordinary adjacent-string movement $n-5$ |
|---|---:|---:|
| Minor third | $3$ | $-2$ frets |
| Major third | $4$ | $-1$ fret |
| Perfect fourth | $5$ | same fret |

Negative means toward the nut; positive means toward the bridge.

So, on E–A, A–D, D–G, or B–E, the physical gestures are remarkably compact: two back, one back, or straight across.

Then we reach G–B.

## One seam, not a new geometry

The B string is four semitones above G, not five. Therefore, on that pair alone,

$$
\Delta f = n-4.
$$

Every target on B lands one fret farther toward the bridge than the ordinary rule predicts:

| Musical interval | Ordinary pair | G → B |
|---|---:|---:|
| Minor third | $-2$ | $-1$ |
| Major third | $-1$ | $0$ |
| Perfect fourth | $0$ | $+1$ |

The useful rule is not “learn three B-string exceptions.” It is:

> Cut the fretboard between G and B, then slide the entire B-and-high-E side one fret toward the bridge.

<div style="text-align: center; margin: 2rem 0;">
    <img src="/blog/unwarping-fretboard/img/unwarp.svg" style="width: 100%; max-width: 840px;" alt="A diagram showing the fretboard cut between the G and B strings, with the B and high E side shifted one fret toward the bridge">
</div>

That wording matters. High E participates in the correction even though B–E is itself tuned by a perfect fourth. Relative to the lower four strings, both B and high E live one fret bridgeward. Because they move together, their relationship to each other remains ordinary.

This explains the increasing strangeness of the upper string groups:

- **Group 4, E–A–D:** no notes cross the seam.
- **Group 3, A–D–G:** no notes cross the seam.
- **Group 2, D–G–B:** only the top note lies beyond the seam.
- **Group 1, G–B–E:** both the middle and top notes lie beyond it.

Group 1 is not governed by more exceptions. More of the shape has simply crossed the same cut.

## Unwarped coordinates

We can make this exact. Let $f$ be the physical fret number and define

$$
x=f-\varepsilon(s),
$$

where

$$
\varepsilon(s)=
\begin{cases}
0, & s\in\{E,A,D,G\},\\
1, & s\in\{B,e\}.
\end{cases}
$$

Call $x$ the **unwarped fret**. In $(s,x)$ coordinates, every adjacent string is five semitones away. The guitar behaves like an all-fourths instrument. To turn an abstract shape back into a physical fingering, add one fret to every note on B or high E.

For an interval of $n$ semitones moving $\Delta s$ strings floorward, the complete translation rule is

$$
\boxed{\Delta f=n+12k-5\Delta s+\Delta\varepsilon}.
$$

Here $k$ chooses an octave representative and $\Delta\varepsilon$ records whether the endpoints lie on opposite sides of the seam. This is the family of shapes for *every* interval—not only thirds and fourths.

For example, a perfect fifth has $n=7$:

- one ordinary string floorward: $7-5=+2$ frets;
- one string floorward across G–B: $7-5+1=+3$ frets;
- two ordinary strings floorward: $7-10=-3$ frets.

These are not three facts. They are three evaluations of one function.

## All four triad groups from one template

Now anchor the lowest voice of a major triad at relative fret $0$. Reading from the thickest string to the thinnest, the unwarped shapes are

$$
\begin{aligned}
\text{root position} &: [0,-1,-3],\\
\text{first inversion} &: [0,-2,-2],\\
\text{second inversion} &: [0,0,-1].
\end{aligned}
$$

Apply the seam correction and every physical group falls out:

| Inversion | Interval window | Groups 4/3 | Group 2: DGB | Group 1: GBE |
|---|---|---:|---:|---:|
| Root | $M3,m3$ | $[0,-1,-3]$ | $[0,-1,-2]$ | $[0,0,-2]$ |
| First | $m3,P4$ | $[0,-2,-2]$ | $[0,-2,-1]$ | $[0,-1,-1]$ |
| Second | $P4,M3$ | $[0,0,-1]$ | $[0,0,0]$ | $[0,+1,0]$ |

The notorious second-inversion shape on G–B–E, $[0,+1,0]$, is now almost boring. Start with the ordinary $[0,0,-1]$, then add one to the B and high-E coordinates. Nothing has gone wrong; the drawing has bent at the seam.

For C major, the three group-1 shapes are:

- root position: `5–5–3` = C–E–G;
- first inversion: `9–8–8` = E–G–C;
- second inversion: `12–13–12` = G–C–E.

The purpose of the coordinate model is not to calculate these while playing. It is to give the hand one lawful transformation to internalize instead of nine unrelated silhouettes.

## The triad path is an octave edge

In unwarped string–fret coordinates, the three interval gestures are vectors:

$$
M3=(1,-1),\qquad m3=(1,-2),\qquad P4=(1,0).
$$

Add them:

$$
(1,-1)+(1,-2)+(1,0)=(3,-3).
$$

But $(3,-3)$ is exactly the compact three-string octave move: three strings floorward and three frets toward the nut. It is the NW octave shape from the previous essay, expressed in fret coordinates.

Therefore

$$
\boxed{M3+m3+P4=\mathrm{NW}}.
$$

This is the connection I was missing when I first drew the octave lattice. A close-position major triad is not merely sitting *on* that lattice. Its complete interval cycle **factors an octave generator into three chord-tone steps**.

Play C–E–G–C across strings 6–5–4–3:

$$
(8,7,5,5).
$$

The hand travels one fret back, then two, then straight across: $M3$, $m3$, $P4$. The first C and final C are connected by the three-string octave vector. Move the path onto strings 5–4–3–2 and the final B-string note shifts one fret bridgeward, but the abstract path is unchanged.

That is precisely what “the B-string wrinkle is invisible” means in [The Octave Lattice](/blog/octave-lattice). The wrinkle changes the geometric embedding into physical fret space. It does not change the interval graph.

## Chords and scales as octave paths

Once we think in cyclic interval words, other familiar structures line up:

| Structure | Cyclic interval word |
|---|---|
| Major triad | $(4,3,5)$ |
| Minor triad | $(3,4,5)$ |
| Augmented triad | $(4,4,4)$ |
| Diminished seventh | $(3,3,3,3)$ |
| Major pentatonic | $(2,2,3,2,3)$ |
| Major scale | $(2,2,1,2,2,2,1)$ |

Every row sums to $12$. Each describes a route from one pitch-class representative to the next octave representative. Rotating the word changes the starting point without changing the underlying cyclic object.

That is why inversions and modes feel related once the fretboard begins to cohere: both are ways of entering the same loop at a different vertex.

## A physical way to learn it

The framework is only useful if it leaves the page and enters the hand. I would practice it in three passes.

First, play $m3$, $M3$, and $P4$ as dyads across D–G, then immediately across G–B. Say the offsets aloud:

$$
(-2,-1,0)\quad\longrightarrow\quad(-1,0,+1).
$$

Second, move one major-triad inversion across all four string groups. Do not name a new shape when you reach B. Imagine the seam and move the notes beyond it one fret bridgeward.

Third, play the complete four-note path $R$–$3$–$5$–$R'$ across strings 6–5–4–3, then 5–4–3–2, then 4–3–2–1. Say “four, three, five.” Hear the octave arrive. Feel where the physical drawing bends without allowing the interval path to change.

The eventual goal is not conscious arithmetic. It is a more economical muscle memory: one interval geometry, one seam operator, many manifestations.

## Coda

The guitar is often taught as a catalog of shapes, and the B string as the price we pay for using those shapes. But the B string does not destroy the translation symmetry of the musical object. It only hides that symmetry in physical coordinates.

Unwarp the coordinates and the system becomes spare again. A major triad is the word $(4,3,5)$. Its inversions are rotations. Its adjacent-string fingerings are interval vectors. Their sum is an octave edge. And every apparently strange upper-string shape is the same path, drawn across one small fold in the map.

The territory was regular all along.
