---
title: Global Map Data from Overture
date: 2026-09-09T06:42:33-07:00
tags: [geospatial, overture, duckdb, d3, tools]
toc: true
series: []
summary: Global OSM map data is even easier to get with Overture.
draft: false
featured: false
images: []
hero_alt:
---

I've been building better basemaps for [alwaysmap](https://alwaysmap.app/), and the [Natural Earth](https://www.naturalearthdata.com/) data I started with runs out at about the 40-mile view: a metro area gets three place names and one river. The next step is OpenStreetMap, and my first thought was that it might be worth just doing one big download for the vector data.

It isn't, because [Overture Maps](https://docs.overturemaps.org/) lets you skip that. It's a foundation that publishes global map data, much of it OSM-derived, as [GeoParquet](https://geoparquet.org/) in a public S3 bucket. Six themes: `addresses`, `base` (land, water, land use), `buildings`, `divisions` (countries down to neighborhoods), `places`, and `transportation`. Releases are named by date, like `2026-08-19.0`, and each one is a set of files at a predictable path:

```
s3://overturemaps-us-west-2/release/2026-08-19.0/theme=divisions/type=division/*
```

## Two Ways to Get a Slice

The [Python CLI](https://docs.overturemaps.org/getting-data/overturemaps-py/) pulls a bounding box straight into GeoJSON:

```sh
pip install overturemaps
overturemaps download \
  --bbox=-71.068,42.353,-71.058,42.363 \
  -f geojson \
  --type=building \
  -o boston_buildings.geojson
```

Or you point [DuckDB](https://duckdb.org/) at the bucket. Every row carries a `bbox` struct, so a `WHERE` clause on it means DuckDB only reads the parquet row groups that overlap your box, and you never download the theme. Here's the [documented example](https://docs.overturemaps.org/getting-data/duckdb/), trimmed:

```sql
INSTALL httpfs; LOAD httpfs; INSTALL spatial; LOAD spatial;
SET s3_region='us-west-2';
SELECT id, names.primary AS name, geometry
FROM read_parquet('s3://overturemaps-us-west-2/release/2026-08-19.0/theme=places/type=place/*', hive_partitioning=1)
WHERE categories.primary = 'pizza_restaurant'
  AND bbox.xmin BETWEEN -75 AND -73
  AND bbox.ymin BETWEEN 40 AND 41;
```

## How I'm Using It

The alwaysmap basemap build (the `mapshop` repo, which is private) shells out to the DuckDB CLI at build time to pull every named locality with a population, then the rest of the pipeline cuts those into label tiles:

```sql
INSTALL httpfs; LOAD httpfs; INSTALL spatial; LOAD spatial; SET s3_region='us-west-2';
COPY (
  SELECT subtype, names.primary AS name, names.common['en'] AS name_en, population,
         cartography.prominence AS prominence,
         ROUND(ST_X(geometry), 4) AS lng, ROUND(ST_Y(geometry), 4) AS lat
  FROM read_parquet('s3://overturemaps-us-west-2/release/2026-08-19.0/theme=divisions/type=division/*', hive_partitioning=1)
  WHERE subtype IN ('locality','county')
    AND (population >= 1000 OR subtype = 'county')
    AND names.primary IS NOT NULL
) TO '.cache/overture/2026-08-19.0/divisions.parquet' (FORMAT parquet, COMPRESSION zstd);
```

For the Boise view that turns three Natural Earth labels into 74 localities and 6 counties. Nampa, Meridian, Eagle, and Kuna (about 280,000 people between them) simply don't exist in Natural Earth.

## How Big It Is, and How It Fits on a Phone

It's a planet's worth of data. The `divisions` theme is about 0.6 GB and a bounding-box query answered in 22 seconds from my laptop. Water alone in the `base` theme is 28 GB, and the four themes I want, filtered down to just the classes I draw, are still around 70 GB. My home connection pulled from the bucket at roughly 0.1 MB/s, so for anything that size the plan is a throwaway VM in `us-west-2` next to the bucket that runs DuckDB, cuts tiles, uploads them, and is destroyed the same day.

None of that reaches the browser. [D3](https://d3js.org/) renders from small static [TopoJSON](https://github.com/topojson/topojson) files that are simplified and cut at build time, then picked by how much of the world is on screen:

| View | Source | What the browser fetches |
|---|---|---|
| Planet, span over ~60° | Natural Earth 110m | One 180 KB file |
| Continent, span down to ~9° | Natural Earth 50m | One 1.5 MB file |
| Region, below ~9° | Natural Earth 10m cut into 10°×10° cells | Only the cells under the viewport, roughly 200 KB each |
| Local, the 40-mile band | Overture on a 2.5° sub-grid inside those cells | Only the sub-cells under the viewport |

A page view fetches at most a handful of cells plus one labels file, with a 500 KB (brotli) budget for the lot. Labels live in their own small per-tier file so they never depend on which geometry cells have loaded, and land cells are fill-only with the coastline drawn as a separate line, otherwise every cell edge would show as a stroke. The old approach was one 7.4 MB planet file at the 10m tier, which is what a phone had to download and parse to show 40 miles of Idaho.

A couple of things to know before you try this:

- Overture has no coastline *line* type. Land and water are polygons, so if you cut them into tiles the seams show. I still get coastlines from [osmdata](https://osmdata.openstreetmap.de/) for that reason.
- Licensing varies by theme. `base`, `buildings`, `divisions`, and `transportation` are ODbL (they're OSM-derived), `places` is CDLA Permissive 2.0, and `addresses` depends on the country. The [attribution page](https://docs.overturemaps.org/attribution/) has the full list and what you need to credit.
