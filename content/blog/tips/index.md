---
title: "Tips"
date: 2020-02-12T07:45:59-07:00
draft: true
mermaid: true
mathjax: true
vega: true
toc: true
---

## Pictures

{{< figure src="/about/me.jpg" title="The author as a younger man" >}}

## Twitter

I did a thing and it got posted.

{{< x user="dvhthomas" id="1425712358735847432" >}}

## Link to a post

By reference:

[Welcome back!]({{< ref "blog/2020-02-11/welcome-back/index.md" >}})

Or a specific link in a page. This uses the fact that markdown adds an automatic ref to titles:

[Blogging title]({{< relref "blog/2020-02-11/welcome-back/index.md#im-blogging-again" >}})

## A gist on Github

{{< gist dvhthomas 239909 >}}

## Code snippet

If you include code inline you also get the ability to highlight lines:

{{< highlight bash "hl_lines=1" >}}
$ echo "hello world"
hello world
{{</ highlight>}}

But practically speaking it may be easier to include code from files that live in the same directory as the `index.md` for each post.

For example the file `hello.py` is in the same directory as `tips.md`.
We can display it using

{{% code file="hello.py" lang="python" %}}

## Diagrams

### Mermaid

The YAML front matter contains `mermaid: true` and then this will render a nice diagram.

{{<mermaid>}}
graph TD;
    t(top node)
    note
    t-->B;
{{</mermaid>}}

### D2

[D2](https://d2lang.com/) is a modern diagram scripting language. Create a `.d2` file in the same directory as your post, then reference it using the `d2` shortcode.

For example, here's a simple workflow diagram defined in `example.d2`:

{{< d2 src="example.d2" width="50%"/>}}

The D2 source looks like this:

```
start -> process: step 1
process -> end: step 2
```

Reference it in your markdown with:

```
{{</* d2 src="example.d2" */>}}
```

Include an optional `width: xx%` to control the diagram's width. For example:

```
{{</* d2 src="example.d2" width="85%" */>}}
```

#### Controlling diagram width

By default, D2 diagrams scale to 70% of the container width. You can override this with the `width` parameter:

- Default (70%): `{{</* d2 src="diagram.d2" */>}}`
- Full width (100%): `{{</* d2 src="diagram.d2" width="100%" */>}}`
- Half width (50%): `{{</* d2 src="diagram.d2" width="50%" */>}}`
- Custom: `{{</* d2 src="diagram.d2" width="85%" */>}}`

Use wider widths for complex flow diagrams, and narrower widths for simple hierarchical diagrams.

## Reference URLs

You can avoid typing a URL multiple times by using a reference-type URL.
Use either a numbered [footnote style for whatever text][1].
Or specific text that matches the [link text itself].

[1]: http://slashdot.org
[link text itself]: http://www.reddit.com

## Math

Set `mathjax: true` in the front matter.
Then use either the `${inline}$` for or block form using two `\$\$`:

`$$\large CAGR = \left( V_{final} \over V_{begin} \right)^{1/t} - 1 $$`

Construct formulae using the [`$\LaTeX{}$` reference for math](https://www.caam.rice.edu/~heinken/latex/symbols.pdf).
Use the great reference on [Overleaf](https://www.overleaf.com/learn/latex/Brackets_and_Parentheses) for lots of worked examples.
And [this StackExchange Math](https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference) articles is superb.

## Charts

Using [vega-lite](https://vega.github.io/vega-lite/).
You must:

- Put the `chart.json` definition in the `/static/charts` folder with a unique name.
- Reference that name in the `vega` shortcode as `chart.json` _without_ the directory name.
- Add `vega: true` to the front matter of the page.

For example, this chart has an `id` of `viz` (meaning that the div containing this chart has an id of `viz`), and a `spec` value of `tips.json` since that's the name of  the file in `/static/charts/`.

{{<vega id="viz" spec="tips.json">}}
