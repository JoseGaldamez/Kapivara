package database

import (
	"fmt"
)

// GetSetting obtiene el valor de una configuración por su clave en la base de datos.
func (db *DB) GetSetting(key string) (string, error) {
	if db.conn == nil {
		return "", fmt.Errorf("database connection not initialized")
	}
	res, err := db.Select("SELECT value FROM settings WHERE key = ?", []interface{}{key})
	if err != nil {
		return "", err
	}
	if len(res) == 0 {
		return "", nil
	}
	val, ok := res[0]["value"].(string)
	if !ok {
		return "", nil
	}
	return val, nil
}

// SaveSetting inserta o actualiza el valor de una configuración por su clave en la base de datos.
func (db *DB) SaveSetting(key, value string) error {
	if db.conn == nil {
		return fmt.Errorf("database connection not initialized")
	}
	return db.Execute("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)", []interface{}{key, value})
}
