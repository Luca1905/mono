package env

import (
	"os"

	"github.com/joho/godotenv"
)


type EnvKey string

func (key EnvKey) GetValue() string {
 return os.Getenv(string(key))
}

const (
 Env                     EnvKey = "ENV"
 PORT										 EnvKey = "PORT"
 HOST_KEY_PATH					 EnvKey = "HOST_KEY_PATH"
 OPENAI_API_KEY					 EnvKey = "OPENAI_API_KEY"
 ANTHROPIC_API_KEY			 EnvKey = "ANTHROPIC_API_KEY"
)

const (
 EnvDevelopment = "development"
 EnvProduction  = "production"
)

func IsDevelopmentMode() bool {
 return Env.GetValue() == EnvDevelopment
}

func Load() error {
 return godotenv.Load(".env")
}
