package sshbridge

import (
	"context"
	"fmt"
	"io"
	"os/exec"

	"github.com/charmbracelet/ssh"
)

type EnvConfig struct {
	AIGatewayAPIKey string
}

func Middleware(tuiEntry string, cfg EnvConfig) func(ssh.Handler) ssh.Handler {
	return func(next ssh.Handler) ssh.Handler {
		return func(s ssh.Session) {
			pty, winCh, ok := s.Pty()
			if !ok {
				_, _ = io.WriteString(s, "this app requires a PTY\n")
				s.Exit(1)
				return
			}

			ctx, cancel := context.WithCancel(s.Context())
			defer cancel()

			cmd := exec.CommandContext(ctx, tuiEntry)
			cmd.Env = []string{
				"AI_GATEWAY_API_KEY=" + cfg.AIGatewayAPIKey,
				"TERM=" + pty.Term,
				fmt.Sprintf("COLUMNS=%d",
					pty.Window.Width),
				fmt.Sprintf("LINES=%d",
					pty.Window.Height),
				"SSH_USER=" + s.User(),
				"SSH_REMOTE_ADDR=" + s.RemoteAddr().String(),
			}

			err := pty.Start(cmd)
			if err != nil {
				_, _ = io.WriteString(s, "failed to start command\n")
				s.Exit(1)
				return
			}
			defer func() { _ = pty.Close() }()

			go func() {
				for win := range winCh {
					_ = pty.Resize(
						win.Width,
						win.Height,
					)
				}
			}()
			cmd.Wait()
			next(s)
		}
	}
}
