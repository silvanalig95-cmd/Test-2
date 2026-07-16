# Map generator

`gen_map.mjs` builds the game's province geometry from real coastline data:

1. `npm i d3-geo d3-delaunay topojson-client polygon-clipping world-atlas`
2. `node gen_map.mjs` — writes `provdata.json` and a `preview.html`

Pipeline: Natural Earth 50m land (world-atlas) → clipped to the North-Sea
region in geographic space → conic conformal projection fitted to a
1000×800 viewBox → Voronoi partition around ~70 historical seats (plus
dummy seeds that absorb out-of-scope land) → each cell intersected with the
landmass → Douglas-Peucker simplification → adjacency from shared raw
boundary vertices, plus manual straits; coastal flag from cell/land area
ratio. The result is embedded in `index.html` as `PROVDATA`.
