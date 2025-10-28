---
title: "Week 4: Thinking and Reasoning Models"
date: 2025-10-27T10:10:43-06:00
tags: [ai, engineering, llm]
toc: true
series: [AI Engineering Course]
summary: Complex prompts are better handled with multi-step logical answers. Reasoning models are still an LLM, but we add reasoning before the response is provided.
mermaid: true
mathjax: true
draft: false
images: [deepseek-hyperbolic.png]
---

> INFO: This is a work in progress and I get through Week 4 lectures and other material.
> Come back for more in a few days.

## Introduction

Complex prompts are better handled with multi-step logical answers. Reasoning models are still an LLM, but we add reasoning before the response is provided.

{{< mermaid >}}
graph LR
  Prompt --> LLM --> r((Reasoning)) --> Response
{{</mermaid>}}

Current commercial models are OpenAI's 'o' class models, Google's Gemini Pro (compared to Gemini Flash non-reasoning), DeepSeek.
Test GPT-4 for a quick answer vs. something like o4-mini, which is a reasoning model. It shows that it's 'Thinking' and then 'Reasoning' content is displayed, and then the response is provided.
In a run, that took about ~9 seconds.
Then choosing o3, it reasons for 1m 1s, shows the code it wrote during reasoning, and printed the answer.

[LLM Arena Text Leaderboard](https://lmarena.ai/leaderboard/text) shows that the reasoning models are performing better than the non-reasoning models. [^hyperbolic]

{{< figure src="leaderboard.png" title="Hyperbolic's Text Arena leaderboard" >}}

As of October 2025, [Kimi K2](https://huggingface.co/moonshotai/Kimi-K2-Instruct-0905) is performing very well, and it has good technical papers.
[DeepSeek R1 0528](https://api-docs.deepseek.com/news/news250528) similarly has good performance, technical papers, and a very permissive MIT license.

{{< figure src="deepseek-hyperbolic.png" title="DeepSeek response showing reasoning steps" >}}

## How to Build Reasoning Models

There are two main approaches to building reasoning models, each with their own sub-classes or training:

* Inference-time Training
  * CoT Prompting
  * Self-consistency
  * Tree of Thought (ToT)
  * Sequential sampling
  * Monte-carlo search
* Training-time Training
  * STaR
  * RL with ORM/PRM
  * Meta CoT
  * Internalizing search

### Inference Time Training

#### Chain of Thought Prompting

The first kind is just prompt engineering.
The LLM isn't doing any multi-step reasoning.

Few shot. Notice how we're prompting the output format with _So, 6._

> **Example**
> Q: There are 2 boxes with 3 balls each. How many balls are there?
> A: 2×3 = 6. So, 6.
>
> **Now solve this**
> Q: There are 3 red bags with 5 apples each and 2 blue bags with 7 apples each. How many apples are there in total?
> A:
>
> **Model Response**
> 3×5 + 2×7 = 15 + 14 = 29. So, 29.

Zero shot:

> Q: There are 3 red bags with 5 apples each and 2 blue bags with 7 apples each. How many apples are there in total? **Let's think step by step.**

Basically the LLM is processing multiple thoughts in one call:

{{< mermaid >}}
graph TB
  Input --> t1((Thought1)) --> t2((Thought2)) --> Output
{{</mermaid>}}

![](../../../14/rag/cot.png)

#### Self consistency

This is also called parallel sampling and best-of-N sampling.
Rather than spend compute on reasoning, just get N samples from the LLM using the same prompt and then pick the 'best' generation during inference time.

If $N=3$ we are using some method to select $n3$ as the best ('sample and rank').

{{< mermaid>}}
graph TB
  Input --> t1((n1))
  Input --> t2((n2))
  Input --> t3((n3)) --> Output
  style t3 fill: #00ffff
{{</mermaid>}}

[Google paper](https://arxiv.org/pdf/2203.11171) proposed combining both Chain of Thought and Self consistency.

{{< mermaid>}}
graph TB
  i[Input]
  subgraph a [N1]
    a1[Node A1] --> a2[Node A2] --> a3[Node A3]
  end
  subgraph b [N2]
    b1[Node B1] --> b2[Node B2] --> b3[Node B3]
  end
  subgraph c [N3]
    c1[Node C1] --> c2[Node C2] --> c3[Node C3]
  end
  i --> a1
  i --> b1
  i --> c1
  a3 --> Response[Response]
  b3 --> Response
  c3 --> Response
  style a3 fill:#00ffff
{{</mermaid>}}

The two ways to pick the 'best' are:

1. **Majority Voting.** Assuming that the answer is in a specific format, like our _'So, XX.'_, you can just pick whichever answer occurs the most frequently (mode).

   But this only works well in certain domains like mathematics.
   It's less clear for domains like writing ('Write an article on Topic X').
2. **Reward Model.** Assuming that the answer is in a specific format, like our _'So, XX.'_, you can just pick whichever answer has the highest confidence score.

    {{< mermaid>}}
    graph TB
      i[Input]
      subgraph a [N1]
        a1[Node A1] --> a2[Node A2] --> a3[Node A3]
      end
      subgraph b [N2]
        b1[Node B1] --> b2[Node B2] --> b3[Node B3]
      end
      subgraph c [N3]
        c1[Node C1] --> c2[Node C2] --> c3[Node C3]
      end
      i --> a1
      i --> b1
      i --> c1
      rm(Reward Model)
      a3 --> rm
      b3 --> rm
      c3 --> rm
      rm --> Response[Response]
      style rm fill:#00ffff
    {{</mermaid>}}

    Reward models are trained on pairs of prompt and responses and is capable of generating a score---the same as training and post-training.
    That's generally manual data generation with humans scoring the answers, i.e., an **annotated dataset** of the prompt, response, and score.

A lot of early LLMs were using this combinted COT + Self-consistency.

#### Tree of Thoughts (ToT)

You can think about the COT + Self-consistency as a **search problem**, because we're ranking results.

So rather than run things in $N$ parallel COTs, you can create a tree instead.
The tree is inherently **more efficient** due to pruning the tree compared to parallel runs, even though it's less likely to produce the high quality response we'd get from COT + Self-consistency.
ToT trades quality for compute efficiency.

{{<mermaid>}}
    graph TD
      i[Input]
      i --> n1
      i --> n2
      i --> n3
      n1 --> n1-1
      n1-1 --> n1-2-1
      n1-1 --> n1-2-2
      n2 --> n2-1
      n2 --> n2-2
      n2 --> n2-3
      n2 --> n2-4
      n2-4 --> n2-4-1
      n2-4 --> n2-4-2
      n2-4 --> n2-4-3
      n2-4-2 --> Response[Response]

      classDef win fill:#00ff33,stroke:#99ff99,stroke-width:4px;
      classDef maybe fill:#ff8800;
      classDef loose fill:#ff0000;
      class n2,n2-4,n2-4-2,Response win
      class n3,n1-2-2,n2-4-1,n2-1,n2-3 loose
      class n1,n1-1,n1-2-1,n2-4-3n,n2-2,n2-4-3 maybe
    {{</mermaid>}}

  The [Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters](https://arxiv.org/abs/2408.03314) paper has these examples worked through.
  The point is, there a multiple ways of trading off the quality and a tree-based search method like Beam and Lookahead.

  {{< figure src="search-types.png" title="Search Methods Against a Process Based Reward Model (PRM)" >}}

#### Sequential Sampling

LLMs can use external evaluation mechanisms, like a Reward Model (RM), to refine their output during the generation process.
This approach is conceptually related to reinforcement learning from human feedback (RLHF) and methods that apply inference-time scaling like self-consistency.
Since the Reward Model's (RM) job is to provide a scalar score for an LLM's output, here is minimal pseudo-code illustrating sequential sampling where the RM acts as the selector of the best response over K iterations.

The loop is what makes this **interative assessment** by the reward model a _sequential_ sampling of the response.

{{< highlight python "hl_Lines=10-11" >}}
prompt = "What's the weather in Paris?"

def sequential_sampling_with_rm (prompt, K):
    // LLM is the generative model
    // RM is the Reward Model

    best_response = NULL
    max_reward = -INFINITY

    // Loop K times to generate and evaluate multiple samples
    for i in range(K):
        # 1. LLM generates a potential response/sample
        current_response = LLM.generate(prompt)

        # 2. RM evaluates the quality of that response
        current_reward = RM.evaluate(prompt, current_response)

        # 3. Track the best response found so far
        if current_reward > max_reward:
            max_reward = current_reward
            best_response = current_response

    return best_response
{{</ highlight >}}

This pattern of comparing multiple generated outputs to select the highest quality one is also similar to "Voting" in parallelization workflows.

[^hyperbolic]:
    [Hyperbolic.ai](https://hyperbolic.ai/) is a great website for testing these models.
    It's not free because they have to pay for GPUs and more.
    Nevertheless, I threw $25 into my account and that's been enough to experiment.

    I also appreciate their tuneable parameters and the code snippets to reproduce.
    For example, here's the cURL command to run the DeepSeek example:

    ```bash
    curl -X POST "https://api.hyperbolic.xyz/v1/chat/completions" \
          -H "Content-Type: application/json" \
          -H "Authorization: Bearer YOUR_BEARER_TOKEN " \
        --data-raw '{
            "messages": [{
              "role": "user",
              "content": "What can I do in SF?"
            }],
            "model": "deepseek-ai/DeepSeek-R1-0528",
            "max_tokens": 508,
            "temperature": 0.1,
            "top_p": 0.9,
            "stream": false
        }'
    ```
