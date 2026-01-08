package tui

import (
	"fmt"
	"log"
	"mono/internal/ai"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"go.jetify.com/ai/api"
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
			m.handleCommand(m.input.Value())
			m.input.Reset()
		}
	}

	m.input, cmd = m.input.Update(msg)
	return m, cmd
}

func (m *Model) handleCommand(input string) {
	model := ai.CreateModel()
	res, err := ai.StreamText(model, strings.TrimSpace(input))
	if err != nil {
		log.Fatal(err)
	}
	for event := range res.Stream {
		switch e := event.(type) {
		case *api.TextDeltaEvent:
			// Print text delta events as they arrive
			m.response += e.TextDelta
		case *api.FinishEvent:
			// Print final information
			fmt.Printf("\n\nFinish Reason: %s\n", e.FinishReason)
			fmt.Printf("Usage: Input=%d, Output=%d, Total=%d tokens\n",
				e.Usage.InputTokens,
				e.Usage.OutputTokens,
				e.Usage.TotalTokens)
		case *api.ErrorEvent:
			// Handle errors
			fmt.Printf("\nError: %s\n", e.Error())
		}
	}
}
