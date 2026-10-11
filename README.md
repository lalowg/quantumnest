# QUANTUMNEST — Beyond the Possible

A quantum computing studio that explains itself through a single object: **a crystalline sculpture that re-forms for each idea**. The site is laid out like a museum catalogue. Each section is a numbered plate with a gold hairline frame, engraved figures and mono captions, and the sculpture stands at the centre of Plate I with annotations drawn out to it on leader lines.

Production URL: `https://quantumnest.vercel.app`

> Fictional concept brand, built as a portfolio project. QuantumNest is not a real company. Every visualisation is illustrative, not a quantum simulation, and the site says so in persistent labels.

---

## Concept

Quantum computing is usually sold with glowing spheres and big numbers. QuantumNest takes the opposite stance: precise, calm and honest, like a good science museum. One crystal field of 256 glass-like instances (144 on small screens) re-arranges itself into five plates:

| Plate | What the sculpture becomes |
|---|---|
| I · Qubit | A crystal Bloch sphere. A chain of crystals forms the state vector and slowly precesses; the poles mark 0 and 1, and three gold orbits trace the sphere's wireframe. |
| II · Superposition | Two interpenetrating shells, icy for 0 and gilded for 1. Their crystals swell and shrink as the two amplitudes trade weight. |
| III · Entanglement | Two clusters whose central spins always point in opposite directions, joined by a slowly turning double helix. |
| IV · Interference | A tilted field of crystals riding two overlapping waves. Crystals on the in-step ridges grow and turn gold; those in the calms shrink. |
| V · Error correction | A simplified surface-code lattice. One data crystal flips gold, its neighbouring measure crystals raise the alarm, and the flip is corrected. A ring of crystals stands for the single logical qubit. |

## Brand & positioning

- **Name:** a "nest" is where something fragile is held safely. For a quantum processor, that is the cryogenic column that keeps it colder than deep space.
- **Promise:** *Beyond the possible*, delivered with restraint. The studio explains before it sells, and it says plainly where quantum computing probably won't help.
- **Tone:** curatorial and exact, with a little wit. There are no performance figures, no clients and no awards. History entries are real, dated publications, and the single fictional entry is labelled as fiction.
- **Conversion:** "Request a private viewing" of the sculpture, a research briefing or a press visit. It is a demo form and nothing is sent.

## Audience

Research leads, technology strategists, science journalists and curious executives who have read the hype and want a clear mental model. They value precision and are put off by marketing gloss.

## Art direction

- **Palette:** midnight `#070B1F`, frost `#EAF2FF`, ice `#9FB8FF` and gold hairline `#C8A96A`. Derived tones: navy `#0C1430`, deep `#111C44` and gold-soft `#E3CC98` for italic accents.
- **Museum plates:** every section carries a plate number (`Plate II`) in gold with a hairline rule. The hero is framed by a thin gold border with corner ticks and a catalogue line (`Cat. QN–001`).
- **Engraving:** all figures (the Bloch sphere, the slit schematic, the dilution refrigerator, the history glyphs and the viewing plate) are hand-built SVG line art in ice, frost and gold, with fine hatching in the fallback sculpture. A faint film grain sits over everything.
- **Crystal material:** a custom shader with faceted normals, a Fresnel rim in ice, specular glints in frost, a thin iridescent film that intensifies while the sculpture re-forms, and a gold mix for highlighted crystals. Additive blending makes the field read as lit glass on midnight.
- **Logo:** an original mark of a faceted crystal (an octahedron in elevation) held inside two crossed gold orbits, with a single gold "qubit" bead. The wordmark sets "Quantum" upright and "Nest" in italic gold. See `logo.svg`; `favicon.svg` is the mark on a midnight tile.

## Typography

- **Literata** (300/400 with italics, optical sizing) for display: headlines, plate titles, numerals, ledes and form inputs. Italic carries the emotional or conceptual words.
- **Azeret Mono** (300/400/500) for text, captions, labels and controls. It gives the catalogue a laboratory feel; uppercase labels are tracked at 0.16–0.2em.
- Both load from Google Fonts with `display=swap`. Headings use `text-wrap: balance` and `overflow-wrap: normal`, so words never break mid-word.

## Motion language

- **Re-forming:** switching plates morphs every crystal from its old position to its new one with a per-crystal stagger, a brief outward bloom and an iridescent pulse, so the sculpture appears to dissolve and recrystallise. The gold orbits glide to new tilts at the same time.
- **Drawing on:** figures draw their strokes on (normalised `pathLength`), and the annotation leader lines draw from the sculpture out to their labels once each morph lands.
- **Measurement reveal:** section headings arrive as a doubled, superposed ghost (ice and gold offsets) that collapses into one crisp line when observed.
- **Plate rules:** a gold hairline extends across the top of each plate as it enters.
- **Scroll storytelling:** in Plate III the refrigerator stages light up in gold and the thermometer counts down on a log scale as you read. Plate IV is a pinned horizontal track on desktop.

