package routes

import (
	"github.com/gin-gonic/gin"

	"ticket-system/internal/handlers"
	"ticket-system/internal/middleware"
)

func RegisterRoutes(router *gin.Engine) {


	router.GET("/", func(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Ticket Management API is running",
		"health": "/health",
	})
})

	router.GET("/health", handlers.HealthCheck)
	router.POST("/auth/register", handlers.Register)
	router.POST("/auth/login", handlers.Login)

	protected := router.Group("/")
	protected.Use(middleware.AuthMiddleware())

	protected.POST("/tickets", handlers.CreateTicket)
	protected.GET("/tickets", handlers.GetTickets)
	protected.GET("/tickets/:id", handlers.GetTicket)
	protected.PATCH("/tickets/:id/status", handlers.UpdateTicketStatus)
	protected.DELETE("/tickets/:id", handlers.DeleteTicket)
}
