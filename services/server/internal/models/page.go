package models

import "gorm.io/datatypes"

// Page represents a single page in a notebook.
// @Description A content page inside a notebook.
type Page struct {
	ID             string         `json:"id" example:"page-123"`
	NotebookID     string         `json:"notebookId" example:"nbk-123"`
	Title          string         `json:"title" example:"Intro"`
	Order          int            `json:"order" example:"1"`
	Content        datatypes.JSON `json:"content" swaggertype:"object"`
	CreatedAt      int64          `json:"createdAt" example:"1700000000000"`
	UpdatedAt      int64          `json:"updatedAt" example:"1700001000000"`
	LastExecutedAt *int64         `json:"lastExecutedAt,omitempty" example:"1700002000000"`
}
