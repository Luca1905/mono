package tui

import "github.com/charmbracelet/lipgloss"

var (
	Text = lipgloss.NewStyle().
		Foreground(lipgloss.NoColor{})

	Dim = lipgloss.NewStyle().
		Faint(true)

	Bold = lipgloss.NewStyle().
		Bold(true)
)
