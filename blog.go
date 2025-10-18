// Package main provides a build tool for Hugo blogs with D2 diagram support.
//
// # Overview
//
// This tool automatically renders D2 diagram files (.d2) to SVG format for use in Hugo sites.
// It integrates with Hugo's build and development workflow to provide live reloading of diagrams.
//
// # D2 Integration
//
// D2 (https://d2lang.com) is a declarative diagram language. This tool:
//   - Finds all .d2 files in the Hugo content directory
//   - Renders them to .svg files in the same location
//   - Reads rendering options from Hugo's config.toml [params.d2] section
//   - Watches for changes and re-renders automatically in development mode
//
// # Assumptions
//
//   - The d2 command-line tool is installed and available in PATH
//   - Hugo content lives in a 'content/' directory
//   - Hugo config is in 'config.toml' at the project root
//   - Generated .svg files are git-ignored (only .d2 sources are committed)
//   - D2 files use the Hugo shortcode: {{< d2 src="diagram.d2" >}}
//
// # Usage
//
//	# Render all D2 files once (for production builds)
//	go run blog.go
//
//	# Development mode: start Hugo server with D2 watching
//	go run blog.go --serve
//
//	# Watch D2 files only (without Hugo server)
//	go run blog.go --watch
//
//	# Show detailed rendering output
//	go run blog.go --verbose
//
// # Configuration
//
// D2 rendering options are read from config.toml:
//
//	[params.d2]
//	    theme = "1"        # D2 theme ID (0-8) or name
//	    layout = "elk"     # Layout engine: elk, dagre, etc.
//	    sketch = false     # Hand-drawn style
//	    pad = 10           # Padding in pixels
//
// # Integration with Hugo
//
// In development (--serve mode):
//  1. Renders all D2 files initially
//  2. Starts Hugo dev server
//  3. Watches for D2 file changes and re-renders
//  4. Hugo detects SVG changes and triggers browser reload
//
// In production (CI/CD):
//  1. Run 'go run blog.go' to render all diagrams
//  2. Run 'hugo' to build the site with the generated SVGs
//
// # File Watching
//
// The tool watches:
//   - All .d2 files in content/ → re-renders individual file on change
//   - config.toml → re-renders ALL diagrams if D2 config changes
//   - New directories created in content/ → automatically adds to watch list
//
// Changes are debounced (300ms) to avoid multiple renders during rapid edits.
package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/BurntSushi/toml"
	"github.com/fsnotify/fsnotify"
)

// Config represents the Hugo config.toml structure containing D2 rendering settings.
// Only the [params.d2] section is parsed; other Hugo settings are ignored.
type Config struct {
	Params struct {
		D2 struct {
			Theme  string `toml:"theme"`  // D2 theme ID or name (e.g., "1", "cool-classics")
			Layout string `toml:"layout"` // Layout engine (e.g., "elk", "dagre")
			Sketch bool   `toml:"sketch"` // Enable hand-drawn sketch style
			Pad    int    `toml:"pad"`    // Padding in pixels around diagrams
		} `toml:"d2"`
	} `toml:"params"`
}

func main() {
	// Define flags
	serve := flag.Bool("serve", false, "Run Hugo dev server with D2 watching")
	watch := flag.Bool("watch", false, "Watch D2 files only (no Hugo server)")
	verbose := flag.Bool("verbose", false, "Show detailed output")
	flag.Parse()

	// Ensure d2 is installed
	if !commandExists("d2") {
		log.Fatal("d2 is not installed. Install: curl -fsSL https://d2lang.com/install.sh | sh -s --")
	}

	// Load Hugo config to get D2 settings
	config := loadConfig("config.toml")

	// Render all D2 files initially
	if err := renderAll("content", config, *verbose); err != nil {
		log.Fatalf("Failed to render D2 files: %v", err)
	}

	// Start appropriate mode
	switch {
	case *serve:
		runServeMode("content", "config.toml", config, *verbose)
	case *watch:
		runWatchMode("content", "config.toml", config, *verbose)
	}
}

// commandExists checks if a command is available in the system PATH.
func commandExists(cmd string) bool {
	_, err := exec.LookPath(cmd)
	return err == nil
}

