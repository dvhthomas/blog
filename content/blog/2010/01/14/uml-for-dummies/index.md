---
title: UML in a nutshell
date: 2010-01-14T08:13:48-06:00
tags: [uml, tools, techniques]
toc: true
series: []
summary: >
    I don't always reach for UML but when I do I _always_ draw the wrong little diamond for aggregation vs. composition so maybe this will help me to use the right pen for the job next time!
mermaid: false
mathjax: false
draft: false
---
## Introduction

Unified Modeling Language (UML) is a graphical notation covering a wide variety of steps in software and system design. One of the core uses of UML is to design object oriented systems using classes, interfaces, relationships, and other simple graphical elements. The purpose of this document is to describe the most common elements of UML diagrams geared towards class design.
All diagrams were created using the [yUML](http://yuml.me) website.

## The Elements

### Class

- Just the class - no properties or other information

{{< figure src="uml-class.png" title="Simple class" >}}

- A class with details. The name is at the top. The public fields (or properties) come next. They have a plus sign if they are public and a minus sign if they are private. Finally come the methods, again marked public or private with signs.

{{< figure src="uml-class-props.png" title="Class with details" >}}

### Interface

- Just the name - no details

{{< figure src="uml-interface.png" title="Interface" >}}

* With some details

{{< figure src="uml-interface-details.png" title="Interface with details" >}}

## Relationships

There are a few different kinds of relationships and deciding which one to use can be a bit confusing at first because it depends upon the intent of the relationship. *Simple associations* kind of ignore the two main types of associations and can be used for higher level UML diagrams. But being more specific is important as the design evolves and so understanding the difference between aggregation and composition is key. It really comes down to ownership and object lifecycle.

* **Aggregation** -- This is known as a has a relationship because the containing object has a member object. But here is the critical part: The member object can survive or exist without the enclosing or containing class, so it can have a meaning beyond the lifetime of the enclosing object. *Example: A room has a table and the table can exist without the room.*

* **Composition** -- This is known as a is a part of or is a relationship because the member object is part of the containing class and cannot existing or survive outside the context of the containing class. This also means that the lifetime of the member object ends with the lifetime of the enclosing object. *Example: The IT Department is part of the Company. The IT Department cannot exist without the Company and has no meaning after the lifetime of the Company.*

That said, let's have a look at the ways to show various kinds of relationship and the characteristics of those relationships.

### Simple association

Customers *have a* billing address

{{< figure src="uml-have-a.png" title="Simple association" >}}

The relationship between a Customer and their Orders is described by the action orders. So it reads *a Customer __orders__ an Order*.

{{< figure src="uml-relationship.png" title="Simple association" >}}

### Cardinality

A Customer can have zero or more Addresses. An Address must have exactly one Customer. Notice how the numbers are positioned on the line: the customer fact (zero or more) is written next to the Address class.

{{< figure src="uml-cardinality.png" title="Cardinality" >}}

### Directionality

An Order has an Address called `billing` and an Address called `shipping`. This does not say anything about the Address-to-Order relationship.

{{< figure src="uml-directionality.png" title="Directionality" >}}

### Aggregation

A Company has exactly one Location. A Location has a Point.

{{< figure src="uml-aggregation.png" title="Aggregation" >}}

### Composition

The Company has exactly one Location. The Location does not exist outside of the context of the Company.

{{< figure src="uml-composition.png" title="Composition" >}}

## Other dependencies

### Inheritance

Both the Contract and Salaried classes inherit from the Wages class.

{{< figure src="uml-inheritence.png" title="Inheritence" >}}

The NightlyBillingTask class inherits (implements) the ITask interface

{{< figure src="uml-implements.png" title="Implements" >}}

### Depends On

The HttpContext class is dependent upon the Response class. The relationship reads as *"the HttpContext class **uses** the Response class"*. There is no *has a* or *is part of* a Response implied here. It is just plain usage.

{{< figure src="uml-depends-on.png" title="Depends on" >}}

## Complete Example

Here it all comes together with some extra annotations in the form of notes.

{{< figure src="uml-example.png" title="Complete UML class diagram" >}}
