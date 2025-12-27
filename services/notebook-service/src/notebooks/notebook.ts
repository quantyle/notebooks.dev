// src/notebooks/notebook.ts

export interface NotebookDTO {
  id: number;
  name: string;
  workspaceId: number;
}

export interface CreateNotebookRequest {
  name: string;
  workspaceId: number;
}

export interface UpdateNotebookRequest {
  name?: string;
}
