---
title: 2021-06-02
date: 2021-06-02T11:56:57-06:00
tags: [geospatial, python, geocode, osm]
toc: true
series: []
summary: |-
  Using Python to work with addresses and Open Street Map networks.
mermaid: false
mathjax: true
draft: false
---

Learned about a couple of handy python geospatial projects.

## PyPostal

[Python bindings](https://github.com/openvenues/pypostal) for the `libpostal` library.
It basically provides a way to standardize an input string into something approximately a geocodable address.
Note: it does **not** actually do geocoding; it does string standardization to match a wide array of international addressing schemes.

Following their instructions on a Mac:

```sh
mkdir address
cd address
python3 -m venv venv
brew install curl autoconf automake libtool pkg-config\n
git clone https://github.com/openvenues/libpostal\n
./bootstrap.sh\n
cd libpostal
./bootstrap.sh

# I'm just sticking whatever files they need in the local direction.
# No harm for a demo.
./configure --datadir=/Users/thomas/tmp/address/postaldata
make
sudo make install
cd ..
ls
source venv/bin/activate
ls postaldata
ls postaldata/libpostal
pip install postal
```

And now we're ready to use it in Python.
I just tried in an interactive `python3` shell:

```py
from postal.expand import expand_address
# This import takes seconds...I guess it's referencing a huge set of rules/data
from postal.parser import parse_address

# I have a friend living in a house in a town in Yorkshire with
# a typically English off the wall address scheme. Trying something like this
>>> parse_address('shoreditch, the hill, yarm, yorkshire')

# Not too bad given the weird input
[('shoreditch the hill', 'road'), ('yarm', 'city'), ('yorkshire', 'state_district')]

# One of their examples
>>> parse_address('The Book Club 100-106 Leonard St, Shoreditch, London, Greater London, EC2A 4RH, United Kingdom')
[('the book club', 'house'), ('100-106', 'house_number'),
  ('leonard st', 'road'),
  ('shoreditch', 'suburb'), ('london', 'city'),
  ('greater london', 'state_district'), ('ec2a 4rh', 'postcode'),
  ('united kingdom', 'country')]
```

I can see a lot of utility here. Good stuff.

## OSMnx

In wondering how to get an isochrone on a street network I came across [OSMnx](https://geoffboeing.com/publications/osmnx-complex-street-networks/).
It's a utility library and set of algorithms for both accessing (downloading) Open Street Map (OSM) data, _and_ a set of algorithms for working with that data in a Python-native graph data structure.
For example...how to download data for a city, build a walking graph of the street network, then calculate how far you can get from a single location in $X$ minutes.

The examples repo shows [exactly how to do this](https://github.com/gboeing/osmnx-examples/blob/main/notebooks/13-isolines-isochrones.ipynb).

