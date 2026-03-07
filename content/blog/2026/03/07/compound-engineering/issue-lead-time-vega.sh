#!/bin/sh
# Generate a Vega-Lite JSON spec for issue lead time from any GitHub repo
# Usage: REPO=owner/repo ./issue-lead-time-vega.sh > chart.json
gh api "repos/${REPO}/issues?state=closed&per_page=100" \
  --jq '{
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "Issue lead time",
    "width": 500,
    "height": 350,
    "title": "Issue lead time (created → closed)",
    "data": {
      "values": [.[] | select(.pull_request == null) | {
        issue: "#\(.number)",
        title: (.title | if length > 40 then .[:40] + "…" else . end),
        hours: (((.closed_at | fromdateiso8601) - (.created_at | fromdateiso8601)) / 3600
                | . * 10 | round / 10)
      }]
    },
    "mark": {"type": "bar", "cornerRadiusEnd": 3},
    "encoding": {
      "y": {"field": "title", "type": "nominal",
             "sort": {"field": "hours", "order": "ascending"},
             "axis": {"title": null, "labelLimit": 250}},
      "x": {"field": "hours", "type": "quantitative",
             "axis": {"title": "Hours"}, "scale": {"type": "sqrt"}},
      "color": {"field": "hours", "type": "quantitative",
                "scale": {"scheme": "orangered", "reverse": true}, "legend": null},
      "tooltip": [
        {"field": "issue", "title": "Issue"},
        {"field": "title", "title": "Title"},
        {"field": "hours", "title": "Lead time (hours)"}
      ]
    }
  }'
