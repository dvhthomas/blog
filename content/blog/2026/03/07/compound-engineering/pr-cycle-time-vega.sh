#!/bin/sh
# Generate a Vega-Lite JSON spec for PR cycle time from any GitHub repo
# Usage: REPO=owner/repo ./pr-cycle-time-vega.sh > chart.json
gh api "repos/${REPO}/pulls?state=closed&per_page=50" \
  --jq '{
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "PR cycle time",
    "width": 500,
    "height": 350,
    "title": "PR cycle time (created \u2192 merged)",
    "data": {
      "values": [.[] | select(.merged_at != null) | {
        pr: "#\(.number)",
        title: (.title | if length > 40 then .[:40] + "\u2026" else . end),
        minutes: (((.merged_at | fromdateiso8601) - (.created_at | fromdateiso8601)) / 60
                  | . * 10 | round / 10)
      }]
    },
    "mark": {"type": "bar", "cornerRadiusEnd": 3},
    "encoding": {
      "y": {"field": "title", "type": "nominal",
             "sort": {"field": "minutes", "order": "ascending"},
             "axis": {"title": null, "labelLimit": 250}},
      "x": {"field": "minutes", "type": "quantitative",
             "axis": {"title": "Minutes"}, "scale": {"type": "sqrt"}},
      "color": {"field": "minutes", "type": "quantitative",
                "scale": {"scheme": "blues", "reverse": true}, "legend": null},
      "tooltip": [
        {"field": "pr", "title": "PR"},
        {"field": "title", "title": "Title"},
        {"field": "minutes", "title": "Cycle time (minutes)"}
      ]
    }
  }'
