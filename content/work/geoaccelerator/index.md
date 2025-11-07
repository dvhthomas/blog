---
title: GeoAccelerator for Rapid Experimentation
date: 2020-01-14T20:11:21-06:00
toc: false
series: []
summary: |-
  Introducing experimentation into the technical sales process to: produce evidence for customers; close deals; publish assets for future sales.
mathjax: false
draft: false
images: [desktop-tiles.png]
capabilities:
  - agility
  - experimentation
  - innovation
  - geospatial
---

## Situation

In early 2020 I had created a new Customer Engineering team at [Woolpert](https://innovations.woolpert.com/).
With our geospatial roots and focus on reselling both Google Maps APIs and Google Cloud Platform (GCP) resources, I needed the CEs to do two things:

1. Validate the feasibility of customer blockers to  **closing deals**. Without this, we're all out of a job.
2. Create **reusable sales assets** that tell the geospatial + cloud story. Without this, we can't scale.

The team was pretty good at the first, but struggled with the second: reusable assets.

## Behavior

I set up a small project in Basecamp and defined the hypotheses based on the customer's needs: can Google Cloud Storage (GCS) be used to store static geospatial data such that a regular [GIS][^1] analyst can use in their live Web-based and desktop GIS software?

I limited the experiment to 5 calendar days to focus on figuring it out over making a production implementation happen.
The experiment needed to show that contour data for a single county in Ohio could be ingested and hosted in GCS, and then used in ArcGIS Desktop from Esri, and ArcGIS Online from Esri, and QGIS from Open Source GIS.

The language of hypothesis over requirements helped the CE involved on proof that a customer could manage their own data in the cloud without it being overly complex.

The CE dug in deep and figured it out, all with a tight and fast communication channel internally via Basecamp and chat:

- [Explainer](https://support.woolpert.io/hc/en-us/articles/360047530073-Vector-Tiles-on-Google-Cloud-Storage-Serving-the-Tiles)
- [Vector tiles on cloud storage](https://support.woolpert.io/hc/en-us/articles/360047530073-Vector-Tiles-on-Google-Cloud-Storage-Serving-the-Tiles)
- [Vector tiles on Web Clients](https://support.woolpert.io/hc/en-us/articles/360047005294-Vector-Tiles-on-Google-Cloud-Storage-Web-Clients)
- [Desktop GIS Clients](https://support.woolpert.io/hc/en-us/articles/360047018474-Vector-Tiles-on-Google-Cloud-Storage-Desktop-GIS-Clients)
- [Proving it to the customer](https://support.woolpert.io/hc/en-us/articles/360048947773-Vector-Tiles-on-Google-Cloud-Storage-Flexing-Cloud-Muscle-with-Fairfield-County-Contours)

{{< figure src="desktop-tiles.png" title="Cloud-hosted vector tiles in a commercial GIS client" >}}

## Impact

We closed a deal!
It wasn't for much---just some Google Cloud Storage (object storage) for a trivial amount of geospatial data.
The bigger win was teaching the team how to treat customer deals like an experiment with specific hypotheses and metrics to measure success.

1. **Metric: Deals closed-won.** Won!
2. **Metric: reusable sales assets.** Yep! We published the guides and results on our public support portal.

This was a great start, and from there the CE team started to publish their experiments as demos.
For example, [we published an ML vision demo](https://woolpert.com/news/blogs/what-does-a-machine-learning-project-look-like/) to show potential customers how Google's AutoML could do for a common tax assessment use case.

[^1]: Geographic Information System
