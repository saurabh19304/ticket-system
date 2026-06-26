package routes

import (
	"github.com/gin-gonic/gin"

	"ticket-system/internal/handlers"
)

func RegisterRoutes(router *gin.Engine) {
	router.GET("/health", handlers.HealthCheck)

	router.POST("/register", handlers.Register)
}
