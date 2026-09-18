package config

import (
	"os"
	"path/filepath"
)

const (
	DefaultWidth  = 1280
	DefaultHeight = 720
	MinWidth      = 960
	MinHeight     = 640
)

// DatabasePath resolves the SQLite database path.
// It checks the KAPIVARA_DB_PATH environment variable first.
// If not set, it defaults to UserConfigDir/<DBFolder>/<DBName>.
func DatabasePath() string {
	if dbPath := os.Getenv("KAPIVARA_DB_PATH"); dbPath != "" {
		return dbPath
	}

	configDir, err := os.UserConfigDir()
	if err != nil {
		configDir = "."
	}
	return filepath.Join(configDir, DBFolder, DBName)
}
