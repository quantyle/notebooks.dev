<template>
  <!-- Top Toolbar -->
  <v-toolbar class="top-toolbar" density="compact" flat height="48">
    <v-breadcrumbs :items="breadcrumbs">
      <template #divider>
        <v-icon icon="mdi-chevron-right" size="small" />
      </template>

      <template #item="{ item }">
        <RouterLink
          v-if="item.to"
          class="breadcrumb-link"
          :to="item.to"
        >
          {{ item.title }}
        </RouterLink>
        <span v-else class="breadcrumb-current">
          {{ item.title }}
        </span>
      </template>
    </v-breadcrumbs>
  </v-toolbar>
</template>

<script setup lang="ts">
  import { computed, onMounted } from 'vue'
  import { RouterLink, useRoute } from 'vue-router'
  import { useNotebookStore } from '@/stores/notebook'

  const store = useNotebookStore()
  const route = useRoute()

  /* ---------- Create mode ---------- */
  type CreateMode
    = | { type: 'workspace' }
      | { type: 'notebook', workspaceId: number }
      | { type: 'page', notebookId: number }
      | null

  const createMode = computed<CreateMode>(() => {
    if (route.path === '/create/workspace') {
      return { type: 'workspace' }
    }
    if (route.path.startsWith('/create/notebook/')) {
      return {
        type: 'notebook',
        workspaceId: Number(route.params.workspaceId),
      }
    }
    if (route.path.startsWith('/create/page/')) {
      return {
        type: 'page',
        notebookId: Number(route.params.notebookId),
      }
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
  type Breadcrumb = {
    title: string
    to?: string
  }

  const breadcrumbs = computed<Breadcrumb[]>(() => {
    const crumbs: Breadcrumb[] = [{ title: 'Home', to: '/' }]

    /* --- Create flows --- */
    if (createMode.value) {
      if (createMode.value.type === 'workspace') {
        crumbs.push({ title: 'New Workspace' })
        return crumbs
      }

      if (createMode.value.type === 'notebook') {
        const ws = store.workspaces.find(
          w => w.id === createMode.value.workspaceId,
        )

        crumbs.push(
          { title: ws?.name ?? 'Workspace', to: '/' },
          { title: 'New Notebook' },
        )
        return crumbs
      }

      if (createMode.value.type === 'page') {
        const notebook = Object.values(store.notebooksByWorkspace)
          .flat()
          .find(n => n.id === createMode.value.notebookId)

        const workspace = notebook
          ? store.workspaces.find(w => w.id === notebook.workspaceId)
          : null

        crumbs.push(
          { title: workspace?.name ?? 'Workspace', to: '/' },
          { title: notebook?.name ?? 'Notebook', to: '/' },
          { title: 'New Page' },
        )
        return crumbs
      }
    }

    /* --- Normal page view --- */
    if (selectedPage.value) {
      const notebook = Object.values(store.notebooksByWorkspace)
        .flat()
        .find(n => n.id === selectedPage.value.notebookId)

      const workspace = notebook
        ? store.workspaces.find(w => w.id === notebook.workspaceId)
        : null

      crumbs.push(
        { title: workspace?.name ?? 'Workspace', to: '/' },
        { title: notebook?.name ?? 'Notebook', to: '/' },
        { title: selectedPage.value.title },
      )
    }

    return crumbs
  })

  onMounted(store.loadWorkspaces)
</script>

<style scoped lang="scss">
.top-toolbar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.breadcrumb-link {
  color: inherit;
  text-decoration: none;
  font-weight: 500;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-current {
  font-weight: 600;
  opacity: 0.75;
}
</style>
