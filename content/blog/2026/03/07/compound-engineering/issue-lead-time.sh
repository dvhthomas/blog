#!/bin/sh
# Issue lead time: created → closed
# Filters out pull requests to show only true issues
# Usage: REPO=owner/repo ./issue-lead-time.sh
gh api "repos/${REPO}/issues?state=closed&per_page=100" \
  --jq '
    [.[] | select(.pull_request == null) |
      { number, title,
        url: .html_url,
        hours: (
          ((.closed_at | fromdateiso8601) - (.created_at | fromdateiso8601)) / 3600
          | . * 10 | round / 10
        )}]
    | sort_by(.hours)
    | ["Issue", "Title", "Lead time"],
      ["-----", "-----", "---------"],
      (.[] | [
        "#\(.number)",
        .title,
        (if .hours < 1 then "\(.hours * 60 | round) min"
         else "\(.hours) hr" end)
      ])
    | @tsv'
