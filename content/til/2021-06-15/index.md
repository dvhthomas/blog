---
title: awk-ing
date: 2021-06-15T09:59:30-07:00
tags: [linux, tools, gcp, billing]
toc: true
series: []
summary: Some awk for text file munging
mermaid: false
mathjax: false
draft: false
---

## AWK-ing

I needed to do a little slicing of text.
Google Cloud Platform provides billing data as a monthly CSV.
It includes a `sku` column I needed.

```csv
sku,service,description,price,unit,tier start,units per tier
9B46-8DDB-2AC8,Cloud Run,Cloud Run Network Inter Region Egress ...
```

The goal is to get each SKU (column one) and append them all for a SQL `IN(...)` statement.
So comma separated and quoted like `IN("sku1", "sku2",...)`.

Here's what I ended up with:

```sh
cat billing.csv | awk -F',' 'FNR > 1 {print "\x27"$1"\x27"}' | paste -sd "," -
```

I learned a couple of things doing this so let's break it down:

- Separator - By default `awk` uses a space. The `-F','` flag defines that separator as a comma instead.
- Ignore the first line. The `FNR > 1` tells `awk` to only process lines with a linenumber greater than 1.
  I guess this is 1-based rather than zero based.
- Single-quote the output. The SQL `IN` statement expects strings to be inside single-quotes like `'THIS'`.
  There was plenty of advance on Stack Overflow but ultimately I liked the approach of [adding quotes to `awk` output](https://unix.stackexchange.com/a/222717) using hexadecimal instead of escaping the quotes needed to type a quote as the special character.
- `paste`. Never came across this before but it ["merges lines of files"](https://linux.die.net/man/1/paste).
  So where `cat` and `awk` emit on line per result, `paste` will squish them all into a single line and give me the chance
  to insert my own separator `--delimeter` or `-d ","`.

Output:

```txt
'9B46-8DDB-2AC8','F283-6374-4AC7','D453-C414-EDA7',...
```
