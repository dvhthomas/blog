---
title: Retrieval Augmented Generation (RAG)
date: 2025-10-14T13:01:07-06:00
tags: [rag, llm]
toc: true
series: [AI Engineering Course]
summary: Part two of the AI Engineering Course, focusing on Retrieval Augmented Generation (RAG) and its applications.
mermaid: false
mathjax: false
draft: false
images: [lora-paper.png]
---

# LLM Resources: Organized by Topic

The first part is all about parameter-efficient fine-tuning (PEFT)and model adaptation.
Adapters and LoRA are both parameter-specific fine-tuning methods.

{{< figure src="lora-paper.png" title="Title and abstract of the low rank adaptation (LoRA) paper" >}}

## Fine-Tuning & Model Adaptation

**Foundational Papers:**
- [Parameter-Efficient Transfer Learning for NLP](https://arxiv.org/abs/1902.00751)
- [LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)

**Implementation Tools:**
- [HuggingFace PEFT (Parameter-Efficient Fine-Tuning)](https://github.com/huggingface/peft)

## Prompting Techniques

**Research Papers:**
- [Chain-of-Thought Prompting Elicits Reasoning in Large Language Models](https://arxiv.org/abs/2201.11903)
- [Large Language Models are Zero-Shot Reasoners](https://arxiv.org/abs/2205.11916)

**Guides & Resources:**
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

## Document Processing & Text Preparation

**Document Parsing:**
- [Dedoc: Universal PDF/document extractor](https://github.com/ispras/dedoc)
- [Layout-Parser: Document layout analysis](https://github.com/Layout-Parser/layout-parser)

**Text Chunking:**
- [Langchain Text Splitters](https://python.langchain.com/docs/concepts/text_splitters/)

## Embeddings & Vector Representations

**Foundational Research:**
- [Efficient Estimation of Word Representations in Vector Space (Word2Vec)](https://arxiv.org/abs/1301.3781)

**Embedding APIs & Models:**
- [OpenAI's Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [The Best Embedding Models for Information Retrieval in 2025](https://www.datastax.com/blog/best-embedding-models-information-retrieval-2025)

**Multimodal Embeddings:**
- [OpenAI's CLIP: Connecting text and images](https://openai.com/index/clip/)

## Vector Search & Retrieval

**Vector Databases & Search:**
- [Faiss: Library for efficient similarity search](https://github.com/facebookresearch/faiss)

**RAG Techniques:**
- [RAFT: Retrieval Augmented Fine-Tuning](https://arxiv.org/abs/2403.10131)
