package models

import (
	"time"

	"gorm.io/gorm"
)

type Task struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	Title       string         `gorm:"not null" json:"title"`
	Description string         `json:"description"`
	Completed   bool           `gorm:"default:false" json:"completed"`
	Priority    string         `gorm:"default:'medium'" json:"priority"` // low, medium, high
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(&Task{})
}
