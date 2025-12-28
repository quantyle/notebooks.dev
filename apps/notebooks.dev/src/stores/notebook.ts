import type {
  NotebookDTO,
  PageDTO,
  WorkspaceDTO,
} from '@notebooks.dev/api-client/lib/model'
import { getNotebookService } from '@notebooks.dev/api-client/lib/client'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotebookStore = defineStore('notebooks', () => {
  const api = getNotebookService()

  // --------------------
  // State
  // --------------------
  const workspaces = ref<WorkspaceDTO[]>([])
  const notebooksByWorkspace = ref<Record<number, NotebookDTO[]>>({})
  const pagesByNotebook = ref<Record<number, PageDTO[]>>({})

  const isLoading = ref(false)

  // --------------------
  // Loaders
  // --------------------
  async function loadWorkspaces () {
    isLoading.value = true
    workspaces.value = await api.getWorkspaces()
    for (const ws of workspaces.value) {
      await loadNotebooks(ws.id)
    }
    isLoading.value = false
  }

  async function loadNotebooks (workspaceId: number) {
    const res = await api.getNotebooks({ workspaceId })
    notebooksByWorkspace.value[workspaceId] = res
    for (const nb of res) {
      await loadPages(nb.id)
    }
  }

  async function loadPages (notebookId: number) {
    pagesByNotebook.value[notebookId]
      = await api.getPages({ notebookId })
  }

  // --------------------
  // Mutations
  // --------------------
  async function createWorkspace (name: string) {
    if (!name) {
      return
    }
    await api.createWorkspace({ name })
    await loadWorkspaces()
  }

  async function createNotebook (
    workspaceId: number,
    name: string,
  ) {
    if (!name) {
      return
    }
    await api.createNotebook({ name, workspaceId })
    await loadNotebooks(workspaceId)
  }

  async function createPage (
    notebookId: number,
    title: string,
  ) {
    if (!title) {
      return
    }

    await api.createPage({
      title,
      notebookId,
      content: '',
    })

    await loadPages(notebookId)
  }

  return {
    // state
    workspaces,
    notebooksByWorkspace,
    pagesByNotebook,
    isLoading,

    // actions
    loadWorkspaces,
    loadNotebooks,
    loadPages,
    createWorkspace,
    createNotebook,
    createPage,
  }
})
