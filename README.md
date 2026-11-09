# The Flight Museum
Vibe Jam 2026 — Team 8

A first-person browser game: walk around a museum hall full of jet fighters, read the plaques —
and whatever you do, do not press the red button.

## Run locally
ES modules need a web server (not `file://`):

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Controls
| Key | |
|---|---|
| W A S D / arrows | move |
| Mouse | look |
| Shift | sprint |
| E / click | interact |
| Esc | pause |

## Files
- `index.html` — page, HUD, start screen and crash screen
- `src/main.js` — renderer, controls, game loop
- `src/museum.js` — the hall, lights, exhibits and the button
- `src/aircraft.js` — procedural aircraft models
- `src/textures.js` — textures drawn on canvas (floor, plaques, camouflage)
- `src/crash.js` — what happens when someone presses the button
- `lib/` — Three.js r170 (MIT, see `lib/THREE-LICENSE`), bundled so the site works as static files

## Test mode
`?view=x,y,z,lx,ly,lz` places the camera without locking the mouse, and `&crash=seconds`
fast-forwards the crash — handy for screenshots.
