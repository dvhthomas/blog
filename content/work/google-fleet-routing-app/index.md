---
title: Building Google's Fleet Routing Reference App
date: 2023-04-15T12:00:00-06:00
toc: false
series: []
summary: |-
  Won and delivered a $450K engagement to build Google's reference application for Cloud Fleet Routing, now the Route Optimization API. Six months with a team of three; the app is still open source and maintained by Google.
mathjax: false
draft: false
images: [fleet-routing-app.png]
hero_alt: "Fleet Routing App showing a solved scenario: 36 shipments across 12 vehicles around Memphis, each route in its own color"
capabilities:
  - consulting
  - leadership
  - partnerships
  - geospatial
---

## Situation

Google was bringing a new API to market: Cloud Fleet Routing, which solves the vehicle routing problem.
Give it a set of shipments, a fleet of vehicles, and a tangle of constraints---capacities, costs, time windows, driver breaks, traffic, mixed vehicle types---and it works out which vehicle takes which shipment in what order, for the lowest cost.

The request is deeply nested JSON and so is the response.
Google wanted a reference application so customers could construct scenarios, tune constraint parameters, and visualize routes before writing any code.

I'd been [building a cloud consulting practice]({{< ref "work/woolpert-cloud-practice/index.md" >}}) at [Woolpert](https://woolpert.com) since January 2019, with the consulting function set up to do billable engineering delivery.
Woolpert was already a Google Maps reseller.
This engagement was the first with Google itself as the client.

## Behavior

I wrote the proposal and won a $450K engagement to build the application from scratch.
Delivery took six months with three of us on it: me as the TPM alongside two software engineers.

We worked with Google on a weekly cadence that was almost entirely async, so the project management had to be tight.
I ran it Kanban-style rather than in fixed sprints, to accommodate an experiment-driven way of working where what we learned one week changed what was worth building the next.

What we shipped, now open source as [`googlemaps/js-route-optimization-app`](https://github.com/googlemaps/js-route-optimization-app), is a web application that walks a user through the API's data model---request planning, then shipments, then vehicles---and returns the solved routes as a map, a per-vehicle timeline, and a table.
The screenshot at the top is one solved scenario: 36 shipments across 12 vehicles around Memphis.
It's an Angular frontend on a Node backend, deployed into the customer's own Google Cloud project with Terraform, and Woolpert's [demo write-up](https://demos.woolpert.io/posts/fleet-routing/) describes it as the dispatcher's day-to-day interface for creating and "touching up" optimized solutions.

## Impact

- **Google shipped it as the way to try the API.** It's how Google tells customers to explore Route Optimization: build a scenario, tune the constraints, and look at the routes before committing engineering time. Google's [demo and overview video](https://youtu.be/iqoksctFvh0?t=83) walks through the app.
- **Google named Woolpert in the GA announcement.** Cloud Fleet Routing [became the Route Optimization API](https://developers.google.com/maps/documentation/route-optimization) and [reached general availability on May 10, 2023](https://mapsplatform.google.com/resources/blog/plan-efficient-routes-for-your-fleet-route-optimization-api-is-now-generally/). The post pointed customers at two partners for help deploying it: Accenture and Woolpert.
- **First engagement with Google as the client, and a logo we could talk about.** The practice had been building on Google's platform for Woolpert's customers; this one was delivered to Google, to Google's standards. That made Google a publicly referenceable customer and a selling point with other prospective consulting clients.
- **Still maintained years later.** The app is Apache 2.0 licensed, and Google is still committing to it.
