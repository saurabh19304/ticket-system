//connect to SQLite
//Expose the database connection
//Create/Update table (autoMigrate)

//for this project I will use the log.Fatal to keep things simple instead we can use the Panic() also

package database

import (
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"log"

	"ticket-system/internal/models"
)

var DB *gorm.DB

func ConnectDatabase() {

	db, err := gorm.Open(
		sqlite.Open("ticket.db"),
		&gorm.Config{},
	)

	if err != nil {
		log.Fatal("Failed connection to the database:", err)
	}

	DB = db

	//migration can fail sometime , so this handles the error in golang for the migration
	if err := DB.AutoMigrate(
		&models.User{},
		&models.Ticket{},
	); err != nil {
		log.Fatal("Failed to migrate the Database:", err)
	}

}
