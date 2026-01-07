package ssh

import (
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/ssh"
	"github.com/charmbracelet/wish"
	"github.com/charmbracelet/wish/bubbletea"
	"github.com/charmbracelet/wish/logging"

	"mono/internal/tui"
)

func NewServer() (*ssh.Server, error) {
	return wish.NewServer(
		wish.WithAddress(":2222"),
		wish.WithHostKeyPath(".ssh/mono_ed25519"),
		wish.WithMiddleware(
			logging.Middleware(),
			bubbletea.Middleware(func(s ssh.Session) (tea.Model, []tea.ProgramOption) {
				return tui.NewModel(), nil
			}),
		),
	)
}
