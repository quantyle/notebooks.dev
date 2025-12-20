<script setup lang="ts">
  import type {
    ModelsNotebook } from '@notebooks.dev/api-client/lib/client'
  import {
    getNotebookAPI,
  } from '@notebooks.dev/api-client/lib/client'
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import FeaturedBanner from '@/components/FeaturedBanner.vue'
  import NotebookCard from '@/components/NotebookCard.vue'

  const api = getNotebookAPI()
  const loading = ref(false)

  onMounted(async () => {
    loading.value = true
    try {
      const res = await api.getNotebooks()
      console.log(res)
    } finally {
      loading.value = false
    }
  })

  function addItem2 () {
    console.log('hello world')
    const notebook: ModelsNotebook = {
      collaboratorIds: [],
      createdAt: 0,
      description: '',
      id: '',
      isPublic: true,
      lastAccessedAt: 0,
      ownerId: '',
      tags: [],
      title: '',
      updatedAt: 0,
      workspaceId: '',
    }
  }

  const router = useRouter()
  const searchQuery = ref('')
  const showAddDialog = ref(false)
  const showViewAllDialog = ref(false)
  const selectedCategory = ref<any>(null)
  const addType = ref<'notebook' | 'category'>('notebook')

  const newItem = ref({
    title: '',
    categoryId: 1,
    coverColor: '#1a1a1a',
    bookmarked: false,
  })

  const colorOptions = [
    '#1a1a1a', // Black
    '#8B0000', // Dark Red
    '#004d00', // Dark Green
    '#00008B', // Dark Blue
    '#4B0082', // Indigo
    '#8B4513', // Brown
    '#2F4F4F', // Dark Slate Gray
    '#800080', // Purple
  ]

  const featuredNotebook = ref({
    id: 999,
    title: 'Advanced Data Science Techniques',
    coverColor: '#004d00',
    date: '2024-03-25',
    bookmarked: true,
    preview:
      'Explore cutting-edge machine learning algorithms, neural networks, and predictive modeling. This comprehensive guide covers everything from basic regression to deep learning architectures.',
  })

  const categories = ref([
    {
      id: 1,
      title: 'Python Notebooks',
      notebooks: [
        {
          id: 101,
          title: 'Pandas Tutorial',
          coverColor: '#1a1a1a',
          date: '2024-03-15',
          bookmarked: true,
        },
        {
          id: 102,
          title: 'NumPy Basics',
          coverColor: '#8B0000',
          date: '2024-03-10',
          bookmarked: false,
        },
        {
          id: 103,
          title: 'Machine Learning Intro',
          coverColor: '#004d00',
          date: '2024-02-28',
          bookmarked: false,
        },
        {
          id: 104,
          title: 'Data Cleaning',
          coverColor: '#1a1a1a',
          date: '2024-03-20',
          bookmarked: true,
        },
      ],
    },
    {
      id: 2,
      title: 'Class Notes',
      notebooks: [
        {
          id: 201,
          title: 'Math – Unit 5',
          coverColor: '#00008B',
          date: '2024-03-18',
          bookmarked: false,
        },
        {
          id: 202,
          title: 'History Chapter 3',
          coverColor: '#1a1a1a',
          date: '2024-03-12',
          bookmarked: true,
        },
        {
          id: 203,
          title: 'Chemistry Lab 2',
          coverColor: '#4B0082',
          date: '2024-03-05',
          bookmarked: false,
        },
      ],
    },
    {
      id: 3,
      title: 'Projects',
      notebooks: [
        {
          id: 301,
          title: 'Stock Predictor',
          coverColor: '#8B4513',
          date: '2024-01-22',
          bookmarked: false,
        },
        {
          id: 302,
          title: 'Weather Dashboard',
          coverColor: '#004d00',
          date: '2024-03-08',
          bookmarked: false,
        },
      ],
    },
  ])

  const filteredCategories = computed(() => {
    if (!searchQuery.value) {
      return categories.value
    }

    const query = searchQuery.value.toLowerCase().trim()

    return categories.value
      .map(category => {
        // Check if category title matches
        const categoryMatches = category.title.toLowerCase().includes(query)

        // Filter notebooks that match the search query
        const matchingNotebooks = category.notebooks.filter(notebook =>
          notebook.title.toLowerCase().includes(query),
        )

        // Include category if either:
        // 1. Category title matches (show all notebooks)
        // 2. At least one notebook matches (show only matching notebooks)
        if (categoryMatches) {
          return { ...category, notebooks: category.notebooks }
        } else if (matchingNotebooks.length > 0) {
          return { ...category, notebooks: matchingNotebooks }
        }

        return null
      })
      .filter(category => category !== null) as typeof categories.value
  })

  const categoryOptions = computed(() => {
    return categories.value.map(cat => ({
      id: cat.id,
      title: cat.title,
    }))
  })

  function openNotebook (nb: any) {
    console.log('Open notebook:', nb)
    router.push(`/notebook/35cda886-13e7-48d9-b40c-f24d812ee7b8`)
  }

  function viewAllNotebooks (category: any) {
    selectedCategory.value = category
    showViewAllDialog.value = true
  }

  function addItem () {
    if (addType.value === 'category') {
      // Add new category
      const newId = Math.max(...categories.value.map(c => c.id)) + 1
      categories.value.push({
        id: newId,
        title: newItem.value.title,
        notebooks: [],
      })
    } else {
      // Add new notebook
      const category = categories.value.find(
        c => c.id === newItem.value.categoryId,
      )
      if (category) {
        const newId
          = Math.max(
            ...categories.value.flatMap(c => c.notebooks.map(n => n.id)),
            0,
          ) + 1

        const today = new Date().toISOString().split('T')[0]

        category.notebooks.push({
          id: newId,
          title: newItem.value.title,
          coverColor: newItem.value.coverColor,
          date: today,
          bookmarked: newItem.value.bookmarked,
        })
      }
    }

    cancelAdd()
  }

  function cancelAdd () {
    showAddDialog.value = false
    newItem.value = {
      title: '',
      categoryId: 1,
      coverColor: '#1a1a1a',
      bookmarked: false,
    }
    addType.value = 'notebook'
  }
