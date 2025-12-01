package routes

import (
	"server/internal/api"

	"github.com/gin-gonic/gin"
)

// RegisterCategoryRoutes registers category-related endpoints.
func RegisterCategoryRoutes(r *gin.Engine) {
	group := r.Group("/categories")
	{
		group.GET("", api.GetCategories)
		group.POST("", api.CreateCategory)
	}
}
