package models

import (
	"time"
)

// Notebook is the main collection of pages.
// @Description A notebook containing pages.
type Notebook struct {
	ID          string  `json:"id" example:"nbk-123"`
	Title       string  `json:"title" example:"My Notebook"`
	Description *string `json:"description,omitempty" example:"Study notes"`

	// JSON fields (let GORM marshal automatically)
	Tags            []string `json:"tags" gorm:"type:jsonb" swaggertype:"array,string" example:"go,api"`
	CollaboratorIDs []string `json:"collaboratorIds" gorm:"type:jsonb" swaggertype:"array,string" example:"user-1,user-2"`

	OwnerID  string `json:"ownerId" example:"user-123"`
	IsPublic bool   `json:"isPublic" example:"false"`

	// Timestamps (managed by GORM)
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
	LastAccessedAt *time.Time `json:"lastAccessedAt,omitempty"`

	// Relationships
	WorkspaceID *string    `json:"workspaceId,omitempty" gorm:"index"`
	Workspace   *Workspace `json:"-" gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`

	// Has Many
	Pages []Page `json:"pages,omitempty" gorm:"foreignKey:NotebookID"`
}
