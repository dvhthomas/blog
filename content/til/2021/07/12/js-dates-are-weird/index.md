---
title: JS Dates are Weird
date: 2021-07-12T18:58:16-06:00
tags: [javascript]
toc: true
series: []
summary: In which type coercion and JavaScript magic bite me in the...date math.
mermaid: false
mathjax: false
draft: false
aliases: ["/til/2021-07-12/"]
---

## Strings becoming numbers in dates

I was trying to add a number of years to a `Date` in JavaScript.
Should be easy except I forgot the cardinal rule of accepting user input: check it!
I was getting the number of years as an 'integer' via an API, but of course it turned out to be a string that _looked_ like an integer.

```js
$ let d1 = new Date(2021,07,12);
undefined

$ let years = 2;
undefined

$ let years_string = "2";
undefined

$ d1.getFullYear() + years;
2023 // Expected...

$ d1.getFullYear() + years_string;
"20212" // Oh brother...

$ let d2 = new Date(d1);
undefined

$ d2.getFullYear();
2021

$ d2.setFullYear(d2.getFullYear() + years);
1691820000000

$ d2
Date Sat Aug 12 2023 00:00:00 GMT-0600 (Mountain Daylight Time)

$ d3 = new Date(d1);
Date Thu Aug 12 2021 00:00:00 GMT-0600 (Mountain Daylight Time)

$ d3.setFullYear(d3.getFullYear() + years_string);
575681234400000 // Yeah, the math breaks...

$ d3
Date Wed Aug 12 20212 00:00:00 GMT-0600 (Mountain Daylight Time)
// wait...the year 20212?!
```

It's embarrassing how long it took me to spot that extra digit on the year!
How did I solve this issue?
A simple conversion fixed it:

```js
let years = parseInt(the_value_from_the_api);
```
