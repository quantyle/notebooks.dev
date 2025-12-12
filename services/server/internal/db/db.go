package db

import (
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"server/internal/models"
)

var DB *gorm.DB

func Connect() {
	db, err := gorm.Open(sqlite.Open("notebooks.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to SQLite:", err)
	}

	DB = db

	// Auto-migrate all models
	err = db.AutoMigrate(
		&models.Workspace{},
		&models.Notebook{},
		&models.Page{},
	)

	if err != nil {
		log.Fatal("Failed to run migrations:", err)
	}
}
