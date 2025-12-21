package middleware

import "github.com/gin-gonic/gin"

// DEV ONLY — remove when real auth is added
func DevAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("userID", "dev-user-123")
		c.Next()
	}
}
