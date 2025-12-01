<template>
  <div
    class="notebook-card"
    :class="{ compact: size === 'compact' }"
    @click="$emit('click', notebook)"
  >
    <div class="composition-cover" :style="{ backgroundColor: notebook.coverColor || '#1a1a1a' }">
      <div class="binding-edge" />
      <div v-if="notebook.bookmarked" class="bookmark-ribbon" />

      <div class="label-area">
        <div class="label-text">{{ notebook.title }}</div>
        <div class="label-date">{{ notebook.date }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
    size?: 'normal' | 'compact'
  }

  withDefaults(defineProps<Props>(), {
    size: 'normal',
  })

  defineEmits<{
    click: [notebook: Notebook]
  }>()
</script>

<style scoped lang="scss">
.notebook-card {
  min-width: 210px;
  max-width: 210px;
  height: 280px;
  border-radius: 0 8px 8px 0;
  //box-shadow: 0 2px 8px rgba(0,0,0,0.5);

  overflow: visible;
  scroll-snap-align: start;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15));

  &:hover {
    transform: scale(1.05) translateY(-4px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
    z-index: 10;
  }

  &.compact {
    min-width: 180px;
    max-width: 180px;
    height: 240px;

    .label-area {
      width: 110px;
      padding: 12px;
    }

    .label-text {
      font-size: 0.8rem;
      margin-bottom: 6px;
    }

    .label-date {
      font-size: 0.7rem;
    }

    .binding-edge {
      width: 18px;
    }

    .bookmark-ribbon {
      width: 24px;
      height: 40px;
      right: 20px;
    }
  }
}

.composition-cover {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 0 8px 8px 0;
}

.binding-edge {
  position: absolute;
  left: 0;
  top: 0;
  width: 22px;
  height: 100%;
  background: rgba(0,0,0,0.3);
  border-radius: 0;
}

.label-area {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 210px;
  padding: 16px;
  background: white;
}

.label-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.3;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.label-date {
  font-size: 0.75rem;
  color: #666;
}

.bookmark-ribbon {
  position: absolute;
  top: 0;
  right: 25px;
  width: 20px;
  height: 40px;
  background: #e53935;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%);

  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

@media (max-width: 600px) {
  .notebook-card {
    min-width: 160px;
    max-width: 160px;
    height: 220px;

    &.compact {
      min-width: 140px;
      max-width: 140px;
      height: 190px;
    }
  }

  .label-area {
    width: 160px;
    padding: 12px;
  }

  .label-text {
    font-size: 0.75rem;
    margin-bottom: 6px;
  }

  .label-date {
    font-size: 0.65rem;
  }

  .binding-edge {
    width: 12px;
  }

  .bookmark-ribbon {
    width: 24px;
    height: 40px;
    right: 18px;
  }
}
</style>
