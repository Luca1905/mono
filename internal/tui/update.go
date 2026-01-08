package tui

import (
	"strings"

	tea "github.com/charmbracelet/bubbletea"
)

func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd

	switch msg := msg.(type) {

	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height

	case tea.KeyMsg:
		switch msg.Type {

		case tea.KeyCtrlC:
			return m, tea.Quit

		case tea.KeyEnter:
			m.handleCommand(m.input.View())
			m.input.Reset()
		}
	}

	m.input, cmd = m.input.Update(msg)
	return m, cmd
}

func (m *Model) handleCommand(input string) {
	m.response = strings.TrimSpace(input)
}