## Signature interaction: how to use it

1. **Choose a plate** with the tabs along the bottom of the hero (Qubit, Superposition, Entanglement, Interference, Error correction). Arrow keys, Home and End move between tabs. The previous and next buttons step through them too.
2. **Watch it re-form.** The caption, engraved mini-figure and three lettered annotations (a, b, c) update; on desktop the annotations are joined to live points on the sculpture by gold leader lines. On phones the points are marked with lettered pins and the notes sit beneath.
3. **Turn it.** Drag the sculpture sideways (mouse, pen or touch); a mouse drag also tilts it. The turn buttons do the same from the keyboard, and the pause button stops the slow automatic turning.

**Plate II · the interference bench** is a second, tool-like interaction. Fire particles one at a time, 500 at once or as a stream. Each lands as a single dot, and the stripes build up in the tally below. Adjust the slit separation, wavelength and phase shift, or switch on the which-path detector to watch the stripes disappear. The gold hairline shows the textbook prediction. Changing a setting clears the screen.

## Sections

1. **Plate I · Sculpture:** the hero and concept explorer.
2. **Plate II · Interference bench:** an operable double-slit bench on canvas.
3. **Plate III · The nest:** a sticky, engraved dilution refrigerator with a log-scale thermometer that follows the story from 300 K to about 10 mK.
4. **Plate IV · History:** a pinned horizontal timeline of real milestones from 1980 to 2012, ending with one labelled fictional chapter.
5. **Plate V · Applications:** an expandable index rating where quantum may matter and where it probably won't, with editorial confidence dots.
6. **Plate VI · Request a viewing:** a validated demo form.
7. **Footer:** plate navigation, colophon and credit.

## Tech

- Static HTML, CSS and ES modules with no build step.
- `sculpture.js` uses **Three.js 0.169.0** (import map, jsDelivr): one `InstancedMesh` with a custom `ShaderMaterial` and a per-instance glow attribute, three gold `LineLoop` orbits, a plinth and a point-dust backdrop. Layout functions per plate run on the CPU each frame, and anchor points are projected to screen space for the SVG annotation overlay.
- `bench.js` is a canvas 2D bench. Arrivals are drawn by rejection sampling from `I(x) = sinc²(β)·cos²(γ + φ/2)` and plotted incrementally to an offscreen layer.
- `sections.js` handles the nest scrollytelling (IntersectionObserver plus a log-scale tween), the pinned track, the index accordion and the form.
- `main.js` handles the header, the menu, the explorer, annotations and reveals. The total hand-written JS is about 60 KB.

## Local development

```bash
npx serve .
```

Then open the printed localhost URL. ES modules need a server; opening `index.html` from the file system will not load the scripts.

## Accessibility

- One `h1`, a skip link, landmarks and an ordered plate navigation with `aria-current`.
- The explorer is a WAI-ARIA tablist with roving tabindex and keyboard support. The canvas has a text label, and every canvas action has a button equivalent (previous, next, turn left, turn right, pause).
- Bench controls are native range inputs with live `<output>` values, plus `role="switch"` toggles and an `aria-live` note.
- The form has visible labels, inline errors linked through `aria-describedby`, `aria-invalid`, focus moved to the first problem and a focused success message that says nothing was sent.
- `prefers-reduced-motion: reduce` freezes the sculpture in a still pose, makes plate changes instant, stops auto-turning and disables the pinned track and transitions. Every interaction still works.
- Visible gold `:focus-visible` outlines throughout.

## Performance

- The DPR is capped at 2 on desktop and 1.5 on small or touch screens, with fewer crystals and dust points on small screens and no antialiasing there.
- The render loop pauses when the hero is off screen (IntersectionObserver) or the tab is hidden. In reduced-motion mode it renders only on demand.
- There is one WebGL context per page; the bench uses canvas 2D.
- If WebGL is unavailable, fails to load or loses its context, a designed SVG sculpture is shown with fixed annotation points, and the explorer keeps working.

## Known limitations

- The sculpture is illustrative choreography, not a physical model. The Bloch sphere, amplitudes and lattice are simplified for clarity (the surface-code patch uses 16 measure crystals rather than the full 24).
- Refrigerator temperatures are typical orders of magnitude for a generic dilution refrigerator, not a product specification.
- The pinned history track is desktop-only. Phones and tablets get a swipeable track with buttons.
- `og.png` is rendered separately by the lead.

---

Designed & built by Saad Bashir — https://www.linkedin.com/in/saadbashirmarketing/
