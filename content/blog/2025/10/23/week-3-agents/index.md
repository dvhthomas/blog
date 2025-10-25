---
title: "Week 3: Agents"
date: 2025-10-23T12:51:07-06:00
tags: [llm, agents]
toc: true
series: [AI Engineering Course]
summary: Week 3 is all about agents. Workflows, tools, multi-step agents, and the protcols and frameworks involved.
mermaid: true
mathjax: false
draft: false
images: [router.svg]
---

## Defining Agents

> INFO: This is a work in progress but I want to get the ball rolling.

### LLMs are static

LLMs are static based on a body of knowledge.
They don't have autonomy or agency to plan, perform actions.
For a next token predictor answering something like _'Write an email to my boss to take one day off'_ might return a good result. But _'Write a full report on the housing marketing and share existing opportunities'_ is going to miss expectations.

We can use [RAG]({{< ref "/blog/2025/10/14/rag/index.md#retrieval-augmented-generation-rag" >}}) to augment content, and fine-tuning to make them more domain-specific.
The there are limits to the complexity of task that even a fine-tuned, RAG-augmented model can handle on their owfn.

Our goal is **to make LLMs more capable**.

* "How's the weather in San Francisco today?" > LLM > `+ Weather API`
* "What is 1234532 + 56528" > LLM > `+ Calculator`
* "Where is my order?" > LLM > `+ Database access`
* "Who scored in the Barcelona game today?" > LLM > `+ Web search`
* "What is your refund policy?" > LLM > `+ RAG`

### Definition

An agent is[^def]:

> A software system that uses LLM(s) to pursue goals and
> complete tasks on behalf of users.
> They plan, reason, call tools, and rely on memory to complete complex tasks.

{{< d2 src="agents.d2" width="100%">}}
An agent is a system of software components
{{</d2>}}

Agents have autonomy; LLMs don't.
Agentic systems have different levels of agency.

1. Simple processor
2. Workflows
3. Tool caller
4. Multi-step agents
5. Multi-agent systems

### Types of Agent

Let's talk a little more about each of those 5 agent levels.

#### Simple Processor Agents

This is seen less as an agent than a simple piece of sofware.
Even thought it may be 'simple' in the agentic sense, there are typically many back-and-forth calls between software and LLM.
And there's more happening in the loops like tokenizations, response templating, and prompt engineering in general.

{{< d2 src="simple-processor.d2" width="100%" />}}

#### Workflow Agents

This is where the predefined code paths are designed offline using some kind of orchestrator.
At runtime, the LLM is not asked to plan.
The benefit is more determinism.

{{< d2 src="workflow.d2" width="100%" />}}

Common workflow patterns:

##### Prompt chaining

A single prompt can overwhelm the token limits and complexity that the LLM can handle.
It can also lead to hallucination.
Something like _Analyze housing market, summarize the results, etc etc..."_ needs to be decomposed into smaller tasks.
Something like this for a `user query`:

1. **Prompt 1**: analyze housing market specific in `{user query}`
2. **Prompt 2**: summarize findings in `{output}`

   The ONLY thing it does is summary. Much simpler!
3. **Prompt 3**: Identify trends in `{output2}`

   Again, a focused task.
4. **Prompt 4**: Share opportunities given `{output1}` and `{output2}`

Prompt chaining is where a task can be **easily decomposed**.
It's a tradeoff between accuracy and latency.
Good examples might be:

- **Content generation** (writing a docuemnt outline -> checking the outline -> write the document).
- **Data extraction** like converting unstructured text into a structured format.
- **Information processing** with transform1, transform2, transform3, etc.

##### Routing

> TIP: There's some example code in my [agent-learn/2-routing-pattern](https://github.com/dvhthomas/agent-learn/tree/main/2-routing-pattern) repo.

This goes beyond deterministic steps and we **introduce conditional logic**.
Really two key steps:

1. Determine the intent of the user prompt.
2. Route the prompt to the appropriate LLM.

Routers could be one of the following types:

- Rule based (if/else)
- ML-based: Use a traditional ML model that can determine the path: classifier model (`A or B`)
- Embedding similarity: `query -> embedding -> nearest specialized embedding`.
  This is useful for _semantic_ routing.
- LLM Routers: Just prompt the LLM to classify the intent in a deliberately structured way.

Routers are commonly used for efficiency.
For example, you could send common or simple questions to smaller and cheaper models, whereas you could send complex questions to larger and more expensive models.

{{< d2 src="router.d2" />}}

Here's the key: the decision logic for routing **does not** have to be an LLM!
It could even be human in the loop.

##### Reflection

> TIP: There's some example code and a detailed README in my [agent-learn/4-reflection](https://github.com/dvhthomas/agent-learn/tree/main/4-reflection) repo.

This is also called Evaluator-Optimizer.
The Evaluation is also called **a Critic**.
There's no way that a Router could figure this out: we're entering a loop until the Critic is satisfied.

In practice, it's ofter more effective for a specialized LLM so that you avoid feedback bias in the Critic.

Reflection is good when there are **clear evalution criteria** and where **iterative refinement helps**.
Code generation is a great example.
The Critic could write tests to assess and then ask the Generator to iterate on the code.

##### Parallelization

{{< d2 src="parallelization.d2" />}}

##### Tool Caller

> TIP: I've [written a bunch of examples](https://github.com/dvhthomas/agent-learn/tree/main/5-tool-use) of the tool-caller pattern.

{{< d2 src="tool-caller.d2" />}}


Tool calling workflow:

1. Define a Tool
2. Let LLM know about the tool
3. When the LLM wants to use it, call the tool and return the response.

One way to let the LLM know about a tool is to define it in the system prompt. The key is to have the LLM spit out a structured format that the Agent can recognize:

* System Prompt:

  ```txt
  You can use a tool called add to add two numbers. It takes two inputs: number 1 and number 2. It returns their sum. Use it like this:

  <tool>
    add(number1, number2)
  </tool>

  Just replace number1 and number2 with the numbers you want to add.
  ```
* User prompt:

  ```txt
  What is 184322 + 54821?
  ```

* Response:

  ```txt
  <tool>
  add(184322, 54821)
  </tool>
  ```

Add this point the Agent Software can recognize the format of the response and can call an appropriate existing tool. In this case it might be a Python tool with an `add(n1, n2)` signature, or even [have the LLM write a function](https://github.com/dvhthomas/agent-learn/blob/main/5-tool-use/code_exec.py).
LangChain makes [tool integration pretty easy](https://python.langchain.com/docs/how_to/function_calling/).

But this isn't scalable: jamming stuff into a system prompt is non-standard, impossible to maintain, and leads to brittle code.

**Model Context Protocol (MCP)** is the new standard for tool integration.
It's a protocol.
The service provider writes the tool functions once and exposes them as an MCP-compliant server to broad consumption.

{{< d2 src="mcp.d2" />}}

You introduce the MCP Servers to your LLM through a standard mechanism and protocol.

{{< d2 src="mcp-for-llm.d2" />}}

This is more maintainable: adding a new tool is as simple as adding a new server to the MCP `server.json`. See [GitHub MCP Registry](https://github.com/mcp) for a searchable list of available MCP servers.

If you revisit Workflows and plug in the tools concept, everything becomes more maintainable and scalable and flexible.
Imagine that the Tools in this workflow are augmenting the system and user prompt as data flows through the system.

{{< d2 src="workflow-with-tools.d2" />}}

#### Multi-step agents

Coming soon!

[^def]: See [Hugging Face's introductory course](https://huggingface.co/learn/agents-course/en/unit1/what-are-agents):
