package database

import (
	"os"
	"path/filepath"
	"testing"
)

func TestInitializeAndMigrations(t *testing.T) {
	// Crear un directorio temporal para la base de datos de pruebas
	tempDir, err := os.MkdirTemp("", "kapivara_db_test_*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	dbPath := filepath.Join(tempDir, "test_kapivara.db")

	// Inicializar base de datos (debería ejecutar las 7 migraciones de forma secuencial)
	db, err := Initialize(dbPath)
	if err != nil {
		t.Fatalf("failed to initialize db: %v", err)
	}
	defer db.Close()

	// Comprobar que la tabla de settings existe y contiene los valores predeterminados de la migración 3
	results, err := db.Select("SELECT key, value FROM settings WHERE key = ?", []interface{}{"theme"})
	if err != nil {
		t.Fatalf("failed to query settings: %v", err)
	}

	if len(results) != 1 {
		t.Fatalf("expected 1 result, got %d", len(results))
	}

	themeVal := results[0]["value"]
	if themeVal != "auto" {
		t.Errorf("expected theme to be 'auto', got '%v'", themeVal)
	}

	// Probar inserción con Execute en la tabla de proyectos (migración 1)
	err = db.Execute("INSERT INTO projects (uid, name) VALUES (?, ?)", []interface{}{"proj-123", "Test Project"})
	if err != nil {
		t.Fatalf("failed to insert project: %v", err)
	}

	// Verificar la inserción con Select
	projResults, err := db.Select("SELECT name FROM projects WHERE uid = ?", []interface{}{"proj-123"})
	if err != nil {
		t.Fatalf("failed to query projects: %v", err)
	}

	if len(projResults) != 1 {
		t.Fatalf("expected 1 project result, got %d", len(projResults))
	}

	projName := projResults[0]["name"]
	if projName != "Test Project" {
		t.Errorf("expected project name to be 'Test Project', got '%v'", projName)
	}

	// Probar inserción con mapa en Execute (debe ser serializado automáticamente a JSON)
	err = db.Execute("INSERT INTO requests (id, project_id, name, method, url) VALUES (?, ?, ?, ?, ?)", []interface{}{"req-1", "proj-123", "Get User", "GET", "https://api.example.com"})
	if err != nil {
		t.Fatalf("failed to insert request: %v", err)
	}

	authDataMap := map[string]interface{}{"token": "secret-jwt-token"}
	err = db.Execute("INSERT INTO request_auth (id, request_id, auth_type, auth_data) VALUES (?, ?, ?, ?)", []interface{}{"auth-1", "req-1", "bearer", authDataMap})
	if err != nil {
		t.Fatalf("failed to insert request_auth with map: %v", err)
	}

	authResults, err := db.Select("SELECT auth_type, auth_data FROM request_auth WHERE request_id = ?", []interface{}{"req-1"})
	if err != nil {
		t.Fatalf("failed to query request_auth: %v", err)
	}
	if len(authResults) != 1 {
		t.Fatalf("expected 1 auth result, got %d", len(authResults))
	}
	if authResults[0]["auth_type"] != "bearer" {
		t.Errorf("expected auth_type 'bearer', got '%v'", authResults[0]["auth_type"])
	}
	if authResults[0]["auth_data"] != `{"token":"secret-jwt-token"}` {
		t.Errorf("expected auth_data '{\"token\":\"secret-jwt-token\"}', got '%v'", authResults[0]["auth_data"])
	}
}
