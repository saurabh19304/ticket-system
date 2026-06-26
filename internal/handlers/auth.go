package handlers

import (
	"net/http"

	"golang.org/x/crypto/bcrypt"

	"github.com/gin-gonic/gin"

	"ticket-system/internal/database"
	"ticket-system/internal/dto"
	"ticket-system/internal/models"
)


func Register(c *gin.Context) {

	var req dto.RegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
}

hashedPassword, err := bcrypt.GenerateFromPassword(
	[]byte(req.Password), 
	bcrypt.DefaultCost,
)

if err != nil {
	c.JSON(http.StatusInternalServerError, gin.H{
		"error": "Failed to hash password",
	})
	return
}

user := models.User{
	Email: req.Email,
	Password: string(hashedPassword),
}

if err := database.DB.Create(&user).Error; err != nil {
	c.JSON(http.StatusBadRequest, gin.H{
		"error": "user alreafdy exists",
	})
	return
}

c.JSON(http.StatusCreated, gin.H{
	"message": "User registered successfully",
})


}