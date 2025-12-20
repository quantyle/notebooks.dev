package dto

// CreateNotebookRequest is the DTO used to create notebooks.
// @Description A notebook containing pages.
type CreateNotebookRequest struct {
	Title           string   `json:"title" binding:"required,min=1"`
	Description     *string  `json:"description"`
	WorkspaceID     *string  `json:"workspaceId"`
	Tags            []string `json:"tags"`
	CollaboratorIDs []string `json:"collaboratorIds"`
	IsPublic        bool     `json:"isPublic"`
}
