---
title: httpie for JSON data
date: 2025-12-08T21:48:56-07:00
tags: [json, shell]
toc: true
series: []
summary:
draft: false
images: []
---

[curl](https://curl.se) is great, but I do find myself reaching for [httpie](https://httpie.io/) to simplify header manipulation and JSON handling.

For example, I'm tinkering with the [World History Gazetteer](https://whgazetteer.org/) API and the JSON payload can get pretty big and indented.
httpie's `http` command makes this relatively easy with [a structure](https://httpie.io/docs/cli/nested-json) that is a lot easier to script.
Here's my shell script:

```sh
#!/bin/sh
TOKEN=MY_SECRET_TOKEN
http --verbose POST https://whgazetteer.org/reconcile/ \
	-A bearer -a $TOKEN \
	User-Agent:AlwaysMap \
	queries[q1][query]='Denver' \
	queries[q1][mode]=fuzzy \
	queries[q1][fclasses][]=A \
	queries[q1][fclasses][]=P \
	queries[q1][countries][]=GB \
	queries[q1][countries][]=US
```

That describes the structure of the JSON payload pretty well, including the arrays like `countries` and `fclasses`.
And here's the payload, minus the massive response:

```sh
$ ./whg.sh
POST /reconcile/ HTTP/1.1
Accept: application/json, */*;q=0.5
Accept-Encoding: gzip, deflate, zstd
Authorization: Bearer MY_SECRET_TOKEN
Connection: keep-alive
Content-Length: 108
Content-Type: application/json
Host: whgazetteer.org
User-Agent: AlwaysMap

{
    "queries": {
        "q1": {
            "countries": [
                "GB",
                "US"
            ],
            "fclasses": [
                "A",
                "P"
            ],
            "mode": "fuzzy",
            "query": "Denver"
        }
    }
}
```

I personally find the httpie structure a lot easier to get right with all the quotes, commas, and braces.
*Especially* in shell script!

I also like how the Bearer token is easy to set with `-A bearer` and then `-a $TOKEN`.
