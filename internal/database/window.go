package database

import (
	"strconv"
)

// WindowBounds contiene las dimensiones y posición de la ventana.
type WindowBounds struct {
	Width   int
	Height  int
	X       int
	Y       int
	HasSize bool
	HasPos  bool
}

// GetWindowBounds recupera el tamaño y la posición de la ventana guardados en la base de datos.
func (db *DB) GetWindowBounds(minWidth, minHeight int) (*WindowBounds, error) {
	bounds := &WindowBounds{}

	wStr, err := db.GetSetting("window_width")
	if err != nil {
		return nil, err
	}
	hStr, err := db.GetSetting("window_height")
	if err != nil {
		return nil, err
	}

	if wStr != "" && hStr != "" {
		if w, err := strconv.Atoi(wStr); err == nil {
			if h, err := strconv.Atoi(hStr); err == nil {
				if w >= minWidth && h >= minHeight {
					bounds.Width = w
					bounds.Height = h
					bounds.HasSize = true
				}
			}
		}
	}

	xStr, err := db.GetSetting("window_x")
	if err != nil {
		return nil, err
	}
	yStr, err := db.GetSetting("window_y")
	if err != nil {
		return nil, err
	}

	if xStr != "" && yStr != "" {
		if x, err := strconv.Atoi(xStr); err == nil {
			if y, err := strconv.Atoi(yStr); err == nil {
				bounds.X = x
				bounds.Y = y
				bounds.HasPos = true
			}
		}
	}

	return bounds, nil
}

// SaveWindowBounds persiste las dimensiones y la posición actuales de la ventana.
func (db *DB) SaveWindowBounds(width, height, x, y int) error {
	if err := db.SaveSetting("window_width", strconv.Itoa(width)); err != nil {
		return err
	}
	if err := db.SaveSetting("window_height", strconv.Itoa(height)); err != nil {
		return err
	}
	if err := db.SaveSetting("window_x", strconv.Itoa(x)); err != nil {
		return err
	}
	return db.SaveSetting("window_y", strconv.Itoa(y))
}
