---
title: Interpret LLM Model Size
date: 2025-10-14T13:26:35-06:00
tags: [llm, ai]
toc: true
series: []
summary: How to interpret the numbers used to describe LLMs.
mermaid: false
mathjax: true
draft: false
images: []
aliases: ["/til/2025-10-14/"]
---

> TIP: The [Transformers, the tech behind LLMs | Deep Learning Chapter 5
](https://www.youtube.com/watch?v=wjZofJX0v4M) video by 3Blue1Brown is superb at explaining the Transformer architecture and where the size numbers come from.

First remember what the hidden dimension (embedding size) is. The embedding dimension is absolutely a choice made by the model designer before training starts.

## Where the numbers come from

Before any training happens, when you're designing the model architecture. It's a fundamental hyperparameter, like choosing how many layers you want.

### Where The Numbers Are Decided

The embedding dimension gets set at the very beginning and flows through the entire model:

{{<highlight python "hl_lines=3">}}
# Model configuration (before training)
config = {
    'hidden_dim': 4096,        # ← YOUR CHOICE - THIS IS THE EMBEDDING DIMENSION a.k.a. hidden dimension
    'num_layers': 32,          # ← YOUR CHOICE
    'num_heads': 32,           # ← YOUR CHOICE
    'vocab_size': 50000,       # ← depends on your tokenizer
}
{{</highlight>}}

### How Numbers Are Baked Into Models

1. convert token IDs to vectors

embedding_layer = $\text{vocab\_size} \times \text{hidden\_dim}$ matrix

  This creates initial vectors. For example, assume you have 4096 values in each vector then the output is two-part data: `token_id → 4096-dimensional vector`

2. Each layer then uses hidden_dim for all its weights

> `hidden_dimension` is the same as the vector dimension used to describe each token in the model.

  ```python
  for each layer:
      attention_weights = Matrix(hidden_dim x hidden_dim)
      ffn_weights_1 = Matrix(hidden_dim x 4*hidden_dim)
      ffn_weights_2 = Matrix(4*hidden_dim x hidden_dim)
  ```

### The Trade-off of bigger hidden_dim:

* ✅ Each token can hold more information
* ✅ More expressive model
* ❌ Way more parameters (quadratic growth in attention!)
* ❌ Slower training and inference

### Common choices for dimensions

* Smaller models: 768, 1024, 2048
* Medium models: 4096, 5120
* Large models: 8192, 12288

Once you start training with `hidden_dim=4096`, you're stuck with it.
You can't change it mid-training because all your weight matrices are already that size!

## The Formula for Model Size

How do you use that knowledge to calculate the rough model size?

$$
\text{total\_parameters} \approx \text{num\_layers} \times (c \times \text{hidden\_dim}^2)
$$

Where that constant $c$ is roughly **12** (from the attention + feed-forward components).
Here's how $c$ is derived and worked into the equation:

For each layer:
- **Attention**: 4 matrices of (hidden_dim × hidden_dim) = **4 × hidden_dim²**
  - Remember: the hidden_dimension is the *size of the one-dimensional vector* used to represent each token used to train the model. That size is a decision made by the model builder.
- **Feed-forward**:
  - W1: hidden_dim × (4 × hidden_dim) = **4 × hidden_dim²**
  - W2: (4 × hidden_dim) × hidden_dim = **4 × hidden_dim²**

**Total per layer ≈ 12 × hidden_dim²**

### Concrete Example: LLaMA 7B

- 32 layers
- hidden_dim = 4,096

```
Parameters ≈ 32 × (12 × 4096²)
           = 32 × (12 × 16,777,216)
           = 32 × 201,326,592
           ≈ 6.4 billion
```

Pretty close to the advertised 7B! (The extra comes from the embedding layer and final output layer.)

## The Key Insight

Parameter count scales with:
- **Linear** in number of layers: 2× layers → 2× parameters
- **Quadratic** in hidden dimension: 2× hidden_dim → 4× parameters

So doubling the hidden dimension is *much* more expensive than doubling the layer count!
