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
	protected.GET("/tickets", handlers.GetTickets)
  protected.GET("/tickets/:id",  handlers.GetTicket)
  protected.PUT("/tickets/:id", handlers.UpdateTicket)
  protected.DELETE("/tickets/:id", handlers.DeleteTicket)
}