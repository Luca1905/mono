package ssh

import (
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/ssh"
	"github.com/charmbracelet/wish"
	"github.com/charmbracelet/wish/bubbletea"
	"github.com/charmbracelet/wish/logging"

	"mono/env"
	"mono/internal/tui"
)

func NewServer() (*ssh.Server, error) {
	return wish.NewServer(
		wish.WithAddress(":" + env.PORT.GetValue()),
		wish.WithHostKeyPath(env.HOST_KEY_PATH.GetValue()),
		wish.WithMiddleware(
			logging.Middleware(),
			bubbletea.Middleware(func(s ssh.Session) (tea.Model, []tea.ProgramOption) {
				return tui.NewModel(), nil
			}),
		),
	)
}
