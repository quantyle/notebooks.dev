package routes

import (
	"server/internal/api"

	"github.com/gin-gonic/gin"
)

// RegisterNotebookRoutes registers notebook-related endpoints.
func RegisterNotebookRoutes(r *gin.Engine) {
	group := r.Group("/notebooks")
	{
		group.GET("", api.GetNotebooks)
		group.GET("/:id", api.GetNotebook)
		group.POST("", api.CreateNotebook)
	}
}
