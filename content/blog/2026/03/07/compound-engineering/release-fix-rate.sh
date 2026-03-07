#!/bin/sh
# Release bug escape rate: count fix vs feature commits per release
# Shows how many releases contain bug fixes shipped in prior releases
# Usage: REPO=owner/repo ./release-fix-rate.sh
gh api "repos/${REPO}/releases?per_page=30" \
  --jq '.[] |
    {tag: .tag_name,
     date: (.published_at | split("T")[0]),
     fixes: ([.body | scan("^- fix";"m")] | length),
     feats: ([.body | scan("^- feat";"m")] | length)} |
    "\(.tag)\t\(.date)\t\(.fixes) fixes\t\(.feats) features"'
