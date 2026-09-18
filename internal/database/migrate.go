package database

import (
	"embed"
	"fmt"
	"sort"
	"strconv"
	"strings"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

// migrate maneja el sistema de migraciones leyendo de forma secuencial los archivos SQL embebidos.
// Soporta retrocompatibilidad con la tabla _sqlx_migrations de la versión original con Tauri.
func (db *DB) migrate() error {
	// Verificar si ya existe la tabla de migraciones de Tauri (sqlx)
	var useSqlxMigrations bool
	err := db.conn.QueryRow("SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type='table' AND name='_sqlx_migrations')").Scan(&useSqlxMigrations)
	if err != nil {
		return fmt.Errorf("failed to check for _sqlx_migrations: %w", err)
	}

	// Si no existe la tabla de sqlx, creamos la tabla estándar si no existe
	if !useSqlxMigrations {
		_, err := db.conn.Exec(`CREATE TABLE IF NOT EXISTS _migrations (
			version INTEGER PRIMARY KEY,
			applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`)
		if err != nil {
			return fmt.Errorf("failed to create _migrations table: %w", err)
		}
	}

	// Leer los archivos de migración desde el FS embebido
	entries, err := migrationsFS.ReadDir("migrations")
	if err != nil {
		return fmt.Errorf("failed to read embedded migrations directory: %w", err)
	}

	type migrationFile struct {
		version int
		name    string
	}
	var migrations []migrationFile

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".sql") {
			continue
		}
		// Espera nombres con el patrón "1_init.sql", "2_core_tables.sql", etc.
		parts := strings.SplitN(entry.Name(), "_", 2)
		if len(parts) < 2 {
			continue
		}
		version, err := strconv.Atoi(parts[0])
		if err != nil {
			continue
		}
		migrations = append(migrations, migrationFile{version: version, name: entry.Name()})
	}

	// Ordenar las migraciones secuencialmente por versión
	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].version < migrations[j].version
	})

	// Ejecutar las migraciones pendientes en orden
	for _, m := range migrations {
		var exists bool
		if useSqlxMigrations {
			err = db.conn.QueryRow("SELECT EXISTS(SELECT 1 FROM _sqlx_migrations WHERE version = ? AND success = 1)", m.version).Scan(&exists)
		} else {
			err = db.conn.QueryRow("SELECT EXISTS(SELECT 1 FROM _migrations WHERE version = ?)", m.version).Scan(&exists)
		}
		if err != nil {
			return fmt.Errorf("failed to check migration status for version %d: %w", m.version, err)
		}

		if exists {
			continue
		}

		sqlContent, err := migrationsFS.ReadFile("migrations/" + m.name)
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %w", m.name, err)
		}

		tx, err := db.conn.Begin()
		if err != nil {
			return fmt.Errorf("failed to start transaction for migration %d: %w", m.version, err)
		}

		// Ejecutar el script SQL de migración
		if _, err := tx.Exec(string(sqlContent)); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to execute migration %s: %w", m.name, err)
		}

		// Registrar la migración como aplicada
		if useSqlxMigrations {
			// En _sqlx_migrations de sqlx de Rust se guardan valores específicos.
			// Insertamos valores simulados mínimos compatibles para mantener la sincronía si la DB ya existía.
			_, err = tx.Exec("INSERT INTO _sqlx_migrations (version, description, success, checksum, execution_time) VALUES (?, ?, 1, x'', 0)", m.version, m.name)
		} else {
			_, err = tx.Exec("INSERT INTO _migrations (version) VALUES (?)", m.version)
		}
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to record migration %d: %w", m.version, err)
		}

		if err := tx.Commit(); err != nil {
			return fmt.Errorf("failed to commit migration %d: %w", m.version, err)
		}
		fmt.Printf("Migration applied successfully: %s (version %d)\n", m.name, m.version)
	}

	return nil
}
