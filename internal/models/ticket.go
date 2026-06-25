package models

import "gorm.io/gorm"

type Ticket struct {
	gorm.Model
	Title string `gorm:"not null"`
	Description string
	Status string `gorm:"default:open"`
	UserID uint
}