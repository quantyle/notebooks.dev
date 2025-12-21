package routes

import (
	"server/internal/api"
	"server/internal/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterNotebookRoutes registers notebook-related endpoints.
func RegisterNotebookRoutes(r *gin.Engine) {
	group := r.Group("/notebooks")

	// use dev auth middleware
	group.Use(middleware.DevAuthMiddleware())

	group.GET("", api.GetNotebooks)
	group.GET("/:id", api.GetNotebook)
	group.POST("", api.CreateNotebook)

}
