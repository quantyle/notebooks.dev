package api

import (
	"net/http"
	"server/internal/db"
	"server/internal/models"

	"github.com/gin-gonic/gin"
)

// GetWorkspaces godoc
// @Summary List all workspaces
// @Tags workspaces
// @Produce json
// @Success 200 {array} models.Workspace
// @Router /workspaces [get]
func GetWorkspaces(c *gin.Context) {
	var ws []models.Workspace
	db.DB.Preload("Notebooks").Preload("Categories").Find(&ws)
	c.JSON(http.StatusOK, ws)
}

// CreateWorkspace godoc
// @Summary Create a workspace
// @Tags workspaces
// @Accept json
// @Produce json
// @Param workspace body map[string]string true "Workspace payload"
// @Success 201 {object} models.Workspace
// @Router /workspaces [post]
func CreateWorkspace(c *gin.Context) {
	var input map[string]string
	c.BindJSON(&input)

	ws := models.Workspace{
		ID:     input["id"],
		UserID: input["userId"],
	}

	db.DB.Create(&ws)
	c.JSON(http.StatusCreated, ws)
}
