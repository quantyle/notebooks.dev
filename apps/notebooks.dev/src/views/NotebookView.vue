<script setup lang="ts">
  import { Panel, PanelGroup, PanelResizeHandle } from 'vue-resizable-panels'
  import Editor from '@/components/Editor.vue'
</script>

<template>
  <PanelGroup class="workspace-panels" direction="horizontal">
    <Panel :default-size="20">
      3
    </Panel>
    <PanelResizeHandle class="resize-handle-horizontal" />
    <Panel>
      <Editor />
    </Panel>
  </PanelGroup>
</template>

<style scoped lang="scss">
.resize-handle-horizontal { position: relative; width: 1px; background: rgb(var(--v-theme-border)); cursor: ew-resize !important; z-index: 1; }
.resize-handle-horizontal::before { content: ""; position: absolute; top: -12px; bottom: -12px; left: -5px; right: -5px; cursor: inherit; z-index: -1; }
.resize-handle-horizontal:hover { background: rgba(var(--v-theme-primary), 0.8); }
</style>
