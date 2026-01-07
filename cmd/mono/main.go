package main

import (
	"context"
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"

	"mono/internal/app"
)

func main() {
	// Parse flags
	localMode := flag.Bool("local", false, "Run TUI locally without SSH server")
	flag.Parse()

	// Handle graceful shutdown
	ctx, stop := signal.NotifyContext(
		context.Background(),
		os.Interrupt,
		syscall.SIGTERM,
	)
	defer stop()

	// Choose mode
	if *localMode {
		if err := app.RunLocal(ctx); err != nil {
			log.Fatal(err)
		}
	} else {
		if err := app.RunServer(ctx); err != nil {
			log.Fatal(err)
		}
	}
}
