package tui

import (
	"strings"

	tea "github.com/charmbracelet/bubbletea"
)

func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {

	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height

	case tea.KeyMsg:
		switch msg.Type {

		case tea.KeyCtrlC:
			return m, tea.Quit

		case tea.KeyEnter:
			m.history = append(m.history, "> "+m.input)
			m.handleCommand(m.input)
			m.input = ""

		case tea.KeyBackspace:
			if len(m.input) > 0 {
				m.input = m.input[:len(m.input)-1]
			}

		default:
			if msg.Type == tea.KeyRunes {
				m.input += msg.String()
			}
		}
	}

	return m, nil
}

func (m *Model) handleCommand(input string) {
	if strings.HasPrefix(input, "/") {
		m.history = append(m.history, "[command] "+input)
		return
	}

	// placeholder for AI call
	m.history = append(m.history, "…")
}
