package routes

import (
	"server/internal/api"

	"github.com/gin-gonic/gin"
)

// RegisterPageRoutes registers page-related endpoints.
func RegisterPageRoutes(r *gin.Engine) {

	// Notebook-scoped page routes
	r.GET("/notebooks/:id/pages", api.GetPages)
	r.POST("/notebooks/:id/pages", api.CreatePage)

	// Optional: global page endpoints
	r.GET("/pages", api.GetAllPages)
	r.GET("/pages/:id", api.GetPage)
}
