<template>
  <!-- Top Toolbar -->
  <v-toolbar class="top-toolbar" density="compact" flat>
    <v-btn :disabled="!canGoBack" icon variant="text" @click="goBack">
      <v-icon icon="mdi-arrow-left" />
    </v-btn>
    <v-btn :disabled="!canGoForward" icon variant="text" @click="goForward">
      <v-icon icon="mdi-arrow-right" />
    </v-btn>
    <v-divider class="mx-3" vertical />
    <v-breadcrumbs :items="breadcrumbs">
      <template #divider>
        <v-icon icon="mdi-chevron-right" size="small" />
      </template>
    </v-breadcrumbs>
  </v-toolbar>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useNotebookStore } from '@/stores/notebook'

  const store = useNotebookStore()
  const router = useRouter()
  const route = useRoute()

  /* ---------- History ---------- */
  const historyStack = ref<string[]>([])
  const historyIndex = ref(-1)

  watch(
    () => route.fullPath,
    path => {
      if (historyStack.value[historyIndex.value] === path) return
      historyStack.value = historyStack.value.slice(0, historyIndex.value + 1)
      historyStack.value.push(path)
      historyIndex.value++
    },
    { immediate: true },
  )

  const canGoBack = computed(() => historyIndex.value > 0)
  const canGoForward = computed(() => historyIndex.value < historyStack.value.length - 1)

  function goBack () {
    if (canGoBack.value) {
      historyIndex.value--
      router.push(historyStack.value[historyIndex.value])
    }
  }
  function goForward () {
    if (canGoForward.value) {
      historyIndex.value++
      router.push(historyStack.value[historyIndex.value])
    }
  }

  /* ---------- Create mode ---------- */
  type CreateMode
    = | { type: 'workspace' }
      | { type: 'notebook', workspaceId: number }
      | { type: 'page', notebookId: number }
      | null

  const createMode = computed<CreateMode>(() => {
    if (route.path === '/create/workspace') return { type: 'workspace' }
    if (route.path.startsWith('/create/notebook/')) {
      return { type: 'notebook', workspaceId: Number(route.params.workspaceId) }
    }
    if (route.path.startsWith('/create/page/')) {
      return { type: 'page', notebookId: Number(route.params.notebookId) }
    }
    return null
  })

  /* ---------- Page ---------- */
  const selectedPageId = computed(() =>
    route.params.id ? Number(route.params.id) : null,
  )

  const selectedPage = computed(() =>
    selectedPageId.value
      ? Object.values(store.pagesByNotebook)
        .flat()
        .find(p => p.id === selectedPageId.value) ?? null
      : null,
  )

  /* ---------- Breadcrumbs ---------- */
  const breadcrumbs = computed(() => {
    const crumbs: { title: string, to?: string }[] = [{ title: 'Home', to: '/' }]

    if (createMode.value) {
      if (createMode.value.type === 'workspace') {
        crumbs.push({ title: 'New Workspace', to: '/create/workspace' })
      }

      if (createMode.value.type === 'notebook') {
        const ws = store.workspaces.find(w => w.id === createMode.value!.workspaceId)
        crumbs.push(
          { title: ws?.name ?? 'Workspace', to: '/' },
          { title: 'New Notebook', to: `/create/notebook/${createMode.value.workspaceId}` },
        )
      }

      if (createMode.value.type === 'page') {
        const notebook = Object.values(store.notebooksByWorkspace)
          .flat()
          .find(n => n.id === createMode.value!.notebookId)

        const workspace = notebook
          ? store.workspaces.find(w => w.id === notebook.workspaceId)
          : null

        crumbs.push(
          { title: workspace?.name ?? 'Workspace', to: '/' },
          { title: notebook?.name ?? 'Notebook', to: '/' },
          { title: 'New Page', to: `/create/page/${createMode.value.notebookId}` },
        )
      }

      return crumbs
    }

    console.log('SELECTED PAGE:', selectedPage.value)
    if (selectedPage.value) {
      const notebook = Object.values(store.notebooksByWorkspace)
        .flat()
        .find(n => n.id === selectedPage.value!.notebookId)

      const workspace = notebook
        ? store.workspaces.find(w => w.id === notebook.workspaceId)
        : null

      crumbs.push(
        { title: workspace?.name ?? 'Workspace', to: '/' },
        { title: notebook?.name ?? 'Notebook', to: '/' },
        { title: selectedPage.value.title, to: `/pages/${selectedPage.value.id}` },
      )
    }

    return crumbs
  })

  onMounted(store.loadWorkspaces)
</script>

<style scoped lang="scss">
.home-container {
  display: flex;
  height: calc(100vh - 40px);
}

.top-toolbar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.nav-drawer {
  border-right: 1px solid rgba(0, 0, 0, 0.08);
}

.main-area {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

.workspace-title {
  font-weight: 600;
}

.notebook-title {
  font-weight: 500;
  font-size: 0.9rem;
}

.create-item {
  color: var(--v-theme-primary);
}

.page-item {
  cursor: pointer;
}

.page-item:hover {
  background: rgba(0, 0, 0, 0.06);
}

.placeholder {
  color: rgba(0, 0, 0, 0.45);
  font-size: 1.1rem;
}

.page-content {
  max-width: 900px;
}

.content-preview {
  background: #f6f6f6;
  padding: 16px;
  border-radius: 8px;
  font-size: 0.85rem;
}
</style>
