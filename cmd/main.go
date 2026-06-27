package main

import (
	"github.com/gin-gonic/gin"
	"ticket-system/internal/database"
	"ticket-system/internal/middleware"
	"ticket-system/internal/routes"
)

func main() {
	database.ConnectDatabase()

	router := gin.Default()

	router.Use(middleware.CORSMiddleware())

	routes.RegisterRoutes(router)

	router.Run(":8080")
}
