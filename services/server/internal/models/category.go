package models

// Category groups notebooks inside a workspace.
// @Description Notebook category with metadata.
type Category struct {
	ID          string  `json:"id" example:"cat-123" gorm:"primaryKey"`
	Name        string  `json:"name" example:"Programming"`
	Description *string `json:"description,omitempty" example:"Category for coding notes"`
	Color       *string `json:"color,omitempty" example:"#FF9900"`

	CreatedAt int64 `json:"createdAt" example:"1700000000000"`
	UpdatedAt int64 `json:"updatedAt" example:"1700000500000"`

	WorkspaceID string `json:"workspaceId" example:"workspace-123"`
}
