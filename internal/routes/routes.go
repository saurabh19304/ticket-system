package routes

import (
	"github.com/gin-gonic/gin"

	"ticket-system/internal/handlers"
	"ticket-system/internal/middleware"
)

func RegisterRoutes(router *gin.Engine) {

	
	router.GET("/health", handlers.HealthCheck)
	router.POST("/register", handlers.Register)
	router.POST("/login", handlers.Login)

	
	protected := router.Group("/")
	protected.Use(middleware.AuthMiddleware())

	protected.POST("/tickets", handlers.CreateTicket)
}