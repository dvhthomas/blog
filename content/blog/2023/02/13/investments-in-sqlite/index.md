---
title: Tracking program investments in SQLite
date: 2023-02-13T18:19:47-07:00
tags: [sqlite, cte, hierarchical, data, go]
toc: true
series:
  - SQLite and Go
summary: Using SQLite to work with hierarchical data and learning about CTEs and data loading along the way.
mermaid: true
mathjax: false
draft: false
---

As part of learning more about [common table expressions (CTEs)][cte] in SQLite I chose to look at some complex queries I needed to make for a hierarchical data set of employees.
See the the first article in this series for the setup.

> NOTE: I recommend checking out my [Today I Learned][til] on SQLite schema work to learn more.

## Entity relationships and schema

The basic premise in my Investment Tracker is that a Person can invest some percentage of their time, between 0% and 100%, in an Initiative.
An Initiative is a project or a program or any other bundle of work that a number of people, or parts of an organization, are working on ("investment their time in").
The is tracked as a staff Investment of effort.
And to keep things organized, Investments can have tags like `enterprise` and `keep-the-lights-on`.

{{<mermaid>}}
erDiagram
    Person ||--o{ Investment : makes
    Investment ||--|| Initiative : invests-in
    Initiative }|--|{ Tags : has
{{</mermaid>}}

As I mentioned in [the opening article of the series]({{< ref "/blog/2023/02/01/sqlite-and-go-app/index.md#data-shapes" >}}), this data all lives in a couple of YAML files.
Before I transformed the data from YAML into SQLite I needed to create the schema.
Here's what I eventually came up with after trying a few different shapes.
Remember again, this is the basic data I was going to pull in from YAML.
There's more to SQL to come before I can answer my questions around this hierarchical data.

```sql
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

CREATE UNIQUE INDEX idx_initiatives_id
ON initiatives(id);

CREATE TABLE tags (
  id  TEXT  PRIMARY KEY
);

CREATE UNIQUE INDEX idx_tag_id
on tags(id);

CREATE TABLE initiative_tags (
  initiative TEXT NOT NULL,
  tag TEXT NOT NULL,

  PRIMARY KEY(initiative, tag),
  FOREIGN KEY (initiative) REFERENCES initiatives(id),
  FOREIGN KEY (tag) REFERENCES tags(id)
);

CREATE INDEX idx_initiativetags_initiative
ON initiative_tags(initiative);

CREATE INDEX idx_initiativetags_tag
ON initiative_tags(tag);

CREATE TABLE staff_investments (
  initiative TEXT NOT NULL,
  person TEXT NOT NULL,
  investment REAL NOT NULL,

  PRIMARY KEY(initiative, person),
  FOREIGN KEY (initiative) REFERENCES initiatives(id),
  FOREIGN KEY (person) REFERENCES people(id)
);

CREATE INDEX idx_staffinvest_initiative
ON staff_investments(initiative);

CREATE INDEX idx_staffinvest_person
ON staff_investments(person);
```

## Get data from YAML to SQLite

I experimented with a few different ways to get the data from YAML into SQLite.
For example, I started with some fancy (read: complicated) code using `yaml` attributes on Go structs to unmarshal the YAML into a Go struct.
Then I used the `database/sql` package to insert the data into the database.
But to be honest there was some pre-processing that I wanted to do beforehand, and I eventually ditched all that `yaml`-annotate Go code in favor of using the [`yq`][yq] command line tool to transform the YAML into CSV, which I could then more easily import into SQLite.

I kind of regret that decision just because the `yq` incantations were a real struggle to get right.
I spent _hours_ trying to get the subsets and pivots and joins and filters just right.

Nonetheless, it's an incredible tool following in the footsteps of `jq`.
Here's a reminder what the input formats look like.
First, each person record:

{{< highlight yaml "hl_lines=2" >}}
bitsbyd:
    manager: Alice
    github_login: bitsbyd
    name: Dylan Thomas
    email: XXXXXXX
    title: Senior Director Technical Program Management
    cost_center: XXXXXX
{{</highlight>}}

And then the investments that link to people:

{{< highlight yaml "hl_lines=1 7" >}}
super-secret:
    name: Super Secret
    link: https://www.github.com
    description: >
      Something neat *goes here*.
    investments:
    - bitsbyd: 1.0
    - jane: 0.8
{{</highlight>}}

Now remember, I'm trying to get CSV files fit for import into the SQL schema defined above.

### Get the people

And I was doing this in a [Taskfile.yaml]({{< ref "blog/2023/02/11/taskfile/index.md" >}}) so watch out for the `{{` and `}}` syntax in the `yq` commands.
The `yq` steps look like this.

```sh
 # This flattens the YAML and correctly orders the subset of fields ready for SQL import
yq '.[] | [key, .name, .email, .title, .employment_type, .cost_center, .manager] \
  | @csv' {{.EMPLOYEE_DATA}} > {{.EMP_CSV}}
```

1. The `.[]` creates an array of the top-level keys in the YAML.
2. The `|` pipes the output of the previous step into the next step.
3. The `[key, .name, .email, .title, .employment_type, .cost_center, .manager]` is a list of the fields I want to keep.
4. The `| @csv` converts the list into a CSV string.
5. The `>` redirects the output to a file.

So in one step I'm flattening the YAML, selecting the fields I want, and writing the output to a CSV file.
I have a row-per-person in a CSV like this:

```csv
...
bitsbyd,Dylan Thomas,bitsbyd@github.com,Senior Director Technical Program Management, \
  employee,XXXXDEPT,Alice
...
```

### Get the investments

The second transform gets basic info on each investment:

```sh
yq '.[] | [key, .name, .link, .description] | @csv' {{.INVEST_DATA}} > {{.INV_CSV}}
```

The same pattern basically, leaving me with a line-per-investment like so:

```csv
...
super-secret,Super Secret,https://www.github.com,"Something neat *goes here*."
...
```

### Get the person investments by initiative

This is where is got mind-bendingly complicated...for me at least.
You know when you just read the docs _super_ carefully, then even more deliberately craft the command, and it does something entirely unexpected...like nothing, or something just weird?
That was a few hours (hours!) of my life at this point.

```sh
# This extracts the staff-level investment percentages for each investment
yq '.[].investments[] | [parent() | parent() | key,keys,.[]] \
  | flatten | @csv' {{.INVEST_DATA}} > {{.INV_STAFF_CSV}}
```

The whole `keys,keys,.[]`. I honestly don't know how I even landed on that as I reread it.
But it works so...I'll take it.

The output is this with one line for each unique person-investment-initiative combination.
Here we see that BitsByD (me) is saying that he has invested 100% of his time on the `super-secret` project.

```csv
...
super-secret,bitsbyd,1.0
...
```

### Tags, anyone?

The final couple of commands are relatively straightforward.
They extract unique `tag` values from across all investments (like a `DISTINCT`), and then I grab the tags-per-initiative as well:

```sh
yq '.[].tags[]' {{.INVEST_DATA}} | uniq > {{.TAGS_CSV}}
# Grab the tags for each investment for many-to-many lookup
yq e '.[].tags[] | [parent() | parent() | key,.] | @csv' {{.INVEST_DATA}} > {{.INV_TAGS_CSV}}
```

End result? I have several CSV files containing normalized data ready to be loaded into my SQLite database.

## Get the CSVs into SQLite

When I first started tinkering on this project I used the [`sqlc`][sqlc] tool to generate Go code for the SQL schema.
It's _really_ freaking cool, and that's where the strict separation of SQL schema from any other query or data modification code comes from.
I eventually found it too limiting for SQLite queries and Go codegen, so I ditched it (if I use Postgres I'll try it again; the support seems much richer and deeper).

So I have a good SQL-based schema. Now I need to actually spin up a SQLite database and load the data into it.
That's where my `import.sql` comes in:

```sql
.mode csv
.import tmp/employees.csv people
.import tmp/investments.csv initiatives
.import tmp/tags.csv tags
.import tmp/staff-investments.csv staff_investments
.import tmp/initiative-tags.csv initiative_tags
DELETE FROM people WHERE employee_type NOT IN ('employee', 'contractor');
.mode table
SELECT 'Initiatives' AS 'Item', COUNT(*) AS 'Count' FROM initiatives
UNION
SELECT 'People' AS 'Item', COUNT(*) AS 'Count' FROM people
UNION
SELECT 'Tags' AS 'Name', COUNT(*) AS 'Count' FROM tags
UNION
SELECT 'Initiative Tags' AS 'Name', COUNT(*) AS 'Count' FROM initiative_tags
UNION
SELECT 'Staff investments' AS 'Name', COUNT(*) AS 'Count' FROM staff_investments
ORDER BY 1;

-- Handle the case where the CEO should not have a manager defined
UPDATE people set manager = NULL where id = manager;
```

This is a script for SQLite specifically, run by as follows, right after I create the schema in which to load data:

```sh
sqlite3 {{.DB}} < data/schema.sql
sqlite3 {{.DB}} < data/import.sql
```
Salient points:

1. It's very, very simple to load CSV data into SQLite if the schema and the CSV files match.
   That's why I was so careful to have my `yq` commands spit out CSV files that match my target schema in terms of column order and column name.
1. I liked using the `UNION` to get a quick summary of the data I just loaded.
   That helped me spot easy mistakes like...nothing got imported, or having twice as many employees as expected!
1. The SQLite pragma for `.mode table` made that a breeze to see on the console. Check it out:

```sh
$ task db
task: [db] rm -f db.sqlite3
task: [tmp-dir] mkdir -p tmp
task: [tmp-dir] mkdir -p tmp
task: Task "fetch-data" is up to date
task: [parse] yq '.[] | [key, .name, .email, .title, .employment_type, .cost_center, .manager] | @csv' tmp/hubbers.yml > tmp/employees.csv
task: [parse] yq '.[] | [key, .name, .link, .description] | @csv' investments.yml > tmp/investments.csv
task: [parse] yq '.[].investments[] | [parent() | parent() | key,keys,.[]] | flatten | @csv' investments.yml > tmp/staff-investments.csv
task: [parse] yq '.[].tags[]' investments.yml | uniq > tmp/tags.csv
task: [parse] yq e '.[].tags[] | [parent() | parent() | key,.] | @csv' investments.yml > tmp/initiative-tags.csv
task: [db] sqlite3 db.sqlite3 < data/schema.sql
task: [db] sqlite3 db.sqlite3 < data/import.sql
+-------------------+-------+
|       Item        | Count |
+-------------------+-------+
| Initiative Tags   | 4     |
| Initiatives       | 4     |
| People            | XXXX  |
| Staff investments | 17    |
| Tags              | 3     |
+-------------------+-------+
```

Woohoo! I've got my YAML all CSV-ified and into SQLite where I can start querying it.


### The Common Table Expressions (CTE)

Finally!
One of the prime motivators for doing this work in the first place was to learn more about hierarchical data in SQL, and how to use CTEs to simplify more complex logic into simpler individual steps.
And even more: combine the two into recursive CTEs. Woohoo!

This is going to be an eye-chart.
I created three views that I want to use to answer the questions I posed at the beginning of this series.
First, I want to get a seamless view of employees, with their hierarchy, and the total number of people on that persons entire organizational team; not just the people they directly manage, but everyone under them in the org chart.

The really interesting pattern I found with CTEs in general, was the ability to decompose overly complex logic into simpler steps, and then combine them back together into a single view.
It's not like I discovered that!
Decomposition appears to be one of the fundamental benefits of CTEs: make it easy to reason about.
While writing these CTEs it was also really nice to get little chunks of logic working _first_ and then string them together for the big result.

#### The organizing has a hierarchy

OK, so look at the first highlight. This is a recursive CTE.
You can see that from the `WITH` opening statement and the immediate `RECURSIVE` keyword.
For recursive CTEs the second notable thing is the `UNION` statement.

The first part of the query before the `UNION` tells us where we'll start our hierarchical walk.
In my case, `WHERE id = (select id from people where manager IS NULL)` on line 24 tells us to start at the CEO: the person who has no manager.

The second part of the query after the `UNION` tells us how to walk the hierarchy from that starting point...recursively.
I do that by joining the row(s) in the second section to the parent manager from the first section: `JOIN subordinate s ON p.manager = s.id`.

As a side note, the `json_array()` function is a really nice way to build up a JSON array in SQLite.
I wanted this because it made my eventual JSON output easier to work with.
For example, if Bob reports to Alice, and Alice reports to John, and John reports to Janet who is the CEO, then the value of the `org_tree` column for Bob would be `["Janet", "John", "Alice"]`.
A JSON array of strings.

But it keeps going.
Look at line 40 -- notice the `,` comma indicating that our next CTE is coming in hot on the heels of the first one.
And sure enough, the `team_size` CTE begins on line 57.
This is _mostly_ the same but the recursion is used to add up the total number of people in any single employee's org hierarchy: `SELECT COUNT(*) FROM cte WHERE manager IS NOT NULL`.
So now I have, for my imaginary Bob, a column called `org_count` containing a recursive count of employees reporting to Bob...or just zero if Bob is what we call 'an individual contributor' (no one reports to them).

Finally, on line 85 we have a much simpler `LEFT JOIN` that pulls the information from the `subordinate` CTE and `team_size` CTE into a single view. Literally a view since back up on line 5 I opened with `CREATE VIEW IF NOT EXISTS org`.

{{< highlight sql "hl_lines=13 24 26 40 57 85" >}}
/* Pull together all data on people and add information about each person's team size (size = 1 for people with a team reporting to them). And add a zero-based org_level showing how far down the org hierarchy they are, where zero is the CEO (manager = NULL).
  It does the work in three successive common table expressions
  (CTEs) to make it easier to see how the parts come together.
*/
CREATE VIEW IF NOT EXISTS org
AS
/*
  CTE 1 - Org Levels

  Build the employee hierarchy to get a level column useful
  for aggregating data.
*/
WITH RECURSIVE subordinate AS (
    /*
      Get the root note for our hierarch.
      This where clause is only true for one person: the CEO.
    */
    SELECT  *,
            0 AS org_level,
            -- An empty JSON array
            -- https://www.sqlite.org/json1.html#jset
            json_array() as org_tree
    FROM people
    WHERE id = (select id from people where manager IS NULL)

    UNION ALL

    /*
      Now get the same info, but note that we're joining
      to the subordinate table recursively to walk the hierarchy.
    */
    SELECT  p.*,
            org_level + 1,
            -- Add the person's manager to the end of the JSON array
            -- JSON arrays preserve order
            -- https://www.sqlite.org/json1.html#jins
            json_insert(org_tree, '$[#]', p.manager)
    FROM people p
    JOIN subordinate s ON p.manager = s.id
  ),

/*
  CTE 2 - Team size

  Get the complete count of people reporting
  up to any single person as `org_count`.

  This is hierarchical so:

  `SELECT * FROM view_team_size WHERE id = 'ashtom'`

  should get all the people reporting to the CEO.
  Querying for someone without any people reporting
  to them should return `org_count` of `1`.
  for aggregating data.
*/
team_size AS (
  SELECT DISTINCT
    p.id as id,
    (
      WITH RECURSIVE cte AS (
          SELECT
              pp.id,
              pp.manager
          FROM people pp
          WHERE pp.id = p.id

          UNION ALL

          SELECT
              pp.id,
              pp.manager
          FROM people pp
          JOIN cte ON pp.manager = cte.id
      )
      SELECT COUNT(*) FROM cte WHERE manager IS NOT NULL
    ) AS org_count
  FROM people p
),

/*
  CTE 3 - Combine people data with the hierarchy
  and team size
*/
employees as (
    SELECT
      s.id,
      s.name,
      s.email,
      s.title,
      s.cost_center,
      COALESCE(s.manager, s.id) as manager,
      s.org_level,
      s.org_tree,
      COALESCE(m.name, s.id) AS manager_name,
      ts.org_count AS org_size
    FROM subordinate s
    LEFT JOIN people m
      ON s.manager = m.id
    JOIN team_size ts
      ON s.id = ts.id
)
SELECT * FROM employees;
{{</ highlight >}}

Let's look at some data (I'm fudging the data to protect the innocent):

```sql
select * from org where id = 'bitsbyd';
```

|   id    |     name     |       email        |                    title                     |             cost_center             | manager | org_level |          org_tree           | manager_name | org_size |
|---------|--------------|--------------------|----------------------------------------------|-------------------------------------|---------|-----------|-----------------------------|--------------|----------|
| bitsbyd | Dylan Thomas | bitsbyd@github.com | Senior Director Technical Program Management | ORG NAME | ALICE | 3         | ["The Boss","Another Boss","My Boss"] | Alice | 18       |

The salient points are the reporting structure as a JSON array, the total org size under me, and my level within the org (which comes in next).
#### Investments

Next up I want to figure out where all these employees are investing their time.
The CTE pattern looks exactly the same now: multiple little-ish queries that I can reason about 'in the small', and then combine them into a single view.

I put quite a few inline comments in these queries because I'm baking business rules into SQL.
Depending on who you believe, that's either heresy or just not a big deal.
I'm the one writing this code, so it's not a big deal!!!

The first point of interest is the use of `json_each()` to iterate over the `org_tree` column.
That really took me a while to unpack.
There's some good documentation on the [SQLite JSON functions](https://www.sqlite.org/json1.html) but to be honest I think the nuances is how these group/array functions work compared to other SQL-like set-based operations work.
At least, it had me turned around a few times.

The rest of it is pretty straightforward.
Sure take your time with it and ready it carefully, but apart from the `CASE` statement and my usual habit of getting the truthiness of `WHEN...THEN` wrong, it's pretty straightforward.

{{< highlight sql "hl_lines=25-26 65-73" >}}
/*
  Build a single view of investments at the
  staff level for each Initiative.

  This enforces a rule: investments from subordinates
  are discarded if someone higher up in the organization has
  an investment for the same initiative. Look at the `included`
  column to see if any one person's investment is included.

  Second, investments are shown as 'full time equivalents' or
  FTEs. This is 'the equivalent of one full-time employee.
  For investments that we want to include, just multiple the
  total team size (org size) of the person by the percentage
  investment they are making. For example, if Alice has an
  org size of 100 people, and an investment of 0.5 (50%) then
  the FTE column will have a value of 50 (people).
*/
CREATE VIEW IF NOT EXISTS investments
AS

WITH management AS (
  SELECT
    si.initiative,
    org.id AS id,
    json_each.value as management
  FROM org, json_each(org_tree)
  INNER JOIN staff_investments si
  ON org.id = si.person
),

management_investment AS (
  /*
    The investment amount for each record should only be used
    in calculations if nobody further up in the org has an
    investment for the same initiative. For example, if Alice has
    an investment of 0.5 for the Project A initiaitve and nobody
    further up in the org has added an investment for Project A
    then the value for `include_investment` will be TRUE (1).
    However, if Bob is somewhere in Alice's management hierarchy
    (like Bob is her boss's boss) and Bob has recorded any investment
    value for Project A, then Alice's investment will be ignored
    (`include_investment` is FALSE (0).
  */
  SELECT
    mi.initiative,
    mi.id,
    -- Nobody in the management chain who has an investment
    -- for an Initiative? Set this to true.
    (COUNT(m.management) = 0) AS include_investment
  FROM
    management mi
  LEFT JOIN management m
    ON (mi.initiative = m.initiative AND mi.management = m.id)
  GROUP BY mi.initiative, mi.id
),

investments AS (
  SELECT
    si.initiative,
    si.person,
    si.investment,
    org.org_size,
    mi.include_investment as included,
    org.org_level,
    CASE
    -- Stop investments of greater that 100% of any person's total team size
    -- General calc works because `include_investment` is zero for 'no investment'.
    WHEN (org.org_size = 1)
      -- Deal with rounding so that an investment of, say, 0.4 for an individual
      -- person (team size of 1) does not get rounded to zero.
      THEN (1.0 * include_investment)
    ELSE org.org_size * si.investment * mi.include_investment
    END as fte
  FROM staff_investments si
  JOIN management_investment mi
    ON (si.person = mi.id AND si.initiative = mi.initiative)
  JOIN org ON si.person = org.id
)

SELECT * FROM investments
ORDER BY initiative ASC, fte DESC, org_level DESC;
{{</highlight>}}

Let's look at some data:

```sql
select * from investments where person = 'bitsbyd' and initiative = 'super-secret';
```

I have committed 100% of my team of 18 people, which means that I have 18 FTEs invested in this initiative.
And it says `TRUE` (`1`) in the `included` column, which means that my investment is included in the total investment for this initiative, because nobody above me in the company has said they're investing in this initiative.

|  initiative  | person  | investment | org_size | included | org_level | fte  |
|--------------|---------|------------|----------|----------|-----------|------|
| super-secret | bitsbyd | 1.0        | 18       | 1        | 3         | 18.0 |

The final view is really simple and I'm just including it here for completeness.
Basically, fix some empty things and add up the FTEs for each initiative.

{{< highlight sql "hl_lines=11" >}}
/*
  Initiatives with total FTE investment
*/
CREATE VIEW IF NOT EXISTS initiative_view
AS
SELECT
  i.id,
  i.name,
  COALESCE(i.url, "") as url,
  COALESCE(i.description, "") as description,
  (SELECT SUM(fte) FROM investments v WHERE i.id = v.initiative) AS total_investment
FROM initiatives i;
{{</ highlight>}}

And the data shows that my investment and that of others (totally fabricated) is included in the total investment for this initiative.

```sql
select * from initiative_view where id = 'super-secret';
```

|      id      |     name     |          url           |         description         | total_investment |
|--------------|--------------|------------------------|-----------------------------|------------------|
| super-secret | Super Secret | https://www.github.com | Something neat *goes here*. | 24.4             |

## Using in a Go program

I'll stop here and keep focused on the SQL bits in this post.
But as a bit of a teaser, I'm going to show how I'm using this data in a Go program.
I decided to use [GORM](https://gorm.io/) to access the data.
As an ORM most of the work was done using object-like interfaces, like getting a person using their handle.
But I've also included an example where dropping straight into some SQL is useful.

```go
import (
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/logger"
)

func (r *Repository) GetPersonByHandle(handle string) (*Person, error) {
	var person Person
	if r.db.Where(&Person{ID: handle}).First(&person); r.db.Error != nil {
		log.Printf("Error: %s", r.db.Error)
		return nil, r.db.Error
	}
	return &person, nil
}

func (r *Repository) InvestmentByCostCenter(initiative string) ([]CostCenterInvestment, error) {
	sql := `SELECT
			i.initiative as Initiative,
			o.cost_center as CostCenter,
			SUM(i.fte) as Invested
		FROM investments i JOIN org o on i.person = o.id
		WHERE i.initiative = ?
		GROUP BY o.cost_center, i.initiative
		HAVING Invested > 0
		ORDER BY Initiative, CostCenter`
	var result []CostCenterInvestment
	r.db.Raw(sql, initiative).Scan(&result)

	if r.db.Error != nil {
		log.Printf("Error: %s", r.db.Error)
		return nil, r.db.Error
	}
	return result, nil
}
```

That's it for now.
Next up, using this stuff in a Go web app, and some GORM-isms that I learned along the way.

[til]: {{< ref "til/2022/12/17/sqlite-schema/index.md" >}}
[cte]: https://www.sqlite.org/lang_with.html
[yq]: https://mikefarah.gitbook.io/yq/
[sqlc]: https://docs.sqlc.dev/en/latest/tutorials/getting-started-sqlite.html
