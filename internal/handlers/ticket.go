package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"ticket-system/internal/database"
	"ticket-system/internal/dto"
	"ticket-system/internal/models"
)


func CreateTicket(c *gin.Context) {


	var req dto.CreateTicketRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
return
	}

	userID := c.GetUint("userID")

	ticket := models.Ticket{
		Title: req.Title,
		Description: req.Description,
		Status: "open",
		UserID: userID,
	}

	if err := database.DB.Create(&ticket).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create ticket",
		})
		return
	}

	c.JSON(http.StatusCreated, ticket)


}