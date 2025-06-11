---
title: "Tips"
date: 2020-02-12T07:45:59-07:00
draft: true
mermaid: true
mathjax: true
vega: true
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

The YAML front matter contains `mermaid: true` and then this will render a nice diagram.

{{<mermaid>}}
graph TD;
    t(top node)
    note
    t-->B;
{{</mermaid>}}

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
