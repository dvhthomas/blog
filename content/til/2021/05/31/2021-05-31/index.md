---
title: 2021-05-31
date: 2021-05-31T12:06:55-06:00
tags: [tools, visualization, strategy]
toc: true
series: []
summary: Wardley maps to visualize strategy
mermaid: false
mathjax: false
draft: false
aliases: ["/til/2021-05-31/"]
---

## Wardley maps

I came across a Tweet about 'maps as code'.
As a geographer and sometime developer this really piqued my interest.
It mentioned Wardley Maps, which is not something I'm at all familiar with.
But since this was about using Visual Studio Code to automatically create 'maps' from code,
I had to follow up.
After all, a couple of my all-time favorite tools are [PlantUML](https://plantuml.com/) and [MermaidJS](https://mermaid-js.github.io).


#### Summary

The basic premise is that _visualizing elements affecting strategy **as a map** is the best way to arrive at a strategy quickly, in context_.

I can't share what I came up with because it was work-related and confidential.
However, this example map gives you an idea.

{{< figure src="map-fs8.png" title="A Wardley map of a tea shop" >}}

#### Resources

- [Learning Wardley Maps](https://learnwardleymapping.com/home-deprecated/introduction/).
  I started with this site because the short videos helped me get oriented.
- [Wardley Maps book](https://learnwardleymapping.com/book/).
  This is open under Creative Commons so I started reading.
  It's absolutely fascinating, and the goal of killing off strategic and management consulting was quite a shocking goal to start with!
  But really, the detailed articulation of the journey from accidental strategy through Sun Tzu to doctrine, etc., is really interesting.
  I definitely did not complete that book yet.
- [Online Wardley Maps](https://onlinewardleymaps.com/#).
  This is the good stuff. A way to write in a simple domain specific language (DSL) for Wardley Maps.
  The [examples repo](https://github.com/damonsk/wardley-maps-examples) has some wonderful examples to get oriented.
- VS Code extension. With the usual `Ctrl+Cmd+P > Install Extension` I could add this quickly.
  My only gripe thus far is that you cannot export or save the resulting image.
  It's OK because you can paste the exact same DSL text into the online mapping tool and get the same result.
  But that's kind of a drag in the longer term.



