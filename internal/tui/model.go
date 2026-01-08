package tui

import (
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
)

type Model struct {
	input   textinput.Model
	response string
	width   int
	height  int
	err 		error
}

func NewModel() Model {
	ti := textinput.New()
	ti.Placeholder = "hello"
	ti.Focus()
	ti.CharLimit = 156
	ti.Width = 20

	return Model{
		input: ti,
		response: "",
		err: nil,
	}
}

func (m Model) Init() tea.Cmd {
	return textinput.Blink
}
