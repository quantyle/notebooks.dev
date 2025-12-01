package api

import (
	"net/http"
	"server/internal/db"
	"server/internal/models"
	"time"

	"github.com/gin-gonic/gin"
)

// GetCategories godoc
// @Summary List categories
// @Tags categories
// @Produce json
// @Success 200 {array} models.Category
// @Router /categories [get]
func GetCategories(c *gin.Context) {
	var cats []models.Category
	db.DB.Find(&cats)
	c.JSON(http.StatusOK, cats)
}

// CreateCategory godoc
// @Summary Create a category
// @Tags categories
// @Accept json
// @Produce json
// @Param category body models.Category true "Category payload"
// @Success 201 {object} models.Category
// @Router /categories [post]
func CreateCategory(c *gin.Context) {
	var body struct {
		Name        string  `json:"name"`
		Description *string `json:"description"`
		Color       *string `json:"color"`
		WorkspaceID string  `json:"workspaceId"`
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	category := models.Category{
		ID:          GenerateID(),
		Name:        body.Name,
		Description: body.Description,
		Color:       body.Color,
		WorkspaceID: body.WorkspaceID,
		CreatedAt:   time.Now().UnixMilli(),
		UpdatedAt:   time.Now().UnixMilli(),
	}

	db.DB.Create(&category)
	c.JSON(http.StatusCreated, category)
}
