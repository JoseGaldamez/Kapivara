package httpclient

import (
	"encoding/base64"
	"fmt"
	"io"
	"mime"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// HttpResponse representa la respuesta HTTP formateada para el frontend
type HttpResponse struct {
	Status       int               `json:"status"`
	StatusText   string            `json:"status_text"`
	Headers      map[string]string `json:"headers"`
	Body         string            `json:"body"`
	BodyEncoding string            `json:"body_encoding"`
	ContentType  string            `json:"content_type"`
	ResponseURL  string            `json:"response_url"`
	SizeBytes    int64             `json:"size_bytes"`
	TimeMs       int64             `json:"time_ms"`
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

// MakeRequest realiza una petición HTTP basándose en el método, url, headers y cuerpo especificados.
func MakeRequest(method string, urlStr string, headers map[string]string, body string, bodyType string) (*HttpResponse, error) {
	var bodyReader io.Reader
	var contentType string

	if body != "" {
		if bodyType == "form-data" {
			reader, ct, err := buildMultipartBody(body)
			if err != nil {
				return nil, err
			}
			bodyReader = reader
			contentType = ct
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

	// Si no se proporcionó Content-Type en las cabeceras, asignar el por defecto según bodyType
	if req.Header.Get("Content-Type") == "" {
		switch bodyType {
		case "json":
			req.Header.Set("Content-Type", "application/json")
		case "x-www-form-urlencoded":
			req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		}
	}

	// Ejecutar petición midiendo tiempo
	start := time.Now()
	resp, err := defaultClient.Do(req)
	if err != nil {
		return nil, err // Retornamos el error crudo para que pueda identificarse como error de conexión
	}
	defer resp.Body.Close()

	// Leer cuerpo de respuesta
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}
	timeMs := time.Since(start).Milliseconds()

	responseType, _, _ := mime.ParseMediaType(resp.Header.Get("Content-Type"))
	if responseType == "" || responseType == "application/octet-stream" {
		responseType = http.DetectContentType(bodyBytes)
	}
	responseType = strings.ToLower(responseType)
	isMedia := strings.HasPrefix(responseType, "image/") || strings.HasPrefix(responseType, "video/") || responseType == "application/pdf"
	responseBody := string(bodyBytes)
	encoding := "text"
	if isMedia {
		responseBody = base64.StdEncoding.EncodeToString(bodyBytes)
		encoding = "base64"
	}

	// Procesar cabeceras de respuesta
	respHeaders := make(map[string]string)
	for k, values := range resp.Header {
		respHeaders[k] = strings.Join(values, ", ")
	}

	// Extraer el texto de estado (canonical text o el enviado por el servidor)
	statusText := strings.TrimSpace(strings.TrimPrefix(resp.Status, strconv.Itoa(resp.StatusCode)))

	return &HttpResponse{
		Status:       resp.StatusCode,
		StatusText:   statusText,
		Headers:      respHeaders,
		Body:         responseBody,
		BodyEncoding: encoding,
		ContentType:  responseType,
		ResponseURL:  resp.Request.URL.String(),
		SizeBytes:    int64(len(bodyBytes)),
		TimeMs:       timeMs,
	}, nil
}
