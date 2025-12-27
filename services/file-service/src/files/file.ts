// src/models/file.ts
export type FileType = "file" | "folder";

export interface FileDTO {
  id: number;
  name: string;
  type: FileType;
  content?: string | null;
  parentId?: number | null;
}

export interface CreateFileRequest {
  name: string;
  type: FileType;
  parentId?: number;
  content?: string;
}

export interface UpdateFileRequest {
  name?: string;
  content?: string;
}
