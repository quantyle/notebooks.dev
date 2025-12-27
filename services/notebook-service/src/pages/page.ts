// src/pages/page.ts

export interface PageDTO {
  id: number;
  title: string;
  content: string;
  notebookId: number;
}

export interface CreatePageRequest {
  title: string;
  content?: string;
  notebookId: number;
}

export interface UpdatePageRequest {
  title?: string;
  content?: string;
}
