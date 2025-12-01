package routes

import (
	"server/internal/api"

	"github.com/gin-gonic/gin"
)

// RegisterWorkspaceRoutes registers workspace-related endpoints.
func RegisterWorkspaceRoutes(r *gin.Engine) {
	group := r.Group("/workspaces")
	{
		group.GET("", api.GetWorkspaces)
		group.POST("", api.CreateWorkspace)
	}
}
