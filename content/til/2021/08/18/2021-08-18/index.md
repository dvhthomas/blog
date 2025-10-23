---
title: 2021-08-18
date: 2021-08-18T15:56:55-06:00
tags: [regex, google, sheets]
toc: true
series: []
summary: Using Google Sheets for event planning
mermaid: false
mathjax: false
draft: false
---

## Using some little Google Sheets tricks for an agenda

If you just need a template [make a copy of the source spreadsheet](https://docs.google.com/spreadsheets/d/1WXxGTW1laZzyY_jJKNZTuhUE5Y6v59tPY9WXg9KDHx8/edit?usp=sharing) and follow the instructions.

One of the things I find myself doing occasionally is putting together workshops, team meetings, and the like.
That typically involves creating an agenda, and I usually reach for Google Sheets to create that.
Columns for Start Time, End Time, Session title, session lead, etc.
And during that agenda creation process there's often some churn: move this meeting, change the length of that one, switch to a different day, and so on.

This is _really_ obvious stuff but there are a couple of tips I've learned...and keep forgetting...so I'm writing them down here.

The two things are: (a) how to highlight non-meeting rows like breaks, and (b) how to make quick changes to the order or duration of sessions a lot easier.

### Highlight the rows with food or coffee

I want to highlight the entire row of the agenda where there is a break or lunch.
There are a few ways to accomplish that, but I want Google Sheets to do more of the work.
So how do you:

1. Find a cell containing _either_ the word 'lunch' or the word 'break',
1. ignoring the case so that 'Lunch' is just as valid as 'lunch',
1. then conditionally highlight all the other cells in the row containing that match?

See how the row for the _Break_ is gray across the board whereas the other session titles are not filled?
That's the goal.

{{< figure src="row-highlight.png" title="Highlighting agenda items with food or coffee" >}}

#### Highlight a row

Highlighting the row is something I've done multiple times but _always_ forget how to do.
Guess I should write it down?!
Anyway, I found a [detailed and effective](https://www.benlcollins.com/spreadsheets/conditional-formatting-entire-row/) tutorial showing how to use _Format > Conditional formatting_ with a _Custom formula_ to get the job done.
I tend to select the entire set of columns I need rather than a rectangular range of cells (`A:F` for example, vs `A1:F10000`).
But really that's not the point.

But what should the custom formula say? Maybe a couple of `SEARCH` functions with an `OR` in there to cover both 'lunch' and 'break'?
And remember that we want `LOWER` case too.

Like so: `OR(SEARCH("lunch",LOWER(D14),1),SEARCH("break",LOWER(D14),1))`.
That would work...except it doesn't.

The first case of a non-matching result throws a `#VALUE` error, so _not_ finding 'lunch' would prevent me `SEARCH`-ing for 'breakfast'.
In essence, this only works when the first string is found:

{{< figure src="only-breaks.png" title="Lunch or some breaks are not an option" >}}

Fiddling with `XOR` and friends didn't help either.
On top of that, I also wanted to add 'dinner' and **not** the word 'breaking' (like a session called 'Breaking the build' is not about food!).
So I looked instead at my old ~~nemesis~~ friend regular expressions.

#### Regex to the rescue

The `REGEXMATCH` function in Google Sheets is the one I wanted.
It takes two arguments: the text (or cell containing text) to search for, and a regular expression following the [Google RE2 syntax](https://github.com/google/re2/)
I quickly came up with `(break\b)|(lunch\b)` to match whole words, but I couldn't immediately figure out the case-insensitivity. 
Google RE2 does indeed support the [case-insensitive `i` syntax](https://github.com/google/re2/blob/main/doc/syntax.txt#L66), so I tried adding `/i` to the end of the expression.
That didn't work but a little Googling turned up a great tip on [how to set the case insensitive flag in Google Sheets](https://stackoverflow.com/a/24645121)

Adjusting this I have a regular expression `REGEXMATCH(D14,"(?i)(break\b)|(lunch\b)")`.

The `(?i)` section is the place where any global setting is applied, in this case the `i` meaning 'ignore case'.
And even with the `LOWER()` expression removed I still get the result I'm looking for:

{{< figure src="regex-test.png" title="Case insensitive results again" >}}

Back to highlighting the whole row!
I know that the work 'break' or 'lunch' (or 'dinner'!) would always appear in column `D` so I need to anchor on that one.
As a result my _Custom formula_ on the _Conditional formatting_ panel looks like this: `=REGEXMATCH(($D1),"(?i)(break\b)|(lunch\b)|(dinner\b)") = TRUE`.
Note that I'm including the leading `=` sign, and the `LOWER` is now gone in favor of the `(?i)`.

With that in place, any cell `D-something` containing 'lunch' or 'break' (but *not* 'breakfast' or 'lunchy') will have a nice highlight.

## Automatically determine start and end times for sessions

One thing that always bugs me about putting an agenda together is getting the start and end times correct.
You start with columns for Start and End time.
Then you add a few rows with new sessions.
Then someone says _"Why don't we make the second session longer?"_, or heaven forbid: _"Let's move that session to later in the day"_.
Aaaargh! Now I've got to fix my start and end times.

I know what you're thinking: why don't you just have the Start Time of the next session point to the End Time of the previous session?
Genius!



Except in practice I find a more common need is to change the length (Duration) of a session rather than shift it around.
And for that I typically find find it easier to change the length (Duration) in minutes rather than do simple but (for me) error-prone clock math.

And even if that weren't the case, dragging rows around to switch sessions is a problem because _Google Sheets magically (and annoyingly in this particular case) remembers which End Time cell you session **was** pointing to_.
Instead, we want each agenda item row to _always point back to the row just before it_ and stop doing magic.

### `INDIRECT` and `ADDRESS` for less magic

Enter `INDIRECT`.
This is a function that lets you define a _relative reference to a cell_ rather than an alphanumeric or _explicit_ reference to a cell.

Or to quote a [great blog post](https://blog.sheetgo.com/google-sheets-formulas/indirect-formula-google-sheets/):

> The `INDIRECT` function in Google Sheets takes in the cell address in the form of text and returns a cell reference. It works in the opposite way to the `ADDRESS` function, which returns an address in text format. [source](https://blog.sheetgo.com/google-sheets-formulas/indirect-formula-google-sheets/)

That's really handy in our case, _especially_ if we harness the power of `COLUMN` and `ROW`.
Consider the following agenda where I want the start time for the _Strategy and QA_ session to always start after the End time of the preceding session, which in this case is the _Icebreaker_ session.

{{< figure src="indirect.png" title="Reference pointers" >}}

The value of the _Start_ cell for the _Strategy and QA_ session contains the following: `INDIRECT(ADDRESS(ROW()-1, COLUMN()+1))`.

#### Illustrative example

To decompose what's going on here, we can look at the following:

{{< figure src="formulas.png" title="Elements of the formula" >}}

We want to use the value of the field `H17` in cell `L17` but--critically--we DO NOT want cell `L17` to simply say `=H17`.
As a reminder, that's because if we copy and paste the cell `L17` somewhere else on the sheet it'll still point right back to `H17`, which is NOT what we want.
Instead we want to always point to the field that is "five columns to the left".

#### Real example

Back to our real example then: `INDIRECT(ADDRESS(ROW()-1, COLUMN()+1))` in the cell `A6`.
Here we're just doing a little extra calculation to get a relative row and column:

1. Get me the current row number (6), then subtract 1 to get the row just before me. That's row 5.
1. Get the current column number (1 or the `A` column) and add 1 to get the 2nd or `B` column.
1. Get me the alphanumeric address of the column/row at `5,2`. That's `B5`.
1. Use the alphanumeric value to indirectly get the value of cell `B5`, which is the _End Time_ of whatever session precedes me.

This may seem like a ton of work to get a value.
But trust me, it makes for much more resilient copying and pasting of cell values, dragging and dropping of rows, and tweaking of session durations.

### A worked example

Feel free to copy the [demonstration sheet](https://docs.google.com/spreadsheets/d/1WXxGTW1laZzyY_jJKNZTuhUE5Y6v59tPY9WXg9KDHx8/edit?usp=sharing).
