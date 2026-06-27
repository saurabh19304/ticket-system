package routes

import (
	"github.com/gin-gonic/gin"

	"ticket-system/internal/handlers"
	"ticket-system/internal/middleware"
)

func RegisterRoutes(router *gin.Engine) {


	router.StaticFile("/", "./frontend/index.html")
	router.StaticFile("/app.js", "./frontend/app.js")
	router.StaticFile("/logo.png", "./frontend/logo.png")

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
