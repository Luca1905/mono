package tui

import "strings"

func (m Model) View() string {
	var b strings.Builder

	b.WriteString("What is your question?")
	b.WriteRune('\n')

	b.WriteString(m.input.View())
	b.WriteRune('\n')

	b.WriteString(m.response)

	return b.String()
}
