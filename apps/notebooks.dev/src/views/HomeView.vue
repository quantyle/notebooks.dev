<template>
  <!-- Top Toolbar -->
  <NavToolbar />
  <PanelGroup class="workspace-panels" direction="horizontal">
    <Panel :default-size="20">
      <!-- Sidebar -->
      <v-list v-model:opened="opened" density="compact" nav>
        <v-btn
          class="mr-2"
          density="compact"
          elevation="0"
          icon
          rounded="lg"
          size="small"
          @click="expandAll"
        >
          <v-icon icon="mdi-unfold-more-horizontal" />
        </v-btn>
        <v-btn
          density="compact"
          elevation="0"
          icon
          rounded="lg"
          size="small"
          @click="collapseAll"
        >
          <v-icon icon="mdi-unfold-less-horizontal" />
        </v-btn>
        <v-divider class="my-2" />

        <!-- Workspaces -->
        <template v-for="workspace in store.workspaces" :key="workspace.id">
          <v-list-group :value="wsKey(workspace.id)">
            <template #activator="{ props }">
              <v-list-item v-bind="props">
                <v-list-item-title>
                  <v-icon icon="mdi-folder-outline" size="small" />
                  {{ workspace.name }}
                </v-list-item-title>
              </v-list-item>
            </template>

            <!-- Notebooks -->
            <template
              v-for="notebook in store.notebooksByWorkspace[workspace.id] || []"
              :key="notebook.id"
            >
              <v-list-group :value="nbKey(notebook.id)">
                <template #activator="{ props }">
                  <v-list-item v-bind="props">
                    <v-list-item-title>
                      <v-icon icon="mdi-book-outline" />
                      {{ notebook.name }}
                    </v-list-item-title>
                  </v-list-item>
                </template>

                <!-- Pages -->
                <v-list-item
                  v-for="page in store.pagesByNotebook[notebook.id] || []"
                  :key="page.id"
                  :active="page.id === selectedPageId"
                  @click="selectPage(page.id)"
                >
                  <v-list-item-title>
                    <v-icon icon="mdi-file-document-outline" />
                    {{ page.title }}
                  </v-list-item-title>
                </v-list-item>

                <!-- Create Page -->
                <v-list-item @click="startCreatePage(notebook.id)">
                  <v-list-item-title class="create-item">
                    <v-icon color="primary" icon="mdi-plus" />
                    New Page
                  </v-list-item-title>
                </v-list-item>
              </v-list-group>
            </template>

            <!-- Create Notebook -->
            <v-list-item class="pl-6" @click="startCreateNotebook(workspace.id)">
              <v-list-item-title class="create-item">
                <v-icon color="primary" icon="mdi-plus" />
                New Notebook
              </v-list-item-title>
            </v-list-item>
          </v-list-group>
        </template>

        <!-- Create Workspace -->
        <v-list-item @click="startCreateWorkspace">
          <v-list-item-title class="create-item">
            <v-icon color="primary" icon="mdi-plus" />
            New Workspace
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </Panel>
    <PanelResizeHandle class="resize-handle-horizontal" />
    <Panel>
      <!-- Main Area -->
      <main>
        <!-- Create -->
        <v-card v-if="createMode" class="pa-6 ma-auto" max-width="520">
          <h2 class="mb-4">{{ createTitle }}</h2>
          <v-text-field v-model="formName" autofocus :placeholder="createLabel" variant="outlined" />
          <div class="actions">
            <v-btn color="primary" variant="flat" @click="confirmCreate">
              Create
            </v-btn>
            <v-btn variant="text" @click="cancelCreate">
              Cancel
            </v-btn>
          </div>
        </v-card>

        <!-- Page -->
        <div v-else-if="selectedPage" class="page-content">
          <Editor />
          {{ JSON.stringify(selectedPage.content, null, 2) }}
        </div>

        <!-- Idle -->
        <div v-else class="placeholder">
          Select a page or create something from the sidebar
        </div>
      </main>
    </Panel>
  </PanelGroup>

</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { Panel, PanelGroup, PanelResizeHandle } from 'vue-resizable-panels'
  import { useRoute, useRouter } from 'vue-router'
  import Editor from '@/components/Editor.vue'
  import NavToolbar from '@/components/NavToolbar.vue'
  import { useNotebookStore } from '@/stores/notebook'

  const store = useNotebookStore()
  const router = useRouter()
  const route = useRoute()

  /* ---------- Opened groups ---------- */
  const opened = ref<string[]>([])
  const wsKey = (id: number) => `ws-${id}`
  const nbKey = (id: number) => `nb-${id}`

  function expandAll () {
    opened.value = [
      ...store.workspaces.map(w => wsKey(w.id)),
      ...Object.values(store.notebooksByWorkspace).flat().map(n => nbKey(n.id)),
    ]
  }

  function collapseAll () {
    opened.value = []
  }

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

  /* ---------- Create mode ---------- */
  type CreateMode
    = | { type: 'workspace' }
      | { type: 'notebook', workspaceId: number }
      | { type: 'page', notebookId: number }
      | null

  const createMode = computed<CreateMode>(() => {
    switch (true) {
      case route.path === '/create/workspace': {
        return { type: 'workspace' }
      }
      case route.path.startsWith('/create/notebook/'): {
        return {
          type: 'notebook',
          workspaceId: Number(route.params.workspaceId),
        }
      }
      case route.path.startsWith('/create/page/'): {
        return {
          type: 'page',
          notebookId: Number(route.params.notebookId),
        }
      }
      default: {
        return null
      }
    }
  })

  const formName = ref('')

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
  }

  async function confirmCreate () {
    if (!createMode.value || !formName.value) return

    if (createMode.value.type === 'workspace') {
      await store.createWorkspace(formName.value)
    }
    if (createMode.value.type === 'notebook') {
      await store.createNotebook(createMode.value.workspaceId, formName.value)
    }
    if (createMode.value.type === 'page') {
      await store.createPage(createMode.value.notebookId, formName.value)
    }

    await router.push('/')
  }

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

  function selectPage (pageId: number) {
    router.push(`/pages/${pageId}`)
  }

  const createTitle = computed(() => {
    switch (createMode.value?.type) {
      case 'workspace': {
        return 'Create Workspace'
      }
      case 'notebook': {
        return 'Create Notebook'
      }
      case 'page': {
        return 'Create Page'
      }
      default: {
        return ''
      }
    }
  })

  const createLabel = computed(() => {
    switch (createMode.value?.type) {
      case 'workspace': {
        return 'Workspace name'
      }
      case 'notebook': {
        return 'Notebook name'
      }
      case 'page': {
        return 'Page title'
      }
      default: {
        return ''
      }
    }
  })

  onMounted(store.loadWorkspaces)
</script>

<style scoped lang="scss">
.main-area {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.create-item {
  color: var(--v-theme-primary);
}

.placeholder {
  color: rgba(0, 0, 0, 0.45);
  font-size: 1.1rem;
}

.content-preview {
  background: #f6f6f6;
  padding: 16px;
  border-radius: 8px;
  font-size: 0.85rem;
}

</style>
