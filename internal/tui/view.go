package tui

import "strings"

func (m Model) View() string {
	var b strings.Builder

	for _, line := range m.history {
		b.WriteString(line)
		b.WriteRune('\n')
	}

	b.WriteRune('\n')
	b.WriteString("> ")
	b.WriteString(m.input)

	return b.String()
}
