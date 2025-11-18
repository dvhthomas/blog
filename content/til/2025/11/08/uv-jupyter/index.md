---
title: uv and Jupyter Best Friends
date: 2025-11-08T11:13:54-07:00
tags: [python, jupyter, uv]
toc: true
series: []
summary:
draft: false
images: []
---

Literally before I forget!
How to make uv and Jupyter [play nicely together](https://docs.astral.sh/uv/guides/integration/jupyter/).
This assumes you've already got a new uv proejcts (maybe with `uv init --bare`):

```sh
uv add --dev ipykernel
# Option One
uv run ipython kernel install --user --env VIRTUAL_ENV $(pwd)/.venv --name=sensor-exp
# Option Two
uv run --with jupyter jupyter lab
```
