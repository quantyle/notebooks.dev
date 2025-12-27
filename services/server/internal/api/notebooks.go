package api

import (
	"errors"
	"net/http"
	"server/internal/db"
	"server/internal/dto"
	"server/internal/models"
	"server/internal/util"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetNotebooks godoc
// @Summary List all notebooks
// @Tags notebooks
// @Produce json
// @Success 200 {array} models.Notebook
// @Router /notebooks [get]
func GetNotebooks(c *gin.Context) {
	var notebooks []models.Notebook

	query := db.DB

	// Optional preload to avoid over-fetching
	if c.Query("includePages") == "true" {
		query = query.Preload("Pages")
	}

	if err := query.Find(&notebooks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch notebooks",
		})
		return
	}

	c.JSON(http.StatusOK, notebooks)
}

// GetNotebook godoc
// @Summary Get a notebook by ID
// @Tags notebooks
// @Produce json
// @Param id path string true "Notebook ID"
// @Success 200 {object} models.Notebook
// @Failure 404 {object} map[string]string
// @Router /notebooks/{id} [get]
func GetNotebook(c *gin.Context) {
	id := c.Param("id")
	var notebook models.Notebook

	query := db.DB

	if c.Query("includePages") == "true" {
		query = query.Preload("Pages")
	}

	if err := query.First(&notebook, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "notebook not found"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch notebook",
		})
		return
	}

	c.JSON(http.StatusOK, notebook)
}

// CreateNotebook godoc
// @Summary Create a notebook
// @Tags notebooks
// @Accept json
// @Produce json
// @Param notebook body dto.CreateNotebookRequest true "Create notebook payload"
// @Success 201 {object} models.Notebook
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /notebooks [post]
func CreateNotebook(c *gin.Context) {
	var body dto.CreateNotebookRequest

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// 🔐 OwnerID must come from auth context, not client input
	ownerID := c.GetString("userID")
	if ownerID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "unauthorized",
		})
		return
	}

	// Validate workspace existence if provided
	if body.WorkspaceID != nil {
		var ws models.Workspace
		if err := db.DB.First(&ws, "id = ?", *body.WorkspaceID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "workspaceId does not exist",
				})
				return
			}

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "failed to validate workspace",
			})
			return
		}
	}

	notebook := models.Notebook{
		ID:              util.GenerateID(),
		Title:           body.Title,
		Description:     body.Description,
		OwnerID:         ownerID,
		WorkspaceID:     body.WorkspaceID,
		Tags:            body.Tags,            // let GORM marshal JSON
		CollaboratorIDs: body.CollaboratorIDs, // proper Go naming
		IsPublic:        body.IsPublic,
	}

	if err := db.DB.Create(&notebook).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create notebook",
		})
		return
	}

	c.JSON(http.StatusCreated, notebook)
}
