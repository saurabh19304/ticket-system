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

func UpdateTicket(c *gin.Context) {

	var ticket models.Ticket
	var req dto.UpdateTicketRequest

	userID := c.GetUint("userID")

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	if err := database.DB.Where("id = ? AND user_id = ?", c.Param("id"), userID).First(&ticket).Error; err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "Ticket not found",
		})
		return
	}

	if req.Title != "" {
		ticket.Title = req.Title
	}

	if req.Description != "" {
		ticket.Description = req.Description
	}

	if req.Status != "" {
		ticket.Status = req.Status
	}

	if err := database.DB.Save(&ticket).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update ticket",
		})
		return
	}

	c.JSON(http.StatusOK, ticket)
}