</script>
<template>
  <v-container class="netflix-container" fluid>
    <!-- Search Bar -->
    <div class="search-container">
      <div class="search-wrapper">
        <div class="custom-search-input">
          <v-icon class="search-icon">mdi-magnify</v-icon>
          <input
            v-model="searchQuery"
            class="search-input"
            placeholder="Search notebooks and categories..."
            type="text"
          >
          <button
            v-if="searchQuery"
            class="clear-button"
            @click="searchQuery = ''"
          >
            <v-icon size="20">mdi-close</v-icon>
          </button>
        </div>
        <v-btn
          class="add-button"
          color="primary"
          elevation="2"
          size="large"
          @click="showAddDialog = true"
        >
          <v-icon class="mr-2">mdi-plus-circle</v-icon>
          New
        </v-btn>
        <v-btn
          class="add-button"
          color="primary"
          elevation="2"
          size="large"
          @click="addItem2"
        >
          <v-icon class="mr-2">mdi-plus-circle</v-icon>
          New 2
        </v-btn>
      </div>
    </div>

    <!-- Add Dialog -->
    <v-dialog v-model="showAddDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 pa-4"> Add New </v-card-title>

        <v-card-text class="pb-0">
          <v-radio-group v-model="addType" inline>
            <v-radio label="Notebook" value="notebook" />
            <v-radio label="Category" value="category" />
          </v-radio-group>

          <!-- Category Selection (only for notebooks) -->
          <v-select
            v-if="addType === 'notebook'"
            v-model="newItem.categoryId"
            class="mb-3"
            density="comfortable"
            item-title="title"
            item-value="id"
            :items="categoryOptions"
            label="Select Category"
            variant="outlined"
          />

          <!-- Title Input -->
          <v-text-field
            v-model="newItem.title"
            class="mb-3"
            density="comfortable"
            :label="
              addType === 'notebook' ? 'Notebook Title' : 'Category Title'
            "
            variant="outlined"
          />

          <!-- Cover Color (only for notebooks) -->
          <div v-if="addType === 'notebook'" class="mb-3">
            <label class="color-label">Cover Color</label>
            <div class="color-picker">
              <div
                v-for="color in colorOptions"
                :key="color"
                class="color-option"
                :class="{ selected: newItem.coverColor === color }"
                :style="{ backgroundColor: color }"
                @click="newItem.coverColor = color"
              />
            </div>
          </div>

          <!-- Bookmark Toggle (only for notebooks) -->
          <v-checkbox
            v-if="addType === 'notebook'"
            v-model="newItem.bookmarked"
            hide-details
            label="Bookmark this notebook"
          />
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="cancelAdd"> Cancel </v-btn>
          <v-btn
            color="primary"
            :disabled="!newItem.title"
            variant="flat"
            @click="addItem"
          >
            Add {{ addType === "notebook" ? "Notebook" : "Category" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Featured Notebook Banner -->
    <FeaturedBanner :notebook="featuredNotebook" @open="openNotebook" />

    <!-- View All Dialog -->
    <v-dialog v-model="showViewAllDialog" max-width="900px" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center pa-4">
          <span class="text-h5">{{ selectedCategory?.title }}</span>
          <v-spacer />
          <v-btn icon variant="text" @click="showViewAllDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          <div class="notebooks-grid">
            <NotebookCard
              v-for="notebook in selectedCategory?.notebooks"
              :key="notebook.id"
              :notebook="notebook"
              size="compact"
              @click="openNotebook"
            />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Categories and Notebooks -->
    <div v-for="category in filteredCategories" :key="category.id">
      <div class="category-header">
        <h2 class="category-title">
          {{ category.title }}
          <span v-if="searchQuery" class="result-count">
            ({{ category.notebooks.length }}
            {{ category.notebooks.length === 1 ? "notebook" : "notebooks" }})
          </span>
        </h2>
        <v-btn
          color="#23624d"
          size="small"
          variant="text"
          @click="viewAllNotebooks(category)"
        >
          View All
          <v-icon class="ml-1" size="18">mdi-arrow-right</v-icon>
        </v-btn>
      </div>

      <div class="scroll-row">
        <NotebookCard
          v-for="notebook in category.notebooks"
          :key="notebook.id"
          :notebook="notebook"
          @click="openNotebook"
        />
      </div>
    </div>

    <!-- No Results Message -->
    <div
      v-if="filteredCategories.length === 0 && searchQuery"
      class="no-results"
    >
      <v-icon color="grey" size="64">mdi-notebook-outline</v-icon>
      <p>No notebooks found matching "{{ searchQuery }}"</p>
    </div>
  </v-container>
</template>

<style scoped lang="scss">
.netflix-container {
  padding: 0;
  margin: 0;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.search-container {
  padding: 10px 16px 8px 16px;
  position: sticky;
  top: 0;
  background: #23624d;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
  max-width: 1000px;
  margin: 0 auto;
}

.custom-search-input {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 50px;
  padding: 0 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-icon {
  color: #23624d;
  margin-right: 10px;
  flex-shrink: 0;
  font-size: 20px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 8px 0;
  font-size: 0.9rem;
  color: #333;
  background: transparent;

  &::placeholder {
    color: #999;
  }
}

.clear-button {
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #999;

  &:hover {
    background: #f5f5f5;
    color: #666;
  }
}

.add-button {
  flex-shrink: 0;
  white-space: nowrap;
  border-radius: 50px !important;
  padding: 0 20px !important;
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.5px;
  height: 36px !important;
  font-size: 0.9rem;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 16px 8px 16px;
}

.add-button {
  flex-shrink: 0;
  white-space: nowrap;
}

.color-label {
  display: block;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 8px;
}

.color-picker {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.color-option {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
  }

  &.selected {
    border-color: #1976d2;
    box-shadow:
      0 0 0 2px white,
      0 0 0 4px #1976d2;
  }
}

.category-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #222;
  margin: 0;

  .result-count {
    font-size: 0.9rem;
    font-weight: 400;
    color: #666;
    margin-left: 8px;
  }
}

.notebooks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
  padding: 8px;
}

.scroll-row {
  display: flex;
  overflow-x: auto;
  overflow-y: visible;
  padding: 12px 16px 24px 16px;
  gap: 16px;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;

  p {
    margin-top: 16px;
    font-size: 1.1rem;
  }
}

@media (max-width: 600px) {
  .search-container {
    padding: 8px 12px 6px 12px;
  }

  .search-wrapper {
    flex-direction: column;
    gap: 8px;
  }

  .custom-search-input {
    width: 100%;
    padding: 0 12px;
  }

  .search-input {
    padding: 7px 0;
    font-size: 0.85rem;
  }

  .search-icon {
    font-size: 18px;
    margin-right: 8px;
  }

  .add-button {
    width: 100%;
    border-radius: 50px !important;
  }

  .category-header {
    margin: 12px 12px 6px 12px;
  }

  .category-title {
    font-size: 1.2rem;

    .result-count {
      font-size: 0.8rem;
    }
  }

  .notebooks-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }

  .scroll-row {
    padding: 8px 12px 16px 12px;
    gap: 12px;
  }

  .no-results p {
    font-size: 0.95rem;
  }
}
</style>
