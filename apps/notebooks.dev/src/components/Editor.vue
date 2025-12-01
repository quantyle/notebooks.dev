<template>
  <div class="editor">
    <EditorToolbar
      :actions="actions"
      :editor="editor"
      @run-all="py.runAllInlinePythonBlocks(editor)"
    />
    <v-container class="flex-grow-1 d-flex flex-column min-h-0 overflow-scroll position-relative" fluid style="border: 1px solid red">
      <EditorContent
        class="tiptap prose flex-grow-1 min-h-0"
        :class="editorTheme"
        :editor="editor!"
      />
    <!--    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%">-->
    <!--      <VuePaintSample />-->
    <!--    </div>-->
    </v-container>
  </div>
</template>

<script setup lang="ts">
  import { EditorContent } from '@tiptap/vue-3'

  import { storeToRefs } from 'pinia'
  import { onBeforeUnmount } from 'vue'
  import EditorToolbar from '@/components/EditorToolbar.vue'
  import { useEditor } from '@/composables/useEditor.ts'
  import { usePython } from '@/composables/usePython.ts'
  import { matplotlibSample } from '@/constants/samples.ts'
  import { useAppStore } from '@/stores/app.ts'

  const appStore = useAppStore()
  const { editorTheme } = storeToRefs(appStore)
  const { editor, actions } = useEditor(matplotlibSample)

  const py = usePython()

  onBeforeUnmount(() => {
    py.shutdown()
  })
</script>

<style lang="scss">
@use "@/styles/tiptap/index";
@use "@/styles/tiptap/codeblock";
.editor {
  background: white;
  height: 100%;
  overflow: auto;
}
</style>
