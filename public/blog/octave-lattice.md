I recently added a **Notes** tool to my guitar app: pick a note, and it lights up every place that note lives on the neck, then draws lines connecting each one to the *same note an octave higher*. The result is a woven, zig-zagging lattice:

<div style="text-align: center; margin: 2rem 0;">
    <img src="/blog/octave-lattice/img/fretboard.svg" style="width: 100%; max-width: 900px;" alt="A guitar neck with every F highlighted, connected by pink octave-shape lines forming a zig-zag lattice">
</div>

It's pretty. But stare at it long enough and a question forms: *what is this thing, structurally?* It turns out the answer is one of those small miracles where music and mathematics are quietly the same object. This octave lattice is — up to a change of basis — **the integer grid $\mathbb{Z}^2$**. Let me show you why.

## Two shapes

On a guitar in standard tuning, the fastest way to jump up an octave is to skip to a nearby string. There are exactly two compact ways to do it, which I'll name by the compass direction they travel on the neck:

- **NE** — up **2 strings**, and a couple of frets **higher**.
- **NW** — up **3 strings**, and a couple of frets **lower**.

<div style="text-align: center; margin: 2rem 0;">
    <img src="/blog/octave-lattice/img/shapes.svg" style="width: 100%; max-width: 720px;" alt="A single note with two arrows to its octave: NE going two strings up and to the right, NW going three strings up and to the left">
</div>

Each shape takes a note to the *same note, one octave up*. Every line in that first picture is one of these two moves. So let's build a graph out of them.

## The model

Let the **vertices** be all the positions on the neck that sound one pitch class (all the F's). Give each vertex coordinates

$$
v = (s, k) \in \mathbb{Z}^2,
$$

where $s$ is the string index and $k$ is the octave number. This is a faithful coordinate system: each $(s, k)$ picks out exactly one fret, so *reaching every $(s,k)$* is the same as *reaching every note*.

Now make the two shapes into **directed edges**, each pointing one octave up. As displacement vectors in $(s, k)$-space they are:

$$
\mathrm{NE} = (2, 1), \qquad \mathrm{NW} = (3, 1).
$$

Both raise the octave by one; they differ only in how far they slide across the strings.

## The one fact everything hangs on

Stack the two shape-vectors as the columns of a matrix and take its determinant:

$$
M = \begin{bmatrix} 2 & 3 \\ 1 & 1 \end{bmatrix},
\qquad
\det M = 2\cdot 1 - 3\cdot 1 = -1.
$$

Because $|\det M| = 1$, the pair $\{\mathrm{NE}, \mathrm{NW}\}$ is a **unimodular basis** of $\mathbb{Z}^2$. That single fact carries an enormous amount of structure. The linear map sending

$$
\mathrm{NE} \mapsto (1,0), \qquad \mathrm{NW} \mapsto (0,1)
$$

is a **graph isomorphism** from our octave lattice onto the Cayley graph of $\mathbb{Z}^2$ with the standard generators — that is, onto the ordinary **square grid**. The whole tangled fretboard picture *is the square grid* in disguise.

It even explains the zig-zag. Writing a vertex in the new coordinates $(a, b)$ — where $a$ counts NE moves and $b$ counts NW moves — the original coordinates come back as

$$
(s, k) = (2a + 3b,\ \ a + b).
$$

So the **octave number is $k = a + b$**: it is the *anti-diagonal* of the grid. Lines of constant octave are diagonals, which is exactly why the lattice looks like a diamond weave. The picture is a square grid stood on its corner, with octave as height.

<div style="text-align: center; margin: 2rem 0;">
    <img src="/blog/octave-lattice/img/grid.svg" style="width: 100%; max-width: 760px;" alt="A 45-degree rotated square grid, nodes two-colored by octave parity, with NE and NW drawn as basis vectors and octave shown as the diagonal height">
</div>

## What we get for free

Once you know a graph *is* the square grid, its properties are just library results:

- **Bipartite**, with chromatic number $2$. Two-color the notes by the parity of their octave; every edge joins an even octave to an odd one. There are no odd cycles, and the **girth is $4$** (the smallest loop is one grid square: NE, NW, back-SW, back-SE).
- **Planar**, genus $0$.
- **$4$-regular in the interior**: two octaves *up* (NE, NW) and two octaves *down* (their mirrors, SW and SE). The real neck is a finite window, so its border vertices simply lose the edges that would run off the fretboard.
- **Connected** — a single component. You can even see it: NE followed by the downward mirror SE nets a displacement of $(-1, 0)$, a pure one-string sidestep *within the same octave*. The shapes generate lateral motion, so nothing is stranded.
- **Manhattan distances.** The fewest octave-shapes between two notes with displacement $(\Delta s, \Delta k)$ is the $L^1$ distance in the shape-basis:

$$
d = |{-\Delta s + 3\,\Delta k}| \; + \; |\Delta s - 2\,\Delta k|.
$$

A plain octave up is one hop, as it should be. The neck's **diameter** grows only like *(number of octaves) + (notes per octave)* — it's small; everything is a few shapes from everything else.

## Why you must learn *both* shapes

Here's my favorite consequence, because it's also practical advice. Take one shape on its own — say NE $= (2,1)$. By itself it generates only the line $\{\,n\cdot(2,1)\,\}$: a rank-one sublattice. The NE-only subgraph is therefore a **disjoint union of paths** — isolated "ladders" climbing the neck that never touch each other. Same for NW.

A single shape can never cover the fretboard, because one vector can't span a plane. You need $\det = \pm 1$, and that requires **both** generators together. Two rank-one forests, unioned, become the full grid. That is the graph-theoretic statement of a very old piece of guitar wisdom: *own both octave shapes and the whole neck opens up.*

## The B-string wrinkle is invisible

Guitarists know the annoying asymmetry: the interval between the G and B strings is a major third, not the perfect fourth between every other pair. It's the one-fret "hiccup" that makes octave shapes shift when they cross those strings.

In this framework, that wrinkle is beautifully powerless. Crossing the G–B boundary changes the **fret offset** of an edge by one — but it does **not** change the displacement $(\Delta s, \Delta k) = (2,1)$ or $(3,1)$. The combinatorial graph never sees it. The wrinkle is purely a distortion of the *geometric embedding* into fret-space: the lattice stays a perfect, translation-invariant grid, and only the drawing of it bends. The map is warped; the territory is pristine.

## Coda

None of this changes a single note you'd play. But I find it clarifying that the thing your fingers are memorizing — "octaves are everywhere, and there are basically two ways to grab them" — is, formally, the statement that two unimodular vectors tile the plane. The fretboard isn't an arbitrary tangle. It's $\mathbb{Z}^2$, rotated onto its corner, with a cosmetic dent between the G and B strings.

You can play with the live version — tap any note to see its octave shapes, or turn on the full lattice — in the **Notes** tab of my [guitar app](/projects/guitar/notes).
