package ai

import (
	"go.jetify.com/ai/provider/openai"
)

func CreateModel() *openai.LanguageModel  {
	return openai.NewLanguageModel("gpt-5-nano")
}

