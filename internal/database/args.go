package database

import (
	"encoding/json"
)

// cleanArgs normalizes SQL arguments for the SQLite driver,
// serializing maps and slices to JSON strings automatically.
func cleanArgs(args []interface{}) []interface{} {
	if len(args) == 0 {
		return args
	}
	cleaned := make([]interface{}, len(args))
	for i, arg := range args {
		switch v := arg.(type) {
		case map[string]interface{}, []interface{}:
			if b, err := json.Marshal(v); err == nil {
				cleaned[i] = string(b)
				continue
			}
		}
		cleaned[i] = arg
	}
	return cleaned
}
