#!/bin/sh
# PR cycle time: created → merged
# A proxy for cycle time if you open draft PRs when work starts
# Usage: REPO=owner/repo ./pr-cycle-time-summary.sh
gh api "repos/${REPO}/pulls?state=closed&per_page=50" \
  --jq '
    [.[] | select(.merged_at != null) |
      { number, title,
        url: .html_url,
        minutes: (
          ((.merged_at | fromdateiso8601) - (.created_at | fromdateiso8601)) / 60
          | . * 10 | round / 10
        )}]
    | sort_by(.minutes) | reverse
    | ["PR", "Title", "Cycle time"],
      ["--", "-----", "----------"],
      (.[] | [
        "#\(.number)",
        .title[:60],
        "\(.minutes) min"
      ])
    | @tsv'
