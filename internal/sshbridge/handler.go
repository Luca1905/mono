package sshbridge

import (
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"

	"github.com/charmbracelet/ssh"
	"github.com/creack/pty"
)

func Middleware(tuiEntry string) func(ssh.Handler) ssh.Handler {
	return func(next ssh.Handler) ssh.Handler {
		return func(s ssh.Session) {
			ptyReq, winCh, ok := s.Pty()
			if !ok {
				_, _ = io.WriteString(s, "this app requires a PTY\n")
				s.Exit(1)
				return
			}

			ctx, cancel := context.WithCancel(s.Context())
			defer cancel()

			cmd := exec.CommandContext(ctx, tuiEntry)
			cmd.Env = append(
				os.Environ(),
				"TERM="+ptyReq.Term,
				fmt.Sprintf("COLUMNS=%d",
					ptyReq.Window.Width),
				fmt.Sprintf("LINES=%d",
					ptyReq.Window.Height),
				"SSH_USER="+s.User(),
				"SSH_REMOTE_ADDR="+s.RemoteAddr().String(),
			)

			ptmx, err := pty.StartWithSize(cmd, &pty.Winsize{
				Cols: uint16(ptyReq.Window.Width),
				Rows: uint16(ptyReq.Window.Height),
			})
			if err != nil {
				_, _ = io.WriteString(s, "failed to start command\n")
				s.Exit(1)
				return
			}
			defer func() { _ = ptmx.Close() }()

			go func() {
				for win := range winCh {
					_ = pty.Setsize(ptmx, &pty.Winsize{
						Cols: uint16(win.Width),
						Rows: uint16(win.Height),
					})
				}
			}()

			go func() {
				_, _ = io.Copy(ptmx, s) // stdin
				_ = ptmx.Close()
			}()

			io.Copy(s, ptmx) // stdout
			cmd.Wait()
		}
	}
}
