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
	host = "localhost"
	port = "23234"
)

func main() {
	tuiEntry := "./packages/tui/dist/index.js"

	srv, err := wish.NewServer(
		wish.WithAddress(net.JoinHostPort(host, port)),
		wish.WithHostKeyPath(".ssh/id_ed25519"),

		ssh.AllocatePty(),

		// Middlewares do something on a ssh.Session, and then call the next
		// middleware in the stack.
		wish.WithMiddleware(
			sshbridge.Middleware(tuiEntry),
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
