package tui

import (
	tea "github.com/charmbracelet/bubbletea"
)

type Model struct {
	input   string
	history []string
	width   int
	height  int
}

func NewModel() Model {
	return Model{
		history: []string{},
	}
}

func (m Model) Init() tea.Cmd {
	return nil
}