// loadConfig reads Hugo's config.toml and extracts D2 rendering settings.
// Returns an empty config (with safe defaults) if the file cannot be read.
// This allows the tool to run even without explicit D2 configuration.
func loadConfig(path string) *Config {
	var cfg Config
	if _, err := toml.DecodeFile(path, &cfg); err != nil {
		log.Printf("Warning: Could not load %s: %v", path, err)
	}
	return &cfg
}

// buildD2Command constructs a d2 command with rendering options from config.
//
// The command will render d2File to an SVG with the same basename.
// For example: "diagram.d2" → "diagram.svg"
//
// D2 options are applied in this order:
//   - --theme (if specified in config)
//   - --layout (if specified in config)
//   - --sketch (if enabled in config)
//   - --pad (if > 0 in config)
func buildD2Command(d2File string, config *Config) *exec.Cmd {
	args := []string{}

	// Add D2 options from config
	if theme := config.Params.D2.Theme; theme != "" {
		args = append(args, "--theme="+theme)
	}
	if layout := config.Params.D2.Layout; layout != "" {
		args = append(args, "--layout="+layout)
	}
	if config.Params.D2.Sketch {
		args = append(args, "--sketch")
	}
	if pad := config.Params.D2.Pad; pad > 0 {
		args = append(args, fmt.Sprintf("--pad=%d", pad))
	}

	// Add input and output files
	svgFile := strings.TrimSuffix(d2File, ".d2") + ".svg"
	args = append(args, d2File, svgFile)

	return exec.Command("d2", args...)
}

// renderFile renders a single D2 diagram file to SVG format.
//
// The SVG is written to the same directory with a .svg extension.
// Example: content/blog/2025-01-01/diagram.d2 → diagram.svg
//
// Returns an error if the d2 command fails. The error includes both
// the error message and any output from d2 for debugging.
func renderFile(d2File string, config *Config, verbose bool) error {
	if verbose {
		log.Printf("Rendering %s", d2File)
	} else {
		log.Printf("Rendering %s", filepath.Base(d2File))
	}

	cmd := buildD2Command(d2File, config)
	if output, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("%s: %v\n%s", d2File, err, output)
	}

	return nil
}

// renderAll finds and renders all D2 files in the content directory.
//
// Files are rendered concurrently for performance. Any errors are collected
// and reported after all renders complete. Returns an error if any renders fail.
//
// This is called:
//   - Once at startup (all modes)
//   - When config.toml changes (watch/serve modes)
func renderAll(contentDir string, config *Config, verbose bool) error {
	d2Files, err := findD2Files(contentDir)
	if err != nil {
		return err
	}

	if len(d2Files) == 0 {
		log.Println("No .d2 files found")
		return nil
	}

	log.Printf("Found %d D2 file(s)", len(d2Files))

	// Render all files concurrently
	var wg sync.WaitGroup
	errChan := make(chan error, len(d2Files))

	for _, file := range d2Files {
		wg.Add(1)
		go func(f string) {
			defer wg.Done()
			if err := renderFile(f, config, verbose); err != nil {
				errChan <- err
			}
		}(file)
	}

	wg.Wait()
	close(errChan)

	// Report errors
	var errCount int
	for err := range errChan {
		log.Printf("ERROR: %v", err)
		errCount++
	}

	if errCount > 0 {
		return fmt.Errorf("%d file(s) failed", errCount)
	}

	log.Println("✓ D2 rendering complete")
	return nil
}

// findD2Files recursively walks a directory tree and returns all .d2 file paths.
func findD2Files(dir string) ([]string, error) {
	var files []string
	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && strings.HasSuffix(path, ".d2") {
			files = append(files, path)
		}
		return nil
	})
	return files, err
}

