package api

import (
	"encoding/json"

	"github.com/google/uuid"
)

func GenerateID() string {
	return uuid.New().String()
}

func JsonArray(arr []string) string {
	b, _ := json.Marshal(arr)
	return string(b)
}

func JsonObject(obj map[string]any) string {
	b, _ := json.Marshal(obj)
	return string(b)
}
