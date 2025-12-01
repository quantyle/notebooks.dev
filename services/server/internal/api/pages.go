package api

import (
	"encoding/json"
	"net/http"
	"time"

	"server/internal/db"
	"server/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GetAllPages godoc
// @Summary Get all pages
// @Description Returns all pages from all notebooks
// @Tags pages
// @Produce json
// @Success 200 {array} models.Page
// @Router /pages [get]
func GetAllPages(c *gin.Context) {
	var pages []models.Page
	db.DB.Find(&pages)
	c.JSON(http.StatusOK, pages)
}

// GetPage godoc
// @Summary Get a page by ID
// @Description Returns a single page by its ID
// @Tags pages
// @Produce json
// @Param id path string true "Page ID"
// @Success 200 {object} models.Page
// @Failure 404 {object} map[string]string
// @Router /pages/{id} [get]
func GetPage(c *gin.Context) {
	id := c.Param("id")

	var page models.Page
	result := db.DB.First(&page, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Page not found"})
		return
	}

	c.JSON(http.StatusOK, page)
}

// GetPagesByNotebook godoc
// @Summary Get pages from a notebook
// @Description Returns all pages for a given notebook ID
// @Tags pages
// @Produce json
// @Param id path string true "Notebook ID"
// @Success 200 {array} models.Page
// @Router /notebooks/{id}/pages [get]
func GetPagesByNotebook(c *gin.Context) {
	notebookId := c.Param("id")

	var pages []models.Page
	db.DB.Where("notebook_id = ?", notebookId).Order("`order` ASC").Find(&pages)

	c.JSON(http.StatusOK, pages)
}

// CreatePage godoc
// @Summary Create a page in a notebook
// @Description Creates a new page belonging to a notebook
// @Tags pages
// @Accept json
// @Produce json
// @Param id path string true "Notebook ID"
// @Param page body object true "Page payload"
// @Success 201 {object} models.Page
// @Failure 400 {object} map[string]string
// @Router /notebooks/{id}/pages [post]
func CreatePage(c *gin.Context) {
	notebookId := c.Param("id")

	var input struct {
		Title   string      `json:"title" example:"Introduction"`
		Order   int         `json:"order" example:"1"`
		Content interface{} `json:"content" example:"{\"type\":\"doc\",\"content\":[]}"`
	}

	if err := c.BindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid body"})
		return
	}

	contentJson, _ := json.Marshal(input.Content)
	now := time.Now().UnixMilli()

	page := models.Page{
		ID:         uuid.New().String(),
		NotebookID: notebookId,
		Title:      input.Title,
		Order:      input.Order,
		Content:    contentJson,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	db.DB.Create(&page)

	c.JSON(http.StatusCreated, page)
}

// GetPages godoc
// @Summary Get pages by notebook
// @Description Alias for GetPagesByNotebook (kept for compatibility)
// @Tags pages
// @Produce json
// @Param id path string true "Notebook ID"
// @Success 200 {array} models.Page
// @Router /notebooks/{id}/pages [get]
func GetPages(c *gin.Context) {
	notebookID := c.Param("id")

	var pages []models.Page

	db.DB.Where("notebook_id = ?", notebookID).
		Order("`order` ASC").
		Find(&pages)

	c.JSON(http.StatusOK, pages)
}
