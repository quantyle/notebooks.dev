<template>
  <v-menu elevation="0" location="bottom">
    <template #activator="{ props }">
      <v-btn
        v-tippy="{
          content: tooltip,
          placement: 'bottom',
          delay: [250, 0],
        }"
        v-bind="props"
        class="mr-2 mb-1"
        color="muted"
        height="30"
        variant="text"
      >
        <template v-if="prependIcon" #prepend>
          <component :is="prependIcon" class="mr-1" />
        </template>
        <span class="text-caption" :class="labelClass" :style="labelStyle">
          {{ label }}
        </span>
        <template #append>
          <PhCaretDown />
        </template>
      </v-btn>
    </template>

    <v-container
      class="d-flex flex-column pa-0 bg-background-dark border-thin rounded-lg overflow-hidden"
      density="compact"
      elevation="1"
      :min-width="minWidth"
      variant="tonal"
    >
      <v-list-item
        v-for="item in items"
        :key="item.key"
        :active="item.active"
        class="text-subtitle-2"
        density="compact"
        rounded="0"
        variant="text"
        @click="$emit('select', item)"
      >
        <template v-if="item.icon" #prepend>
          <component :is="item.icon" />
        </template>
        <span class="ml-2" :style="item.style">
          {{ item.label }}
        </span>
      </v-list-item>
    </v-container>
  </v-menu>
</template>

<script setup lang="ts">
  import type { Component } from 'vue'
  import { PhCaretDown } from '@phosphor-icons/vue'

  export interface DropdownItem {
    key: string
    label: string
    active: boolean
    icon?: Component
    style?: Record<string, string>
  }

  interface Props {
    tooltip: string
    label: string
    items: DropdownItem[]
    prependIcon?: Component
    minWidth?: string | number
    labelClass?: string
    labelStyle?: Record<string, string>
  }

  withDefaults(defineProps<Props>(), {
    minWidth: 140,
    labelClass: '',
    labelStyle: () => ({}),
  })

  defineEmits<{
    select: [item: DropdownItem]
  }>()
</script>
