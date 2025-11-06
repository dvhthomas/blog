---
title: "Week 5: Image and Video Generation"
date: 2025-11-01T11:03:11-06:00
tags: [llm, image]
toc: true
series: [AI Engineering Course]
summary: Overview of generative approaches to image and video generation. Includes text-to-image and text-to-video tasks.
draft: false
images: []
---

## Getting oriented

* Variational Autoencoder (VAE).
* Generative Adversarial Networks (GAN)
* Auto-regressive
* Diffusion models

### Variational Autoencoder (VAE)

One of the [earlier techniques][vae-paper] from 2013.
It's implemented as a series of linear layers (neural network).

* VAE Training
  * Encoder: a neural network that maps an input image into a lower-dimensional space (1-dimensional vector).
    Early on these were trained using the [MNIST dataset][kaggle-mnist], which is a ton of handwritten digits.
  * Decoder: another neural network that maps the lower-dimensional vector back into an image.
    There's a loss function that measures the difference between the original image and the reconstructed image.
    The goal of training is to minimize this loss function, i.e., get better at representing the input image.
* VAE Inference.
  * We don't need the inference part; we just need the Decoder.
    The input is just a random vector (sampled from a multi-variate Gaussian distribution).
    Then the decoder samples the data based on the training data.
  * [How VAE can be implmented][vae-implementation] and [a helpful visualizer][vae-latent-space] to help you develop some intuition of how VAEs work.


[Interesting article](https://johnthuma.medium.com/python-vae-and-generating-x-ray-data-215c8f7b7072) that shows how someone generated X-ray data using a VAE.

But...VAE is not typically used for consumer-oriented applications because the outputs are often blurry and not very realistic.
This is because VAEs are designed to learn a latent space that captures the underlying structure of the data, which may not always translate well to consumer-oriented applications.

### Generative Adversarial Network (GAN)

[Generative Adversarial Network][gan-paper] (2014) quickly became one of the most popular papers in computer vision history :-)

In GAN training there are two neural networks with a sequence of layers.
* The Generator tries to generate better and better images.
* The Discriminator becomes better and better at distinguishing between real and fake (AI-generated) images.
  * This is just a classifier: Fake or Real.

The loss function: the more that the generator can fool the Discriminator the better.
The training process aims to constantly tweak both networks simultaneously.

Again, GANs are not commonly used for advanced text-to-image generation.
[Google has some training][gan-overview] that explains the basics of GANs, including the difficulties building them.
But still, they made a lot of progress, like [StyleGAN2][stylegan2] doing things like adjusting the facial expression in photos.

### Auto-regressive modeling

Unlike VAE and GAN that each have two components, [Auto-regressive modeling][pixelcnn] treats images like a sequence of pixels (or patches of pixels).
In which case, you can generate the image pixel by pixel.
While this started out using a convolutional neural network (CNN), it has been [extended to use transformers][image-transformer] (self-attention mechanism).

Real image -> Convert to sequence -> Vector -> MODEL -> vector.

Each pixel is conditionally generated based on all the previous pixels.

The advantage of using transformers (self-attention) is that it's not random.
Because the _concepts_ of things like 'cat' or 'dog' are not random, but rather learned from the data.
**The model is _conditioned on_ the text input.**
Like LLMs, this is really key in text-to-image (t2i) generation.
That's what [DALLE.E][dalle] was based on.

### Diffusion Models

[First introduced in 2015][zero-shot],
This is an iterative process: you start with an image, then add noise to it, then train the model to predict a slightly denoised version of the image.
This step is repeated iteratively until the output is a high-quality image.
During training, the goal is to reduce the loss function such that the model can generate images that are indistinguishable from real _original_ images.

At inference time, you start with a random noise vector and iteratively denoise it until you get a high-quality image.

This was transformational in terms of the complexity, quality, and size of images.
For example, in [DALLE.2][dalle2-paper], OpenAI switched from GAN to diffusion models with a significant improvement in image quality.

### Comparison

Each approach has its trade-offs - VAEs and GANs are faster but lower quality, while autoregressive and diffusion models produce better results at the cost of speed and computational resources.

| Characteristics | VAE | GAN | Autoregressive | Diffusion |
|---|---|---|---|---|
| Quality | Low | Moderate | High | Exceptional |
| Speed | Fast | Fast | Slow | Slow |
| Training stability | Stable | Unstable | Stable | Stable |
| Control over generation | Limited | Limited | Flexible | Moderate |
| Facial manipulation | No | Yes | No | No |
| Novelty | Limited | Limited | High | High |
| Resource intensity | Moderate | Moderate | High | High |

