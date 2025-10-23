---
title: "Learning Go With an Overly Complex Mail Merge"
date: 2021-01-31T20:00:19-07:00
tags: [programming, golang, web]
summary: []
toc: true
draft: true
---

## In which a neighborhood address list becomes an opportunity to learn

Last year I was feeling a bit out of the loop. People on my team are cranking out really complex Web-based applications using Angular; writing cross-platform GUI tools using Electron; and doing things with Kubernetes, Argo, and Helm that are so far outside my practical ability. I needed to find a project that was low risk for experimentation and learning, but not simple enough so that I could just follow a blog post and finish.

I don't need to know how to do half that stuff, but I do need to stay sharp, stay technical *enough* to be an effective technical leader. And then an opportunity arose. My Nei

## Picking a stack for learning

If I was just going to whip up a quick forms-over-data type of web app I would typically reach for Django. I'm comfortable with Python and Django takes care of a huge amount of boilerplate and cruft. But the whole point here was to learn something different.

### Back end

At work the team mostly uses Python WSGI/ASGI servers via Flask or Starlette or similar. Or we reach for Javascript/Typescript via Nodejs using frameworks like Express. I do want to spend more time with modern Javascript or Typescript for backend work. And I've been really intrigued with the relative newcomer [Deno](https://deno.land) from the original author of Nodejs. That doesn't transpile Typescript to JS; it natively supports Typescript which I think is pretty cool.

But to be honest I've been wanted to try Go for a while. I love the idea of compiling to a single binary using platform and processor aware machine code. And I also really like the (supposed) simplicity of the language and opinionated toolchain. So rather than learn, say, Express, I had 

Eye on Deno - typescript.

GO book.

So, Go it is.

### Front End

I've been interested in the simpler (in the developer sense) front end tools like Svelte for a while. But to be honest, the concept count was already pretty high for this project and I just couldn't face building.

And I've been getting slightly grumpy about the overall complexity. Indeed, I've found myself listening more to the likes of DHH with his 'return' to the monolith and server-side logic and rendered UI. The real cutting edge is 










