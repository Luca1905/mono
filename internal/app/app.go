package app

import (
	"context"
	"fmt"

	tea "github.com/charmbracelet/bubbletea"
	"mono/internal/ssh"
	"mono/internal/tui"
)

// RunServer starts the SSH server (Production mode)
func RunServer(ctx context.Context) error {
	server, err := ssh.NewServer()
	if err != nil {
		return err
	}

	go func() {
		<-ctx.Done()
		fmt.Println("shutting down server...")
		_ = server.Close()
	}()

	fmt.Println("mono listening on :2222")
	return server.ListenAndServe()
}

// RunLocal runs the TUI directly on stdout (Dev/Test mode)
func RunLocal(ctx context.Context) error {
	p := tea.NewProgram(
		tui.NewModel(),
		tea.WithAltScreen(), // Use full terminal size
		tea.WithContext(ctx),
	)

	if _, err := p.Run(); err != nil {
		return fmt.Errorf("error running tui: %w", err)
	}

	return nil
}
