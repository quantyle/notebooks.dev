package models

// Workspace represents a user’s workspace.
// @Description A workspace that contains notebooks and categories.
type Workspace struct {
	ID        string     `json:"id" example:"workspace-123" gorm:"primaryKey"`
	UserID    string     `json:"userId" example:"user-123"`
	Notebooks []Notebook `json:"notebooks,omitempty"`
}
