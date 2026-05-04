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
	"charm.land/wish/v2/activeterm"
	"charm.land/wish/v2/logging"
	"github.com/charmbracelet/ssh"
	"github.com/joho/godotenv"

	"github.com/Luca1905/mono/internal/sshbridge"
)

func getEnv(key string) string {
	if value, ok := os.LookupEnv(key); ok && value != "" {
		return value
	}
	log.Error("Environment variable not set", "name", key)
	os.Exit(1)
	return ""
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	var (
		host            = getEnv("HOST")
		port            = getEnv("PORT")
		tuiEntry        = getEnv("TUI_ENTRY")
		aiGatewayAPIKey = getEnv("AI_GATEWAY_API_KEY")
	)

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
			activeterm.Middleware(),
			// The last item in the chain is the first to be called.
			logging.StructuredMiddleware(),
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
