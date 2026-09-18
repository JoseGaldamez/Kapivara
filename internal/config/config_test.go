package config

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestDatabasePath_Default(t *testing.T) {
	orig := os.Getenv("KAPIVARA_DB_PATH")
	os.Unsetenv("KAPIVARA_DB_PATH")
	defer func() {
		if orig != "" {
			os.Setenv("KAPIVARA_DB_PATH", orig)
		}
	}()

	path := DatabasePath()
	if path == "" {
		t.Fatal("expected non-empty database path")
	}
	if !strings.HasSuffix(path, filepath.Join(DBFolder, DBName)) {
		t.Errorf("expected path to end with %s, got %s", filepath.Join(DBFolder, DBName), path)
	}
}

func TestDatabasePath_EnvOverride(t *testing.T) {
	orig := os.Getenv("KAPIVARA_DB_PATH")
	expected := filepath.Join(os.TempDir(), "custom_kapivara.db")
	os.Setenv("KAPIVARA_DB_PATH", expected)
	defer func() {
		if orig != "" {
			os.Setenv("KAPIVARA_DB_PATH", orig)
		} else {
			os.Unsetenv("KAPIVARA_DB_PATH")
		}
	}()

	path := DatabasePath()
	if path != expected {
		t.Errorf("expected %s, got %s", expected, path)
	}
}
