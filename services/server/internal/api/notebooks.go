package api

import (
	"net/http"
	"server/internal/db"
	"server/internal/models"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
)

// GetNotebooks godoc
// @Summary List all notebooks
// @Tags notebooks
// @Produce json
// @Success 200 {array} models.Notebook
// @Router /notebooks [get]
func GetNotebooks(c *gin.Context) {
	var notes []models.Notebook
	db.DB.Preload("Pages").Find(&notes)
	c.JSON(http.StatusOK, notes)
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
	var note models.Notebook

	if err := db.DB.Preload("Pages").First(&note, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
		return
	}

	c.JSON(http.StatusOK, note)
}

// CreateNotebook godoc
// @Summary Create a notebook
// @Tags notebooks
// @Accept json
// @Produce json
// @Param notebook body models.Notebook true "Notebook payload"
// @Success 201 {object} models.Notebook
// @Router /notebooks [post]
func CreateNotebook(c *gin.Context) {
	var body struct {
		Title         string   `json:"title"`
		Description   *string  `json:"description"`
		OwnerID       string   `json:"ownerId"`
		WorkspaceID   *string  `json:"workspaceId"`
		Tags          []string `json:"tags"`
		Collaborators []string `json:"collaboratorIds"`
		IsPublic      bool     `json:"isPublic"`
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	note := models.Notebook{
		ID:              GenerateID(),
		Title:           body.Title,
		Description:     body.Description,
		OwnerID:         body.OwnerID,
		WorkspaceID:     body.WorkspaceID,
		Tags:            datatypes.JSON([]byte(JsonArray(body.Tags))),
		CollaboratorIds: datatypes.JSON([]byte(JsonArray(body.Collaborators))),
		IsPublic:        body.IsPublic,
		CreatedAt:       time.Now().UnixMilli(),
		UpdatedAt:       time.Now().UnixMilli(),
	}

	db.DB.Create(&note)
	c.JSON(http.StatusCreated, note)
}
