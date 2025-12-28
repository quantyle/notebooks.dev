<template>
  <v-container class="home-container" fluid>
    <!-- Sidebar -->
    <v-navigation-drawer
      class="nav-drawer"
      permanent
      width="320"
    >
      <v-list density="compact" nav>
        <!-- Workspaces -->
        <v-list-group
          v-for="workspace in store.workspaces"
          :key="workspace.id"
          :value="workspace.id"
        >
          <template #activator="{ props }">
            <v-list-item v-bind="props">
              <template #prepend>
                <v-icon icon="mdi-folder-outline" />
              </template>
              <v-list-item-title class="workspace-title">
                {{ workspace.name }}
              </v-list-item-title>
            </v-list-item>
          </template>

          <!-- Notebooks -->
          <v-list class="ml-4 border-s-thin" density="compact">
            <v-list-group
              v-for="notebook in store.notebooksByWorkspace[workspace.id] || []"
              :key="notebook.id"
              :value="notebook.id"
            >
              <template #activator="{ props }">
                <v-list-item v-bind="props">
                  <template #prepend>
                    <v-icon icon="mdi-book-open-page-variant" />
                  </template>
                  <v-list-item-title class="notebook-title">
                    {{ notebook.name }}
                  </v-list-item-title>
                </v-list-item>
              </template>

              <!-- Pages -->
              <v-list class="ml-4 border-s-thin" density="compact">
                <v-list-item
                  v-for="page in store.pagesByNotebook[notebook.id] || []"
                  :key="page.id"
                  :active="page.id === selectedPageId"
                  class="page-item"
                  @click="selectPage(page.id)"
                >
                  <template #prepend>
                    <v-icon icon="mdi-file-document-outline" />
                  </template>
                  <v-list-item-title>
                    {{ page.title }}
                  </v-list-item-title>
                </v-list-item>

                <!-- Create Page -->
                <v-list-item
                  class="ml-4"
                  rounded="lg"
                  variant="tonal"
                  @click="startCreatePage(notebook.id)"
                >
                  <template #prepend>
                    <v-icon color="primary" icon="mdi-plus" />
                  </template>
                  <v-list-item-title class="create-item">
                    New Page
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-list-group>

            <!-- Create Notebook -->
            <v-list-item
              class="ml-4"
              rounded="lg"
              variant="tonal"
              @click="startCreateNotebook(workspace.id)"
            >
              <template #prepend>
                <v-icon color="primary" icon="mdi-plus" />
              </template>
              <v-list-item-title class="create-item">
                New Notebook
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-list-group>

        <!-- Create Workspace -->
        <v-list-item
          rounded="lg"
          variant="tonal"
          @click="startCreateWorkspace"
        >
          <template #prepend>
            <v-icon color="primary" icon="mdi-plus" />
          </template>
          <v-list-item-title class="create-item">
            New Workspace
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <main class="content">
      <!-- Header -->
      <div class="content-header">
        <v-btn
          :disabled="!canGoBack"
          icon
          variant="text"
          @click="goBack"
        >
          <v-icon icon="mdi-arrow-left" />
        </v-btn>

        <v-btn
          icon
          variant="text"
          @click="goForward"
        >
          <v-icon icon="mdi-arrow-right" />
        </v-btn>
      </div>

      <!-- Create Panels -->
      <v-card v-if="createMode" class="pa-6" max-width="520">
        <v-breadcrumbs class="mb-4" :items="breadcrumbs">
          <template #divider>
            <v-icon icon="mdi-chevron-right" size="small" />
          </template>
        </v-breadcrumbs>

        <h2 class="mb-4">{{ createTitle }}</h2>

        <v-text-field
          v-model="formName"
          autofocus
          :label="createLabel"
        />

        <div class="actions">
          <v-btn color="primary" variant="flat" @click="confirmCreate">
            Create
          </v-btn>
          <v-btn variant="text" @click="cancelCreate">
            Cancel
          </v-btn>
        </div>
      </v-card>

      <!-- Page Content -->
      <div v-else-if="selectedPage" class="page-content">
        <h1 class="mb-4">{{ selectedPage.title }}</h1>

        <!-- Placeholder for Tiptap -->
        <pre class="content-preview">
{{ JSON.stringify(selectedPage.content, null, 2) }}
        </pre>
      </div>

      <!-- Idle -->
      <div v-else class="placeholder">
        Select a page or create something from the sidebar
      </div>
    </main>
  </v-container>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useNotebookStore } from '@/stores/notebook'

  const store = useNotebookStore()
  const router = useRouter()
  const route = useRoute()

  /* ---------- Route-driven create mode ---------- */
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

  const formName = ref('')

  /* ---------- Navigation ---------- */
  const canGoBack = computed(() => route.path !== '/')

  function goBack () {
    if (canGoBack.value) router.back()
  }

  function goForward () {
    router.forward()
  }

  /* ---------- Create starters ---------- */
  function startCreateWorkspace () {
    formName.value = ''
    router.push('/create/workspace')
  }

  function startCreateNotebook (workspaceId: number) {
    formName.value = ''
    router.push(`/create/notebook/${workspaceId}`)
  }

  function startCreatePage (notebookId: number) {
    formName.value = ''
    router.push(`/create/page/${notebookId}`)
  }

  function cancelCreate () {
    formName.value = ''
    router.back()
  }

  /* ---------- Confirm create ---------- */
  async function confirmCreate () {
    if (!createMode.value || !formName.value) return

    if (createMode.value.type === 'workspace') {
      await store.createWorkspace(formName.value)
      router.push('/')
    }

    if (createMode.value.type === 'notebook') {
      await store.createNotebook(createMode.value.workspaceId, formName.value)
      router.push('/')
    }

    if (createMode.value.type === 'page') {
      await store.createPage(createMode.value.notebookId, formName.value)
      router.push('/')
    }
  }

  /* ---------- Page selection ---------- */
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

  function selectPage (pageId: number) {
    router.push(`/pages/${pageId}`)
  }

  /* ---------- Breadcrumbs ---------- */
  const breadcrumbs = computed(() => {
    if (!createMode.value) return []

    if (createMode.value.type === 'workspace') {
      return [{ title: 'Workspaces' }]
    }

    if (createMode.value.type === 'notebook') {
      const ws = store.workspaces.find(w => w.id === createMode.value!.workspaceId)
      return [{ title: 'Workspaces' }, { title: ws?.name ?? 'Workspace' }]
    }

    if (createMode.value.type === 'page') {
      const notebook = Object.values(store.notebooksByWorkspace)
        .flat()
        .find(n => n.id === createMode.value!.notebookId)

      const workspace = notebook
        ? store.workspaces.find(w => w.id === notebook.workspaceId)
        : null

      return [
        { title: 'Workspaces' },
        { title: workspace?.name ?? 'Workspace' },
        { title: notebook?.name ?? 'Notebook' },
      ]
    }

    return []
  })

  const createTitle = computed(() =>
    createMode.value?.type === 'workspace'
      ? 'Create Workspace'
      : createMode.value?.type === 'notebook'
        ? 'Create Notebook'
        : createMode.value?.type === 'page'
          ? 'Create Page'
          : '',
  )

  const createLabel = computed(() =>
    createMode.value?.type === 'workspace'
      ? 'Workspace name'
      : createMode.value?.type === 'notebook'
        ? 'Notebook name'
        : createMode.value?.type === 'page'
          ? 'Page title'
          : '',
  )

  onMounted(store.loadWorkspaces)
</script>

<style scoped lang="scss">
.home-container {
  display: flex;
  height: calc(100vh - 40px);
}

.nav-drawer {
  border-right: 1px solid rgba(0, 0, 0, 0.08);
}

.content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

.content-header {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
}

.placeholder {
  color: rgba(0, 0, 0, 0.45);
  font-size: 1.1rem;
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

.page-content {
  max-width: 900px;
}

.content-preview {
  background: #f6f6f6;
  padding: 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  overflow-x: auto;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}
</style>
