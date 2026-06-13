package httpclient

import (
	"encoding/json"
	"io"
	"mime"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestMakeRequest_Get(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "GET" {
			t.Errorf("Expected method GET, got %s", r.Method)
		}
		if r.Header.Get("X-Custom-Header") != "CustomValue" {
			t.Errorf("Expected X-Custom-Header to be CustomValue, got %s", r.Header.Get("X-Custom-Header"))
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success": true}`))
	}))
	defer server.Close()

	headers := map[string]string{
		"X-Custom-Header": "CustomValue",
	}

	resp, err := MakeRequest("GET", server.URL, headers, "", "")
	if err != nil {
		t.Fatalf("MakeRequest failed: %v", err)
	}

	if resp.Status != 200 {
		t.Errorf("Expected status 200, got %d", resp.Status)
	}
	if resp.StatusText != "OK" {
		t.Errorf("Expected StatusText 'OK', got '%s'", resp.StatusText)
	}
	if !strings.Contains(resp.Headers["Content-Type"], "application/json") {
		t.Errorf("Expected Content-Type header to contain application/json, got %s", resp.Headers["Content-Type"])
	}
	if resp.Body != `{"success": true}` {
		t.Errorf("Expected body to be '{\"success\": true}', got '%s'", resp.Body)
	}
	if resp.TimeMs < 0 {
		t.Errorf("Expected response time to be non-negative, got %d", resp.TimeMs)
	}
}

func TestMakeRequest_PostRaw(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			t.Errorf("Expected method POST, got %s", r.Method)
		}
		bodyBytes, err := io.ReadAll(r.Body)
		if err != nil {
			t.Fatalf("Failed to read request body: %v", err)
		}
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusCreated)
		w.Write(bodyBytes)
	}))
	defer server.Close()

	body := `{"hello": "world"}`
	resp, err := MakeRequest("POST", server.URL, nil, body, "json")
	if err != nil {
		t.Fatalf("MakeRequest failed: %v", err)
	}

	if resp.Status != 201 {
		t.Errorf("Expected status 201, got %d", resp.Status)
	}
	if resp.Body != body {
		t.Errorf("Expected body to echo request, got '%s'", resp.Body)
	}
}

func TestMakeRequest_PostFormUrlEncoded(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			t.Errorf("Expected method POST, got %s", r.Method)
		}
		if r.Header.Get("Content-Type") != "application/x-www-form-urlencoded" {
			t.Errorf("Expected application/x-www-form-urlencoded Content-Type, got %s", r.Header.Get("Content-Type"))
		}
		r.ParseForm()
		val := r.FormValue("name")
		if val != "kapivara" {
			t.Errorf("Expected name=kapivara, got %s", val)
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	}))
	defer server.Close()

	body := "name=kapivara"
	headers := map[string]string{
		"Content-Type": "application/x-www-form-urlencoded",
	}
	resp, err := MakeRequest("POST", server.URL, headers, body, "x-www-form-urlencoded")
	if err != nil {
		t.Fatalf("MakeRequest failed: %v", err)
	}

	if resp.Status != 200 {
		t.Errorf("Expected status 200, got %d", resp.Status)
	}
	if resp.Body != "ok" {
		t.Errorf("Expected body 'ok', got '%s'", resp.Body)
	}
}

func TestMakeRequest_PostMultipartFormData(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		mediaType, params, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
		if err != nil {
			t.Fatalf("Failed to parse content type: %v", err)
		}
		if mediaType != "multipart/form-data" {
			t.Errorf("Expected multipart/form-data content type, got %s", mediaType)
		}

		reader := multipart.NewReader(r.Body, params["boundary"])

		// Parse text field
		part, err := reader.NextPart()
		if err != nil {
			t.Fatalf("Failed to read part: %v", err)
		}
		if part.FormName() != "description" {
			t.Errorf("Expected FormName 'description', got %s", part.FormName())
		}
		descBytes, _ := io.ReadAll(part)
		if string(descBytes) != "nice capybara" {
			t.Errorf("Expected description 'nice capybara', got %s", string(descBytes))
		}

		// Parse file field
		part, err = reader.NextPart()
		if err != nil {
			t.Fatalf("Failed to read part: %v", err)
		}
		if part.FormName() != "my_file" {
			t.Errorf("Expected FormName 'my_file', got %s", part.FormName())
		}
		if part.FileName() != "test.txt" {
			t.Errorf("Expected FileName 'test.txt', got %s", part.FileName())
		}
		if part.Header.Get("Content-Type") != "text/plain" {
			t.Errorf("Expected Content-Type 'text/plain', got %s", part.Header.Get("Content-Type"))
		}
		fileBytes, _ := io.ReadAll(part)
		if string(fileBytes) != "hello from file" {
			t.Errorf("Expected file contents 'hello from file', got %s", string(fileBytes))
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("multipart ok"))
	}))
	defer server.Close()

	// Crear un archivo temporal para simular la subida de un archivo
	tempDir, err := os.MkdirTemp("", "multipart_test_*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)
	filePath := filepath.Join(tempDir, "test.txt")
	err = os.WriteFile(filePath, []byte("hello from file"), 0644)
	if err != nil {
		t.Fatalf("failed to write test file: %v", err)
	}

	formDataItems := []FormDataItem{
		{Key: "description", Value: "nice capybara", Type: "text", IsActive: 1},
		{Key: "my_file", Value: filePath, Type: "file", IsActive: 1},
		{Key: "skipped_field", Value: "ignore me", Type: "text", IsActive: 0},
		{Key: "", Value: "ignore me", Type: "text", IsActive: 1},
	}

	bodyBytes, _ := json.Marshal(formDataItems)
	resp, err := MakeRequest("POST", server.URL, nil, string(bodyBytes), "form-data")
	if err != nil {
		t.Fatalf("MakeRequest failed: %v", err)
	}

	if resp.Status != 200 {
		t.Errorf("Expected status 200, got %d", resp.Status)
	}
	if resp.Body != "multipart ok" {
		t.Errorf("Expected body 'multipart ok', got '%s'", resp.Body)
	}
}

func TestMakeRequest_Error(t *testing.T) {
	_, err := MakeRequest("GET", "http://localhost:54321/non-existent-page-url-error", nil, "", "")
	if err == nil {
		t.Error("Expected error for connection refused, got nil")
	}
}