## Text to Image

Diffusion models start from random noise and work towards a clear image that approximates the training data.
But with text-to-image, the whole point is to avoid randomness!

* Random generation:

{{< mermaid>}}
graph LR
  dm[Diffusion model] --> output
{{</ mermaid>}}

* Text-to-image (T2I) is **conditioned by the input text**:

{{< mermaid>}}
graph LR
  dog[A dog playing outside] --> dm[Diffusion model] --> output
  style dog fill:yellow
{{</ mermaid>}}

## Resources

* [Auto-Encoding Variational Bayes][vae-paper]
* [Kaggle MNIST dataset][kaggle-mnist]
* [TensorFlow MNIST][tensorflow-mnist]
* [VAE implementation][vae-implementation]
* [VAE latent space visualization][vae-latent-space]
* [GAN paper][gan-paper]
* [Overview of GAN structure][gan-overview]
* [StyleGAN2][stylegan2]
* [Conditional Image Generation with PixelCNN Decoders][pixelcnn]
* [Image Transformer][image-transformer]
* [DALL.E][dalle]
* [Zero-Shot Text-to-Image Generation][zero-shot]
* [Deep Unsupervised Learning using Nonequilibrium Thermodynamics][diffusion-thermo]
* [Denoising Diffusion Probabilistic Models][ddpm]
* [DALLE2 paper][dalle2-paper]
* [This person does not exist][person-not-exist]
* [DALLE2][dalle2]
* [DALLE3][dalle3]
* [Introducing 4o Image Generation][4o-image]
* [GPT-ImgEval: A Comprehensive Benchmark for Diagnosing GPT4o in Image Generation][gpt-imgeval]
* [Imagen 4][imagen4]
* [LMArean leaderboard][lmarena]
* [Laion][laion]
* [High-Resolution Image Synthesis with Latent Diffusion Models][latent-diffusion]
* [U-Net paper][unet]
* [DiT paper][dit]
* [Video diffusion models][video-diffusion]
* [Video generation models as world simulators][video-world-sim]
* [Veo][veo]
* [Video generation leaderboard][video-leaderboard]

[vae-paper]: https://arxiv.org/abs/1312.6114
[kaggle-mnist]: https://www.kaggle.com/datasets/hojjatk/mnist-dataset
[tensorflow-mnist]: https://www.tensorflow.org/datasets/catalog/mnist
[vae-implementation]: https://www.usna.edu/Users/cs/SD312/notes/18VAE/mnist.html
[vae-latent-space]: https://tayden.github.io/VAE-Latent-Space-Explorer/
[gan-paper]: https://arxiv.org/abs/1406.2661
[gan-overview]: https://developers.google.com/machine-learning/gan/gan_structure
[stylegan2]: https://github.com/NVlabs/stylegan2
[pixelcnn]: https://arxiv.org/abs/1606.05328
[image-transformer]: https://arxiv.org/abs/1802.05751
[dalle]: https://openai.com/index/dall-e/
[zero-shot]: https://arxiv.org/abs/2102.12092
[diffusion-thermo]: https://arxiv.org/abs/1503.03585
[ddpm]: https://arxiv.org/abs/2006.11239
[dalle2-paper]: https://cdn.openai.com/papers/dall-e-2.pdf
[person-not-exist]: https://thispersondoesnotexist.com/
[dalle2]: https://openai.com/index/dall-e-2/
[dalle3]: https://openai.com/index/dall-e-3/
[4o-image]: https://openai.com/index/introducing-4o-image-generation/
[gpt-imgeval]: https://arxiv.org/abs/2504.02782
[imagen4]: https://developers.googleblog.com/en/imagen-4-now-available-in-the-gemini-api-and-google-ai-studio/
[lmarena]: https://lmarena.ai/leaderboard/text-to-image
[laion]: https://laion.ai/blog/
[latent-diffusion]: https://arxiv.org/abs/2112.10752
[unet]: https://arxiv.org/abs/1505.04597
[dit]: https://arxiv.org/abs/2212.09748
[video-diffusion]: https://video-diffusion.github.io/
[video-world-sim]: https://openai.com/index/video-generation-models-as-world-simulators/
[veo]: https://deepmind.google/models/veo/
[video-leaderboard]: https://huggingface.co/spaces/ArtificialAnalysis/Video-Generation-Arena-Leaderboard
