package main

import (
	"log"
	"os/exec"
	"server/internal/db"
	"server/internal/routes"

	"github.com/gin-contrib/cors"
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

	// enable CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	// register routes
	routes.RegisterWorkspaceRoutes(r)
	routes.RegisterNotebookRoutes(r)
	routes.RegisterPageRoutes(r)

	// serve openapi
	r.GET("/openapi.json", func(c *gin.Context) {
		c.Writer.Header().Set("Content-Type", "application/json")
		c.String(200, docs.SwaggerInfo.ReadDoc())
	})

	// serve swagger docs
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
