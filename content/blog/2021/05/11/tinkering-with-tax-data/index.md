---
title: Tinkering With Tax Data
date: 2021-05-11T12:45:06-06:00
tags: [datasette, data, sql]
toc: true
series: []
summary: |-
    Using some open source tools to learn about tax data in Denver.
mermaid: false
mathjax: false
draft: false
---

I wanted to see how quickly I could get a sense of the tax data in a jurisdiction.
I live in Denver so I thought I'd start there.

## Getting the data

Denver.gov have an Open Data Portal so grabbing all of the [real property residential data](https://www.denvergov.org/opendata/dataset/city-and-county-of-denver-real-property-residential-characteristics) was easy.

I downloaded it and took a first look using [VisiData]({{< ref "til/2021/03/10/visidata/index.md" >}}):

```sh
wget -O denver.csv https://www.denvergov.org/media/gis/DataCatalog/real_property_residential_characteristics/csv/real_property_residential_characteristics.csv
vd denver.csv
```

## Converting to something useful

It looks like there's a natural primary key for each record called `PARID`.
And since I want to start using SQL to investigate the data I cranked up my favorite toolkit for this type of thing: [`csvs-to-sqlite`](https://github.com/simonw/csvs-to-sqlite), [`sqlite-utils`](https://sqlite-utils.datasette.io/en/stable/cli.html), and [`datasette`](https://datasette.io/).

 
Loading the data is a no-brainer:

```sh
csvs-to-sqlite denver.csv denver.db
```

I tried to add a primary key but was surprised that `PARID` is not actually unique:

```sh
$ sqlite-utils transform --pk parid denver.db denver-res-prop
...
...
sqlite3.OperationalError: duplicate column name: PARID
```

So I took a look in Datasette:

```sh
$ datasette denver.db
INFO:     Started server process [2411]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8001 (Press CTRL+C to quit)
```

Scrolling through the data in a table view with some sorting ability made me see that I definitely had duplicates for PARID.


The following query validated that there are about 20 instances where the `PARID` is duplicated:

```sql
select PARID, COUNT(*)
from [denver-res-prop]
group by PARID
having count(*) > 1
```

Kind of dawned on me that `CD` and `OFCARD` columns are probably part of a compound key.
This worked!

```sh
sqlite-utils transform --pk parid --pk cd --pk ofcard denver.db denver-res-prop
```

And firing up datasette again now shows the first column as a link with all three values, indicating that the compound key is in place.
Nice!

Now I can poke around the dataset using SQL.

### Querying with GraphQL

One thing I've studiously been avoiding is GraphQL.
And yet I read that for flexible client querying it's the way to go.
REST-ful style for your primary data work (think CRUD), but GraphQL for easy downstream use.

Luckily there's a [datasette plugin](https://github.com/simonw/datasette-graphql#filtering-tables) for that.

```sh
datasette install datasette-graphql
```

Now restart datasette and visit the local URL such as [http://127.0.0.1:8001/graphql](http://127.0.0.1:8001/graphql).
For example, running this query lets me find all properties owned by out-of-state people (not Colorado), that are held in trust, and that have an assessed value in excess of $100,000.
That would be a real pain to code an API for.
And, I get to choose which data elements ("nodes") to include in the results.


```json
{
  denver_res_prop(
    filter: [
      {OWNER: {contains: "TRUST"}},
      {ASSESS_VALUE: {gt: 100000}},
      {OWNER_STATE: {not: "CO"}}
    ])
   {
    totalCount
    nodes {
      OWNER
      OWNER_STATE
      SITE_DIR
      SITE_NAME
      SITE_MODE
      SITE_MORE
      PROP_CLASS
    }
  }
}
```

{{<figure src="datasette.png" title="Datasette's automatic GraphQL editor" >}}

## Summary

That's a quick look at how I can download some raw data from a public website, do a tiny bit of prep work, and have a full-featured web UI and API to poke around with the data.
