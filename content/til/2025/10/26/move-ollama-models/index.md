---
title: Moving Ollama Models to a Different Disk
date: 2025-10-26T15:43:57-06:00
tags: [ollama, llm]
toc: true
series: []
summary: I'm running Ollama on a Macbook so shifting the default location that Ollama downloads massive models to is a necessity. It's just one environment setting away.
mermaid: false
mathjax: false
draft: false
images: [ollama.png]
---

By default, Ollama stores its models in `~/.ollama/models` on macOS.
If you need to store models on a different disk or location (for example, on an external drive with more space), you can configure this using the `OLLAMA_MODELS` environment variable.

Because even the small models get big, fast:

```sh
% ollama list
NAME           ID              SIZE      MODIFIED
llama3.2:3b    a80c4f17acd5    2.0 GB    20 minutes ago
```

## Temporary Configuration (Current Session Only)

To set the location for your current terminal session:

```zsh
export OLLAMA_MODELS=/path/to/your/models
```

This will only last until you close the terminal window.

## Permanent Configuration

To make the change permanent, add the environment variable to your shell profile:

**For Zsh (default on macOS Catalina and later):**

```zsh
echo 'export OLLAMA_MODELS=/path/to/your/models' >> ~/.zshrc
source ~/.zshrc
```

> INFO: Replace `/path/to/your/models` with your desired location, such as `/Volumes/ExternalDrive/ollama/models`.
> On my machine it's `/Volumes/Fast/ollama/models` because my external disk is also, you know, _fast_!!!

## Restarting Ollama

After setting the environment variable, restart Ollama for the changes to take effect:

```zsh
# Stop any running Ollama processes
pkill ollama

# Start Ollama again
ollama serve
```

{{< figure src="ollama.png" title="Ollama startup showing the new location" >}}

## Moving Existing Models

If you've already downloaded models and want to move them to the new location:

1. **Stop Ollama:**
   ```zsh
   pkill ollama
   ```

2. **Copy your existing models:**
   ```zsh
   cp -r ~/.ollama/models /path/to/your/models
   ```

3. **Set the environment variable** (as described above)

4. **Restart Ollama:**
   ```zsh
   ollama serve
   ```

5. **Verify the models are accessible:**
   ```zsh
   ollama list
   ```

## Verifying Your Configuration

To confirm that Ollama is using your custom location:

```zsh
echo $OLLAMA_MODELS
```

This should display your configured path. You can also check that models are being stored in the new location by running a model and then checking the directory contents.

## Troubleshooting

**Models not appearing after restart:**
- Ensure the `OLLAMA_MODELS` path exists and has proper read/write permissions
- Check that the environment variable is set: `echo $OLLAMA_MODELS`
- Make sure you've sourced your shell profile or opened a new terminal window
  - This is so obvious it's not worth mentioning...except that I forgot this and finally realized why things weren't working :-\

**Permission denied errors:**
- Ensure your user has read/write permissions to the target directory:
  ```zsh
  chmod -R 755 /path/to/your/models
  ```

## Additional Resources

- [Ollama Official Documentation](https://github.com/ollama/ollama/blob/main/docs/faq.md)
- [Ollama GitHub Repository](https://github.com/ollama/ollama)
- [Ollama Model Library](https://ollama.com/library)
- [Environment Variable Configuration](https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-configure-ollama-server)

