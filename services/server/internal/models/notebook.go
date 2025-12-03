package models

import "gorm.io/datatypes"

// Notebook is the main collection of pages.
// @Description A notebook containing pages.
type Notebook struct {
	ID          string  `json:"id" example:"nbk-123"`
	Title       string  `json:"title" example:"My Notebook"`
	Description *string `json:"description,omitempty" example:"Study notes"`

	Tags            datatypes.JSON `json:"tags" swaggertype:"array,string" example:"[\"go\",\"api\"]"`
	CollaboratorIds datatypes.JSON `json:"collaboratorIds" swaggertype:"array,string" example:"[\"user-1\",\"user-2\"]"`

	OwnerID        string `json:"ownerId" example:"user-123"`
	IsPublic       bool   `json:"isPublic" example:"false"`
	CreatedAt      int64  `json:"createdAt" example:"1700000000000"`
	UpdatedAt      int64  `json:"updatedAt" example:"1700000000000"`
	LastAccessedAt *int64 `json:"lastAccessedAt,omitempty" example:"1700000200000"`

	// relationships
	WorkspaceID *string   `gorm:"index"` // pointer is nullable so notebooks dont need to be in a workspace
	Workspace   Workspace `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`

	// Has Many relation
	Pages []Page `json:"pages" gorm:"foreignKey:NotebookID"`
}
