package main

import (
	"context"
	"errors"
	"net"
	"os"
	"os/signal"
	"syscall"
	"time"

	"charm.land/log/v2"
	"charm.land/wish/v2"
	"charm.land/wish/v2/logging"
	"github.com/charmbracelet/ssh"

	"github.com/Luca1905/mono/internal/sshbridge"
)

const (
	host     = "localhost"
	port     = "23234"
	tuiEntry = "packages/tui/dist/@mono/tui-darwin-arm64/bin/mono"
)

func main() {
	aiGatewayAPIKey := os.Getenv("AI_GATEWAY_API_KEY")
	if aiGatewayAPIKey == "" {
		log.Error("Missing required environment variable", "name", "AI_GATEWAY_API_KEY")
		os.Exit(1)
	}

	srv, err := wish.NewServer(
		wish.WithAddress(net.JoinHostPort(host, port)),
		wish.WithHostKeyPath(".ssh/id_ed25519"),

		ssh.AllocatePty(),

		// Middlewares do something on a ssh.Session, and then call the next
		// middleware in the stack.
		wish.WithMiddleware(
			sshbridge.Middleware(tuiEntry, sshbridge.EnvConfig{
				AIGatewayAPIKey: aiGatewayAPIKey,
			}),
			// The last item in the chain is the first to be called.
			logging.Middleware(),
		),
	)
	if err != nil {
		log.Error("Could not start server", "error", err)
	}

	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		log.Info("Starting SSH server", "host", host, "port", port)
		if err = srv.ListenAndServe(); err != nil && !errors.Is(err, ssh.ErrServerClosed) {
			// We ignore ErrServerClosed because it is expected.
			log.Error("Could not start server", "error", err)
			done <- nil
		}
	}()
	<-done

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer func() { cancel() }()
	if err := srv.Shutdown(ctx); err != nil && !errors.Is(err, ssh.ErrServerClosed) {
		log.Error("Could not shutdown server", "error", err)
	}
}
