package database

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

// DB envuelve la conexión a la base de datos SQLite.
type DB struct {
	conn *sql.DB
}

// Initialize abre o crea la base de datos SQLite y ejecuta las migraciones correspondientes.
func Initialize(dbPath string) (*DB, error) {
	// Asegurar que el directorio contenedor exista
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create db directory: %w", err)
	}

	conn, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	db := &DB{conn: conn}

	if err := db.migrate(); err != nil {
		conn.Close()
		return nil, fmt.Errorf("migration failed: %w", err)
	}

	return db, nil
}

// Close cierra la conexión a la base de datos.
func (db *DB) Close() error {
	if db.conn != nil {
		return db.conn.Close()
	}
	return nil
}

// Select ejecuta una consulta de lectura SQL y retorna los registros en formato genérico.
func (db *DB) Select(query string, args []interface{}) ([]map[string]interface{}, error) {
	cleanedArgs := cleanArgs(args)
	rows, err := db.conn.Query(query, cleanedArgs...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
		return nil, err
	}

	var results []map[string]interface{}

	for rows.Next() {
		columns := make([]interface{}, len(cols))
		columnPointers := make([]interface{}, len(cols))
		for i := range columns {
			columnPointers[i] = &columns[i]
		}

		if err := rows.Scan(columnPointers...); err != nil {
			return nil, err
		}

		rowMap := make(map[string]interface{})
		for i, colName := range cols {
			val := columns[i]
			// Convertir []byte a string para compatibilidad de tipos con JSON
			if b, ok := val.([]byte); ok {
				rowMap[colName] = string(b)
			} else {
				rowMap[colName] = val
			}
		}
		results = append(results, rowMap)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if results == nil {
		results = []map[string]interface{}{}
	}

	return results, nil
}

// Execute ejecuta una consulta de escritura SQL (INSERT, UPDATE, DELETE).
func (db *DB) Execute(query string, args []interface{}) error {
	cleanedArgs := cleanArgs(args)
	_, err := db.conn.Exec(query, cleanedArgs...)
	return err
}
