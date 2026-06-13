package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strconv"

	"kapivara/database"
	"kapivara/httpclient"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
	db  *database.DB
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Obtener el directorio de configuración del usuario
	configDir, err := os.UserConfigDir()
	if err != nil {
		configDir = "."
	}
	dbPath := filepath.Join(configDir, "Kapivara", "kapivara.db")

	fmt.Printf("Initializing database at: %s\n", dbPath)
	db, err := database.Initialize(dbPath)
	if err != nil {
		fmt.Printf("Error initializing database: %v\n", err)
		return
	}
	a.db = db
}

// domReady is called when the frontend DOM is ready.
func (a *App) domReady(ctx context.Context) {
	if a.db != nil {
		// Restablecer posición y tamaño de la ventana desde la DB
		widthStr, _ := a.db.GetSetting("window_width")
		heightStr, _ := a.db.GetSetting("window_height")
		xStr, _ := a.db.GetSetting("window_x")
		yStr, _ := a.db.GetSetting("window_y")

		if widthStr != "" && heightStr != "" {
			w, _ := strconv.Atoi(widthStr)
			h, _ := strconv.Atoi(heightStr)
			if w >= 960 && h >= 640 { // Validar tamaños mínimos para no romper la UI
				runtime.WindowSetSize(ctx, w, h)
			}
		}

		if xStr != "" && yStr != "" {
			x, _ := strconv.Atoi(xStr)
			y, _ := strconv.Atoi(yStr)
			runtime.WindowSetPosition(ctx, x, y)
		}
	}

	runtime.WindowShow(ctx)
}

// shutdown is called when the app is closing.
func (a *App) shutdown(ctx context.Context) {
	if a.db != nil {
		// Obtener tamaño y posición actual de la ventana
		w, h := runtime.WindowGetSize(ctx)
		x, y := runtime.WindowGetPosition(ctx)

		// Guardar en la DB
		_ = a.db.SaveSetting("window_width", strconv.Itoa(w))
		_ = a.db.SaveSetting("window_height", strconv.Itoa(h))
		_ = a.db.SaveSetting("window_x", strconv.Itoa(x))
		_ = a.db.SaveSetting("window_y", strconv.Itoa(y))

		fmt.Println("Closing database connection...")
		a.db.Close()
	}
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// DBSelect ejecuta una consulta de selección en la base de datos.
func (a *App) DBSelect(query string, args []interface{}) ([]map[string]interface{}, error) {
	if a.db == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	return a.db.Select(query, args)
}

// DBExecute ejecuta una consulta de escritura en la base de datos.
func (a *App) DBExecute(query string, args []interface{}) error {
	if a.db == nil {
		return fmt.Errorf("database not initialized")
	}
	return a.db.Execute(query, args)
}

// MakeHttpRequest realiza una petición HTTP y devuelve la respuesta formateada al frontend.
func (a *App) MakeHttpRequest(method string, url string, headers map[string]string, body string, bodyType string) (*httpclient.HttpResponse, error) {
	return httpclient.MakeRequest(method, url, headers, body, bodyType)
}

// OpenFileDialog abre el selector nativo de archivos y retorna la ruta del archivo seleccionado.
func (a *App) OpenFileDialog() (string, error) {
	return runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select File",
	})
}



