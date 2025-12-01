import type { JSONContent } from '@tiptap/vue-3'
// Utilities
import { defineStore } from 'pinia'

type UUID = string
type Timestamp = number // Unix timestamp in millisecond

// Categories for organizing notebooks
interface Category {
  id: UUID
  name: string
  description?: string
  color?: string // For UI theming
  createdAt: Timestamp
  updatedAt: Timestamp
}

// For organizing the overall workspace
interface Workspace {
  id: UUID
  userId: UUID
  notebooks: Notebook[]
  categories: Category[]
}

// Main notebook structure
interface Notebook {
  id: UUID
  title: string
  description?: string

  // Organization
  categoryIds: UUID[] // A notebook can belong to multiple categories
  tags?: string[]

  // Content
  pages: Page[]

  // Ownership and sharing
  ownerId: UUID
  collaboratorIds?: UUID[]
  isPublic: boolean

  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
  lastAccessedAt?: Timestamp
}

// Page within a notebook
interface Page {
  id: UUID
  notebookId: UUID
  title: string
  order: number // For ordering pages within a notebook
  content: JSONContent[]

  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
  lastExecutedAt?: Timestamp
}

export const useNotebookStore = defineStore('notebook', () => {})
