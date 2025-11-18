---
title: Visidata as a multi-purpose tool for data exploration and analysis
date: 2021-03-10T10:54:28-07:00
tags: [tools, geospatial]
toc: true
series: []
summary:
mermaid: false
draft: false
aliases: ["/til/2021-03-10/"]
---

## VisiData

[https://www.visidata.org/](https://www.visidata.org/) is a Swiss Army Knife for viewing, querying, filtering, summarizing, and converting a very wide array of data types.
It comes with a bunch of standard data format support like CSV.
Just looking at the [file types](https://jsvine.github.io/intro-to-visidata/basics/opening-files/#compatible-filetypes) makes me happy, because it includes geospatial too.

Get started with python is easy.

```shell
pip3 install visidata
pip3 install pyshp # geospatial support
asdf reshim python
```
The `asdf...` part is needed because I'm using [asdf these days]({{< ref "blog/2021/03/07/asdf-for-runtime-management/index.md" >}}).

Then [read this great tutorial](https://jsvine.github.io/intro-to-visidata/).

Now point at a SQLite database with `dv training.db`:

{{<figure src="sqlite.png" title="A SQLite table - VisiData lets you choose from a list of all tables">}}

Or open a shapefile `dv some-shape-file.shp` which is the CSV of spatial data:

{{<figure src="shp.png" title="Viewing a shapefile with zero GIS software">}}

In this case I've tagged two columns by typing `!` so that I can sort by them using `[` and `]`.
But even better, I can use those key columns for quick summary statistics using `Shift-F`:

And adding data types to the columns is easy too: just select a column and type `%` for Date, and so on.

{{<figure src="shp-summary.png" title="Total area of features by summarizing">}}

But what _really_ blew my mind was the ability to select a row and type `.` (period) to get a preview of the feature...in a terminal window!

{{<figure src="shp-preview.png" title="Single row preview of spatial data">}}
