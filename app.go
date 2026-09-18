package main

import (
	"context"
	"fmt"

	"kapivara/internal/config"
	"kapivara/internal/database"
	"kapivara/internal/httpclient"

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

	dbPath := config.DatabasePath()
	fmt.Printf("[%s] Initializing database at: %s\n", config.AppTitle, dbPath)
	db, err := database.Initialize(dbPath)
	if err != nil {
		fmt.Printf("Error initializing database: %v\n", err)
		return
	}
	a.db = db
}

// domReady is called when the frontend DOM is ready.
func (a *App) domReady(ctx context.Context) {
	runtime.WindowSetTitle(ctx, config.AppTitle)

	if a.db != nil {
		bounds, err := a.db.GetWindowBounds(config.MinWidth, config.MinHeight)
		if err == nil {
			if bounds.HasSize {
				runtime.WindowSetSize(ctx, bounds.Width, bounds.Height)
			}
			if bounds.HasPos {
				runtime.WindowSetPosition(ctx, bounds.X, bounds.Y)
			}
		}
	}

	runtime.WindowShow(ctx)
}

// beforeClose is called when the window is about to close.
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("Recovered from panic in beforeClose: %v\n", r)
		}
	}()

	if a.db != nil {
		w, h := runtime.WindowGetSize(ctx)
		x, y := runtime.WindowGetPosition(ctx)
		_ = a.db.SaveWindowBounds(w, h, x, y)
	}
	return false
}

// shutdown is called when the app is closing.
func (a *App) shutdown(ctx context.Context) {
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("Recovered from panic in shutdown: %v\n", r)
		}
	}()

	if a.db != nil {
		fmt.Println("Closing database connection...")
		a.db.Close()
	}
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
