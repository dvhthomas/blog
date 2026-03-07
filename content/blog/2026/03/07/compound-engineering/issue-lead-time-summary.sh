#!/bin/sh
# Summary stats for issue lead time (hours)
# Usage: REPO=owner/repo ./issue-lead-time-summary.sh
gh api "repos/${REPO}/issues?state=closed&per_page=100" \
  --jq '[.[] | select(.pull_request == null) |
    ((.closed_at | fromdateiso8601) - (.created_at | fromdateiso8601)) / 3600] |
    sort |
    "Issues:  \(length)",
    "Median:  \(.[length/2 | floor] | . * 10 | round / 10) hours",
    "Average: \(add / length | . * 10 | round / 10) hours",
    "Fastest: \(min | . * 60 | round) minutes",
    "Slowest: \(max | . * 10 | round / 10) hours"'
