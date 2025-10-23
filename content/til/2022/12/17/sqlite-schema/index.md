---
title: SQLite schema
date: 2022-12-17T09:26:35-07:00
tags: [sqlite]
toc: true
series: []
summary: Learning a few bits about SQLite that are worth noting.
mermaid: false
mathjax: false
draft: false
---

## Query the structure and schema

If you are connected to a SQLite database and want to know what's inside.
First, connect:

```
$ sqlite3 mydb.sqlite3
```

To see all of the data definition language (DDL) printed out is handy.
It shows how everything was created in the first place. All the details.


```
sqlite> .schema

CREATE TABLE people (
  id            TEXT  PRIMARY KEY,
  name          TEXT  NOT NULL,
  email         TEXT  NOT NULL,
  title         TEXT  NOT NULL,
  employee_type TEXT  NOT NULL,
  cost_center   TEXT  NOT NULL,
  manager       TEXT REFERENCES people(id)
);
CREATE UNIQUE INDEX idx_people_id
ON people (id);
CREATE INDEX idx_people_manager
ON people (manager);
CREATE TABLE initiatives (
  id  TEXT  PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT,
  description TEXT
);

...
```

If you want to see the schema for just certain types of objects the use the embedded `sqlite_schema` table.
The `sqlite_schema` table has the following schema.
You can use the `type` column to get only a specific type of object.

> TIP: Set the `mode` in SQLite to get different outputs.
> For example I used `.mode markdown` to output my query results into ready-to-use Markdown tables for this TIL!


| cid |   name   | type | notnull | dflt_value | pk |
|-----|----------|------|---------|------------|----|
| 0   | type     | TEXT | 0       |            | 0  |
| 1   | name     | TEXT | 0       |            | 0  |
| 2   | tbl_name | TEXT | 0       |            | 0  |
| 3   | rootpage | INT  | 0       |            | 0  |
| 4   | sql      | TEXT | 0       |            | 0  |

For example running this query get me the all the types _in my current database_:

```sql
select distinct(type)
from sqlite_schema;
```

| type  |
|-------|
| table |
| index |
| view  |

And I can see all of the objects at my disposal using something like this:

```sql
select name, type
from sqlite_schema
order by type;

```

|                 name                 | type  |
|--------------------------------------|-------|
| sqlite_autoindex_people_1            | index |
| idx_people_id                        | index |
| idx_people_manager                   | index |
| sqlite_autoindex_initiatives_1       | index |
| idx_initiatives_id                   | index |
| sqlite_autoindex_tags_1              | index |
| idx_tag_id                           | index |
| sqlite_autoindex_staff_investments_1 | index |
| idx_staffinvest_initiative           | index |
| idx_staffinvest_person               | index |
| people                               | table |
| initiatives                          | table |
| tags                                 | table |
| staff_investments                    | table |
| org                                  | view  |

Let's use that knowledge to grab the schema for the `people` table:

```sql
select *
from sqlite_schema
where name = 'people';
```

| type  |  name  | tbl_name | rootpage |                    sql                     |
|-------|--------|----------|----------|--------------------------------------------|
| table | people | people   | 2        | CREATE TABLE people (                      |
|       |        |          |          |   id            TEXT  PRIMARY KEY,         |
|       |        |          |          |   name          TEXT  NOT NULL,            |
|       |        |          |          |   email         TEXT  NOT NULL,            |
|       |        |          |          |   title         TEXT  NOT NULL,            |
|       |        |          |          |   employee_type TEXT  NOT NULL,            |
|       |        |          |          |   cost_center   TEXT  NOT NULL,            |
|       |        |          |          |   manager       TEXT REFERENCES people(id) |
|       |        |          |          | )                                          |


But coming from other RDBMSs I prefer to use the `table_info` pragma to see what I'm dealing with.

```
sqlite> pragma table_info(org);
```

| cid |     name      | type | notnull | dflt_value | pk |
|-----|---------------|------|---------|------------|----|
| 0   | id            | TEXT | 0       |            | 0  |
| 1   | name          | TEXT | 0       |            | 0  |
| 2   | email         | TEXT | 0       |            | 0  |
| 3   | title         | TEXT | 0       |            | 0  |
| 4   | employee_type | TEXT | 0       |            | 0  |
| 5   | cost_center   | TEXT | 0       |            | 0  |
| 6   | manager       | TEXT | 0       |            | 0  |
| 7   | org_level     |      | 0       |            | 0  |
| 8   | manager_name  | TEXT | 0       |            | 0  |
| 9   | org_size      |      | 0       |            | 0  |


## Query Plan

The other thing I've found handy this week is to look at the query plan while writing some more complex common table expressions (CTEs).
It's super simple to do in SQLite using the `eqp` pragma:

```sql
sqlite> .eqp on
sqlite> SELECT * FROM org limit 2;
QUERY PLAN
|--MATERIALIZE subordinate
|  |--SETUP
|  |  |--SEARCH people USING INDEX idx_people_id (id=?)
|  |  `--SCALAR SUBQUERY 5
|  |     `--SEARCH people USING INDEX idx_people_manager (manager=?)
|  `--RECURSIVE STEP
|     |--SCAN s
|     `--SEARCH p USING INDEX idx_people_manager (manager=?)
|--MATERIALIZE team_size
|  |--SCAN p USING COVERING INDEX idx_people_id
|  |--CORRELATED SCALAR SUBQUERY 8
|  |  |--CO-ROUTINE cte
|  |  |  |--SETUP
|  |  |  |  `--SEARCH pp USING INDEX idx_people_id (id=?)
|  |  |  `--RECURSIVE STEP
|  |  |     |--SCAN cte
|  |  |     `--SEARCH pp USING INDEX idx_people_manager (manager=?)
|  |  `--SCAN cte
|  `--USE TEMP B-TREE FOR DISTINCT
|--SCAN ts
|--SEARCH s USING AUTOMATIC COVERING INDEX (id=?)
`--SEARCH m USING INDEX idx_people_id (id=?)

...results from the query start...
```

This helped me spot a couple of full table scans without indexes that I could fix. Nice!

