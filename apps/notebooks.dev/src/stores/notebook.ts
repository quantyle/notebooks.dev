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
  // Create
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

  // --------------------
  // Update
  // --------------------
  async function updateWorkspace (
    id: number,
    name: string,
  ) {
    if (!name) {
      return
    }

    await api.updateWorkspace(id, { name })

    const ws = workspaces.value.find(w => w.id === id)
    if (ws) {
      ws.name = name
    }
  }

  async function updateNotebook (
    id: number,
    workspaceId: number,
    name: string,
  ) {
    if (!name) {
      return
    }

    await api.updateNotebook(id, { name })

    const notebooks = notebooksByWorkspace.value[workspaceId]
    const nb = notebooks?.find(n => n.id === id)
    if (nb) {
      nb.name = name
    }
  }

  async function updatePage (
    id: number,
    notebookId: number,
    updates: Partial<Pick<PageDTO, 'title' | 'content'>>,
  ) {
    await api.updatePage(id, updates)

    const pages = pagesByNotebook.value[notebookId]
    const page = pages?.find(p => p.id === id)

    if (page) {
      Object.assign(page, updates)
    }
  }

  // --------------------
  // Delete
  // --------------------
  async function deleteWorkspace (id: number) {
    await api.deleteWorkspace(id)

    workspaces.value = workspaces.value.filter(w => w.id !== id)
    delete notebooksByWorkspace.value[id]
  }

  async function deleteNotebook (
    id: number,
    workspaceId: number,
  ) {
    await api.deleteNotebook(id)

    notebooksByWorkspace.value[workspaceId]
      = notebooksByWorkspace.value[workspaceId]?.filter(n => n.id !== id) ?? []

    delete pagesByNotebook.value[id]
  }

  async function deletePage (
    id: number,
    notebookId: number,
  ) {
    await api.deletePage(id)

    pagesByNotebook.value[notebookId]
      = pagesByNotebook.value[notebookId]?.filter(p => p.id !== id) ?? []
  }

  return {
    // state
    workspaces,
    notebooksByWorkspace,
    pagesByNotebook,
    isLoading,

    // loaders
    loadWorkspaces,
    loadNotebooks,
    loadPages,

    // create
    createWorkspace,
    createNotebook,
    createPage,

    // update
    updateWorkspace,
    updateNotebook,
    updatePage,

    // delete
    deleteWorkspace,
    deleteNotebook,
    deletePage,
  }
})
