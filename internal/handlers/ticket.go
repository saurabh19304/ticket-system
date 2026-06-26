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
		Title:       req.Title,
		Description: req.Description,
		Status:      "open",
		UserID:      userID,
	}

	if err := database.DB.Create(&ticket).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create ticket",
		})
		return
	}

	c.JSON(http.StatusCreated, ticket)

}

func GetTickets(c *gin.Context) {

	var tickets []models.Ticket

	userID := c.GetUint("userID")

	if err := database.DB.Where("user_id = ?", userID).Find(&tickets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch tickets",
		})
		return
	}

	c.JSON(http.StatusOK, tickets)
}

func GetTicket(c *gin.Context) {

	var ticket models.Ticket

	userID := c.GetUint("userID")

	if err := database.DB.Where("id = ? AND user_id = ?", c.Param("id"), userID).First(&ticket).Error; err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "Ticket not found",
		})
		return
	}

	c.JSON(http.StatusOK, ticket)
}

func UpdateTicketStatus(c *gin.Context) {

	var ticket models.Ticket
	var req dto.UpdateStatusRequest

	userID := c.GetUint("userID")

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	if err := database.DB.
		Where("id = ? AND user_id = ?", c.Param("id"), userID).
		First(&ticket).Error; err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "Ticket not found",
		})
		return
	}

	switch ticket.Status {

	case "open":
		if req.Status != "in_progress" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Ticket can only move from open to in_progress",
			})
			return
		}

	case "in_progress":
		if req.Status != "closed" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Ticket can only move from in_progress to closed",
			})
			return
		}

	case "closed":
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Closed ticket cannot be reopened",
		})
		return
	}

	ticket.Status = req.Status

	if err := database.DB.Save(&ticket).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update ticket",
		})
		return
	}

	c.JSON(http.StatusOK, ticket)
}

func DeleteTicket(c *gin.Context) {

	var ticket models.Ticket

	userID := c.GetUint("userID")

	if err := database.DB.Where("id = ? AND user_id = ?", c.Param("id"), userID).First(&ticket).Error; err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "Ticket not found",
		})
		return
	}

	if err := database.DB.Delete(&ticket).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete ticket",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Ticket deleted successfully",
	})
}
