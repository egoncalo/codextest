# Spellbound Tactics

Spellbound Tactics is a small browser prototype inspired by the tactical staging of Final Fantasy Tactics. Instead of striking with blades, you weave damage by spelling words on a floating astral battlefield. The entire scene, including characters, tiles, and UI textures, is generated in code with Three.js.

## Features

- **Isometric tactical board** rendered with custom tile art and floating spell runes.
- **Scrabble-style word casting** – click adjacent tiles to form words and unleash damage scaled by classic letter values.
- **Reactive enemy** that counters after each spell, forcing you to balance risk and reward.
- **Original miniatures** for the hero and enemy, along with a floating-island arena and particle skybox.

## Getting Started

1. Install a simple static server (for example, `npm install --global serve`).
2. From the repository root, run a static server such as:
   ```bash
   serve .
   ```
3. Navigate to the served URL (commonly `http://localhost:3000`) and open `index.html`.

You can also open `index.html` directly in a modern browser that supports ES modules if you prefer.

## Controls

- Click tiles to select them. Each additional tile must touch the previous selection.
- Press **Cast Word** to attack if you have at least two letters.
- Press **Clear** to reset your selection.

Win by reducing the enemy HP to zero before they drain yours.

## Technology

- [Three.js](https://threejs.org/) (via CDN module import)
- Vanilla JavaScript and HTML/CSS

No audio is included in this prototype.
