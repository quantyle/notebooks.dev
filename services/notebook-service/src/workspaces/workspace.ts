// src/workspaces/workspace.ts

export interface WorkspaceDTO {
  id: number;
  name: string;
}

export interface CreateWorkspaceRequest {
  name: string;
}

export interface UpdateWorkspaceRequest {
  name?: string;
}
