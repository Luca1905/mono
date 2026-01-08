package ai

import (
	"context"

	aisdk "go.jetify.com/ai"
	"go.jetify.com/ai/api"
	"go.jetify.com/ai/provider/openai"
)

func StreamText(model *openai.LanguageModel, input string) (*api.StreamResponse, error) {
	return aisdk.StreamTextStr(
		context.Background(),
		input,
		aisdk.WithModel(model),
	)
}
