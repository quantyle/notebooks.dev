<template>
  <div class="featured-banner">
    <v-container class="pa-0" fluid>
      <v-row>
        <v-col>
          <div class="featured-info">
            <div class="featured-badge">
              <v-icon class="mr-1" size="16">mdi-star</v-icon>
              Featured
            </div>
            <h1 class="featured-title">{{ notebook.title }}</h1>
            <p class="featured-preview">{{ notebook.preview }}</p>
            <span class="featured-date">
              <v-icon class="mr-1" size="16">mdi-calendar</v-icon>
              {{ notebook.date }}
            </span>

            <v-btn
              class="featured-button mt-4"
              color="white"
              size="large"
              variant="flat"
              @click="$emit('open', notebook)"
            >
              <v-icon class="mr-2">mdi-book-open-variant</v-icon>
              Open Notebook
            </v-btn>
          </div>

        </v-col>
        <v-col class="pa-0">
          <!--          <div class="device-frame">-->
          <!--            <div class="device-screen">-->
          <!--              <Editor />-->
          <!--            </div>-->
          <!--          </div>-->
          <NotebookCard
            :notebook="notebook"
            @click="$emit('open', notebook)"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
  import Editor from '@/components/Editor.vue'
  import NotebookCard from '@/components/NotebookCard.vue'

  interface Notebook {
    id: number
    title: string
    coverColor: string
    date: string
    bookmarked: boolean
    preview?: string
  }

  interface Props {
    notebook: Notebook
  }

  defineProps<Props>()

  defineEmits<{
    open: [notebook: Notebook]
  }>()
</script>

<style scoped lang="scss">

.device-frame {
  width: 100%;
  max-width: 1800px;
  margin: 0 auto 50px auto;
  padding: 15px;
  background: #2a2a2a;
  border-radius: 24px;
  box-shadow:
    0 10px 30px rgba(0,0,0,0.15),
    inset 0 0 8px rgba(255,255,255,0.1);
  position: relative;
}

.device-screen {
  background: white;
  border-radius: 12px;
  border: 2px solid #d1d1d1;
  overflow: auto;
  //max-height: 650px;
  height: 100%;
}

.featured-banner {
  background: linear-gradient(135deg, #23624d 0%, #1a4d3d 100%);
  //padding: 40px 20px;
  margin: 0 0 24px 0;
}

.featured-info {
  flex: 1;
  color: white;
}

.featured-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 16px;
  backdrop-filter: blur(10px);
}

.featured-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.2;
}

.featured-preview {
  font-size: 1.1rem;
  line-height: 1.6;
  opacity: 0.95;
  margin-bottom: 20px;
}

.featured-meta {
  display: flex;
  gap: 24px;
  font-size: 0.95rem;
  opacity: 0.9;
  margin-bottom: 8px;
}

.featured-date,
.featured-bookmark {
  display: flex;
  align-items: center;
}

.featured-button {
  color: #23624d !important;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  padding: 0 32px !important;
}

.featured-notebook {
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .featured-banner {
    padding: 24px 16px;
  }

  .featured-title {
    font-size: 1.8rem;
  }

  .featured-preview {
    font-size: 1rem;
  }

  .featured-meta {
    flex-direction: column;
    gap: 8px;
  } }
</style>
