#!/bin/sh
# Generate a Vega-Lite JSON spec for mean time to recovery between releases
# Measures gap between consecutive fix releases (same major.minor)
# Usage: REPO=owner/repo AFTER=v1.1.0 ./mttr-vega.sh > chart.json
gh api "repos/${REPO}/releases?per_page=30" \
  --jq "[.[] | {tag: .tag_name, date: .published_at}] | sort_by(.date) |
    [to_entries[] | select(.value.tag | startswith(\"${AFTER:-v}\"))] |
    [range(1; length) as \$i |
      {release: .[\$i].value.tag,
       minutes: (((.[(\$i)].value.date | fromdateiso8601) -
                  (.[(\$i)-1].value.date | fromdateiso8601)) / 60 | round)}] |
    {
      \"\\\$schema\": \"https://vega.github.io/schema/vega-lite/v5.json\",
      \"description\": \"Time to recovery between releases\",
      \"width\": 500, \"height\": 200,
      \"title\": \"Time to recovery between releases\",
      \"data\": {\"values\": .},
      \"mark\": {\"type\": \"bar\", \"cornerRadiusEnd\": 3},
      \"encoding\": {
        \"x\": {\"field\": \"release\", \"type\": \"nominal\", \"sort\": null,
               \"axis\": {\"title\": null, \"labelAngle\": 0}},
        \"y\": {\"field\": \"minutes\", \"type\": \"quantitative\",
               \"axis\": {\"title\": \"Minutes to fix\"}, \"scale\": {\"type\": \"sqrt\"}},
        \"color\": {\"field\": \"minutes\", \"type\": \"quantitative\",
                   \"scale\": {\"scheme\": \"reds\"}, \"legend\": null},
        \"tooltip\": [
          {\"field\": \"release\", \"title\": \"Release\"},
          {\"field\": \"minutes\", \"title\": \"Minutes to recovery\"}
        ]
      }
    }"