// runServeMode runs the Hugo development server with live D2 diagram reloading.
//
// This is the primary development mode. It:
//  1. Starts a background goroutine watching D2 files
//  2. Starts Hugo's dev server in the foreground
//  3. Handles Ctrl+C gracefully, shutting down both processes
//
// The D2 watcher and Hugo server share a context. When the user hits Ctrl+C,
// the context is cancelled, signaling both goroutines to shutdown cleanly.
//
// Hugo automatically detects when SVG files change and triggers browser reload.
func runServeMode(contentDir, configFile string, config *Config, verbose bool) {
	if !commandExists("hugo") {
		log.Fatal("hugo is not installed. Install from https://gohugo.io/installation/")
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Handle Ctrl+C gracefully
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	// Start D2 watcher in background
	go func() {
		log.Println("Starting D2 file watcher...")
		watchD2Files(ctx, contentDir, configFile, config, verbose)
	}()

	time.Sleep(500 * time.Millisecond) // Let watcher start

	// Start Hugo server
	log.Println("Starting Hugo dev server...")
	hugoCmd := exec.CommandContext(ctx, "hugo", "server", "--buildDrafts", "--noHTTPCache", "--cleanDestinationDir")
	hugoCmd.Stdout = os.Stdout
	hugoCmd.Stderr = os.Stderr
	hugoCmd.Stdin = os.Stdin

	if err := hugoCmd.Start(); err != nil {
		log.Fatalf("Failed to start Hugo: %v", err)
	}

	// Wait for shutdown signal
	<-sigChan
	log.Println("\nShutting down...")
	cancel()
	time.Sleep(500 * time.Millisecond)

	if hugoCmd.Process != nil {
		hugoCmd.Process.Kill()
	}
	hugoCmd.Wait()
	log.Println("Stopped")
}

// runWatchMode watches D2 files for changes without starting the Hugo server.
//
// This mode is useful when running Hugo separately (e.g., in a different terminal
// or with custom Hugo flags). The watcher will continue until interrupted with Ctrl+C.
func runWatchMode(contentDir, configFile string, config *Config, verbose bool) {
	log.Printf("Watching %s for D2 changes (Ctrl+C to stop)", contentDir)
	watchD2Files(context.Background(), contentDir, configFile, config, verbose)
}

// watchD2Files monitors the filesystem for D2 diagram and config changes.
//
// It watches:
//   - All .d2 files: re-renders the specific file on change (debounced 300ms)
//   - config.toml: re-renders ALL diagrams if [params.d2] settings change
//   - New directories: automatically adds them to the watch list
//
// The watcher runs until ctx is cancelled. In serve mode, cancellation happens
// when the user hits Ctrl+C. In watch mode, it runs indefinitely.
//
// Debouncing prevents excessive re-renders when files are saved multiple times
// rapidly (e.g., by editors that save on every keystroke).
func watchD2Files(ctx context.Context, contentDir, configFile string, config *Config, verbose bool) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatalf("Failed to create watcher: %v", err)
	}
	defer watcher.Close()

	// Watch config file
	watcher.Add(configFile)

	// Watch all content directories recursively
	filepath.Walk(contentDir, func(path string, info os.FileInfo, err error) error {
		if err == nil && info.IsDir() {
			watcher.Add(path)
		}
		return nil
	})

	// Debouncing: wait 300ms after last change before rendering
	debounce := make(map[string]*time.Timer)
	var debounceMu sync.Mutex

	for {
		select {
		case <-ctx.Done():
			return

		case event := <-watcher.Events:
			// Config changed - re-render everything
			if event.Name == configFile && event.Op&fsnotify.Write != 0 {
				log.Println("Config changed - re-rendering all")
				config = loadConfig(configFile)
				renderAll(contentDir, config, verbose)
				continue
			}

			// D2 file changed - render it (debounced)
			if strings.HasSuffix(event.Name, ".d2") && event.Op&fsnotify.Write != 0 {
				debounceMu.Lock()
				if timer, exists := debounce[event.Name]; exists {
					timer.Stop()
				}
				debounce[event.Name] = time.AfterFunc(300*time.Millisecond, func() {
					renderFile(event.Name, config, verbose)
				})
				debounceMu.Unlock()
			}

			// New directory - watch it
			if event.Op&fsnotify.Create != 0 {
				if info, err := os.Stat(event.Name); err == nil && info.IsDir() {
					watcher.Add(event.Name)
				}
			}

		case err := <-watcher.Errors:
			log.Printf("Watcher error: %v", err)
		}
	}
}
