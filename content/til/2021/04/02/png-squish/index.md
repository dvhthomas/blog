---
title: Squishing PNGs
date: 2021-04-02T10:13:32-06:00
tags: [tools, google-cloud]
toc: true
series: []
summary: PNG squishing and static sites on GCS
mermaid: false
mathjax: false
draft: false
---

## Squishing PNGs

As part of this TIL process I wanted to include a sizable PNG into a post.
Following [this advice](https://til.simonwillison.net/macos/shrinking-pngs-with-pngquant-and-oxipng) it's a good idea to squish PNG images down before adding to Git or the blog.
I'm seeing results like a reduction from 480kb to 70kb.

One time:

```sh
brew install pngquant oxipng
```

Then use like so, passing in the name of a content directory containing PNGs to squish:

```sh
pngquant --quality 20-50 content/til/2021-03-31/*.png
oxipng -o 3 -i 0 --strip safe content/til/2021-03-31/*-fs8.png
```

## Protecting content on a Google Cloud Storage-hosted web site

Dave found this great post while investigating how to host an authenticated/authorized static site.

[Protecting static website assets hosted on Cloud Storage
](https://cloud.google.com/community/tutorials/securing-gcs-static-website)

It's a creative use of a load balancer, network endpoint group (NEG), serverless login page to create a cookie/token for Cloud CDN to use.

## Density-based spatial clustering of applications with noise ([DBSCAN](https://en.wikipedia.org/wiki/DBSCAN))

Looking at some new visualization features [in BigQuery GIS](https://cloud.google.com/blog/products/data-analytics/geospatial-insights-bigquery-gis-and-data-studio-choropleth) and came across a function I'd never heard of before: [`ST_CLUSTERDBSCAN`](https://cloud.google.com/bigquery/docs/reference/standard-sql/geography_functions#st_clusterdbscan).

I'm just going to paste the summary docs here because I literally never heard of an algorithm that turns out to be both well known and rather useful.

> The DBSCAN algorithm identifies high-density clusters of data and marks outliers in low-density areas of noise. Geographies passed in through geography_column are classified in one of three ways by the DBSCAN algorithm:
>
> - **Core value:** A geography is a core value if it is within epsilon distance of minimum_geographies geographies, including itself.
>   The core value starts a new cluster, or is added to the same cluster as a core value within epsilon distance.
>   Core values are grouped in a cluster together with all other core and border values that are within epsilon distance.
> - **Border value:** A geography is a border value if it is within epsilon distance of a core value.
  It is added to the same cluster as a core value within epsilon distance. A border value may be within epsilon distance of more than one cluster. In this case, it may be arbitrarily assigned to either cluster and the function will produce the same result in subsequent calls.
> - **Noise:** A geography is noise if it is neither a core nor a border value. Noise values are assigned to a NULL cluster. An empty GEOGRAPHY is always classified as noise.

But for reference [ST-DBSCAN: An algorithm for clustering spatial–temporal data][1] is the paper to read to understand how DBSCAN got spatial.

[1]: https://www.sciencedirect.com/science/article/pii/S0169023X06000218
