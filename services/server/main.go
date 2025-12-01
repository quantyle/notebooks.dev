package main

import (
	"log"
	"os/exec"
	"server/internal/db"
	"server/internal/routes"

	"github.com/gin-gonic/gin"

	"server/internal/docs"

	// Swagger docs
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Notebook API
// @version 1.0
// @description REST API for notebooks, pages, categories, and workspaces.
// @host localhost:3001
// @BasePath /
// @schemes http
func main() {
	generateSwagger()
	// Connect to DB
	db.Connect()

	// Gin engine
	r := gin.Default()

	// --------------------------------------------------
	// Register routes
	// --------------------------------------------------
	routes.RegisterWorkspaceRoutes(r)
	routes.RegisterCategoryRoutes(r)
	routes.RegisterNotebookRoutes(r)
	routes.RegisterPageRoutes(r)

	// --------------------------------------------------
	// Serve OpenAPI JSON
	// --------------------------------------------------
	r.GET("/openapi.json", func(c *gin.Context) {
		c.Writer.Header().Set("Content-Type", "application/json")
		c.String(200, docs.SwaggerInfo.ReadDoc())
	})

	// --------------------------------------------------
	// Serve Swagger UI
	// --------------------------------------------------
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Start server
	r.Run(":3001")
}

func generateSwagger() {
	cmd := exec.Command("swag", "init", "-g", "cmd/server.go", "-o", "internal/docs")

	out, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("Swagger generation failed: %v\nOutput:\n%s", err, string(out))
	} else {
		log.Println("Swagger docs generated successfully.")
	}
}
