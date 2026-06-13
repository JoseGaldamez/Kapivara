package httpclient

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/textproto"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// HttpResponse representa la respuesta HTTP formateada para el frontend
type HttpResponse struct {
	Status     int               `json:"status"`
	StatusText string            `json:"status_text"`
	Headers    map[string]string `json:"headers"`
	Body       string            `json:"body"`
	TimeMs     int64             `json:"time_ms"`
}

// FormDataItem representa un elemento individual del cuerpo multipart/form-data
type FormDataItem struct {
	Key      string `json:"key"`
	Value    string `json:"value"`
	Type     string `json:"type"` // "text" | "file"
	IsActive int    `json:"is_active"`
}

var defaultClient = &http.Client{
	Timeout: 30 * time.Second,
}

var quoteEscaper = strings.NewReplacer("\\", "\\\\", "\"", "\\\"")

func escapeQuotes(s string) string {
	return quoteEscaper.Replace(s)
}

// detectMimeType infiere el tipo de contenido basándose en la extensión del archivo.
func detectMimeType(filePath string) string {
	ext := strings.ToLower(filepath.Ext(filePath))
	switch ext {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".gif":
		return "image/gif"
	case ".webp":
		return "image/webp"
	case ".svg":
		return "image/svg+xml"
	case ".pdf":
		return "application/pdf"
	case ".mp4":
		return "video/mp4"
	case ".mov":
		return "video/quicktime"
	case ".mp3":
		return "audio/mpeg"
	case ".json":
		return "application/json"
	case ".txt":
		return "text/plain"
	case ".csv":
		return "text/csv"
	case ".zip":
		return "application/zip"
	default:
		return "application/octet-stream"
	}
}

// MakeRequest realiza una petición HTTP basándose en el método, url, headers y cuerpo especificados.
func MakeRequest(method string, urlStr string, headers map[string]string, body string, bodyType string) (*HttpResponse, error) {
	var bodyReader io.Reader
	var contentType string

	if body != "" {
		if bodyType == "form-data" {
			var items []FormDataItem
			if err := json.Unmarshal([]byte(body), &items); err != nil {
				return nil, fmt.Errorf("failed to parse form-data body: %w", err)
			}

			bodyBuf := &bytes.Buffer{}
			writer := multipart.NewWriter(bodyBuf)

			for _, item := range items {
				if item.Key == "" {
					continue
				}
				if item.IsActive != 1 {
					continue
				}

				if item.Type == "file" {
					if item.Value == "" {
						continue
					}

					file, err := os.Open(item.Value)
					if err != nil {
						return nil, fmt.Errorf("failed to open file %s: %w", item.Value, err)
					}

					fileName := filepath.Base(item.Value)
					mimeType := detectMimeType(item.Value)

					// Crear la parte multipart con una cabecera personalizada para definir el Content-Type
					h := make(textproto.MIMEHeader)
					h.Set("Content-Disposition", fmt.Sprintf(`form-data; name="%s"; filename="%s"`, escapeQuotes(item.Key), escapeQuotes(fileName)))
					h.Set("Content-Type", mimeType)

					part, err := writer.CreatePart(h)
					if err != nil {
						file.Close()
						return nil, fmt.Errorf("failed to create multipart part: %w", err)
					}

					if _, err := io.Copy(part, file); err != nil {
						file.Close()
						return nil, fmt.Errorf("failed to copy file contents: %w", err)
					}
					file.Close()
				} else {
					if err := writer.WriteField(item.Key, item.Value); err != nil {
						return nil, fmt.Errorf("failed to write multipart field: %w", err)
					}
				}
			}

			if err := writer.Close(); err != nil {
				return nil, fmt.Errorf("failed to close multipart writer: %w", err)
			}

			bodyReader = bodyBuf
			contentType = writer.FormDataContentType()
		} else {
			bodyReader = strings.NewReader(body)
		}
	}

	req, err := http.NewRequest(strings.ToUpper(method), urlStr, bodyReader)
	if err != nil {
		return nil, fmt.Errorf("failed to create HTTP request: %w", err)
	}

	// Cargar cabeceras en la petición
	for k, v := range headers {
		// En form-data, omitir cabeceras de Content-Type manuales para no alterar el boundary generado
		if bodyType == "form-data" && strings.EqualFold(k, "content-type") {
			continue
		}
		req.Header.Set(k, v)
	}

	// Configurar el Content-Type generado para multipart
	if bodyType == "form-data" && contentType != "" {
		req.Header.Set("Content-Type", contentType)
	}

	// Ejecutar petición midiendo tiempo
	start := time.Now()
	resp, err := defaultClient.Do(req)
	if err != nil {
		return nil, err // Retornamos el error crudo para que pueda identificarse como error de conexión
	}
	defer resp.Body.Close()

	timeMs := time.Since(start).Milliseconds()

	// Leer cuerpo de respuesta
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	// Procesar cabeceras de respuesta
	respHeaders := make(map[string]string)
	for k, values := range resp.Header {
		respHeaders[k] = strings.Join(values, ", ")
	}

	// Extraer el texto de estado (canonical text o el enviado por el servidor)
	statusText := strings.TrimSpace(strings.TrimPrefix(resp.Status, strconv.Itoa(resp.StatusCode)))

	return &HttpResponse{
		Status:     resp.StatusCode,
		StatusText: statusText,
		Headers:    respHeaders,
		Body:       string(bodyBytes),
		TimeMs:     timeMs,
	}, nil
}
