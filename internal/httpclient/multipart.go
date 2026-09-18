package httpclient

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/textproto"
	"os"
	"path/filepath"
	"strings"
)

var quoteEscaper = strings.NewReplacer("\\", "\\\\", "\"", "\\\"")

func escapeQuotes(s string) string {
	return quoteEscaper.Replace(s)
}

// buildMultipartBody procesa el JSON de FormDataItem y construye un multipart/form-data.
// Retorna el lector del buffer y la cabecera Content-Type con su boundary correspondiente.
func buildMultipartBody(body string) (io.Reader, string, error) {
	var items []FormDataItem
	if err := json.Unmarshal([]byte(body), &items); err != nil {
		return nil, "", fmt.Errorf("failed to parse form-data body: %w", err)
	}

	bodyBuf := &bytes.Buffer{}
	writer := multipart.NewWriter(bodyBuf)

	for _, item := range items {
		if item.Key == "" || item.IsActive != 1 {
			continue
		}

		if item.Type == "file" {
			if item.Value == "" {
				continue
			}

			file, err := os.Open(item.Value)
			if err != nil {
				return nil, "", fmt.Errorf("failed to open file %s: %w", item.Value, err)
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
				return nil, "", fmt.Errorf("failed to create multipart part: %w", err)
			}

			if _, err := io.Copy(part, file); err != nil {
				file.Close()
				return nil, "", fmt.Errorf("failed to copy file contents: %w", err)
			}
			file.Close()
		} else {
			if err := writer.WriteField(item.Key, item.Value); err != nil {
				return nil, "", fmt.Errorf("failed to write multipart field: %w", err)
			}
		}
	}

	if err := writer.Close(); err != nil {
		return nil, "", fmt.Errorf("failed to close multipart writer: %w", err)
	}

	return bodyBuf, writer.FormDataContentType(), nil
}
