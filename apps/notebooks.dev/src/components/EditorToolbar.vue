<template>
  <div
    class="d-flex align-center mt-1 pa-0 border-b-thin w-100 editor-toolbar"
  >
    <div class="w-100" :style="{ height: `${toolbarHeight}`, overflow: overflow }">
      <div ref="toolbarResizeRef" class="px-1 d-flex align-center flex-nowrap w-100">

        <!-- Undo button -->
        <v-btn
          v-tippy="{
            content: 'Undo',
            placement: 'bottom',
            delay: [250, 0],
          }"
          class="mr-1 mb-1"
          :color="'muted'"
          height="30"
          icon
          rounded
          variant="text"
          width="30"
          @click="undo"
        >
          <PhArrowUUpLeft size="20" />
        </v-btn>

        <!-- Redo button -->
        <v-btn
          v-tippy="{
            content: 'Redo',
            placement: 'bottom',
            delay: [250, 0],
          }"
          class="mr-2 mb-1"
          :color="'muted'"
          height="30"
          icon
          rounded
          variant="text"
          width="30"
          @click="redo"
        >
          <PhArrowUUpRight size="20" />
        </v-btn>

        <!-- Heading / Block type dropdown -->
        <ToolbarDropdown
          :items="blockDropdownItems"
          :label="currentBlockLabel"
          :prepend-icon="currentBlockIcon"
          tooltip="Block type"
          @select="handleBlockSelect"
        />

        <!-- Formatting buttons (responsive row) -->
        <div ref="toolsRowRef" class="d-flex align-center flex-nowrap tools-row overflow-hidden">
          <!-- Visible tools: supports both simple buttons and menu tools (color pickers) -->
          <template v-for="tool in visibleTools" :key="tool.name">
            <!-- Menu-style tool (e.g., color pickers) -->
            <v-menu v-if="tool.menu" :close-on-content-click="false" location="bottom">
              <template #activator="{ props }">
                <v-btn
                  v-tippy="{
                    content: tool.title,
                    placement: 'bottom',
                    delay: [250, 0],
                  }"
                  v-bind="props"
                  class="mr-1 mb-1"
                  :color="isActive(tool.check) ? 'info' : 'muted'"
                  height="30"
                  icon
                  rounded
                  variant="text"
                  width="30"
                >
                  <component :is="tool.icon" size="20" />
                </v-btn>
              </template>
              <ColorGridPicker
                v-model="tool.model"
                hide-inputs
                show-swatches
                swatches-max-height="100"
                width="200"
                @update:model-value="tool.handler"
              />
            </v-menu>

            <!-- Simple button tool -->
            <v-btn
              v-else
              v-tippy="{
                content: tool.title,
                placement: 'bottom',
                delay: [250, 0],
              }"
              :border="isActive(tool.check)"
              class="mr-1 mb-1"
              :class="isActive(tool.check)"
              :color="isActive(tool.check) ? 'info' : 'muted'"
              height="30"
              icon
              rounded
              variant="text"
              width="30"
              @click="tool.action()"
            >
              <component :is="tool.icon" size="20" />
            </v-btn>
          </template>

          <!-- Overflow toggle (only shown if we actually have overflow tools) -->
          <v-menu
            v-if="overflowTools.length > 0"
            v-model:opened="overflowOpen"
            :close-on-content-click="false"
            location="bottom"
            offset="6"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                class="ml-1 mb-1"
                color="muted"
                height="30"
                icon
                rounded
                variant="text"
                width="30"
              >
                <PhDotsThreeVertical size="20" />
              </v-btn>
            </template>

            <v-card class="pa-2 overflow-menu">
              <v-text-field
                ref="overflowSearchRef"
                v-model="searchQuery"
                autofocus
                density="compact"
                hide-details
                label="Search tools…"
                variant="outlined"
              />
              <div class="d-flex align-center flex-wrap mt-2">
                <!-- Overflow tools: also support menu tools -->
                <template v-for="tool in filteredOverflowTools" :key="tool.name">
                  <v-menu v-if="tool.menu" location="bottom">
                    <template #activator="{ props: menuProps }">
                      <v-btn
                        v-bind="menuProps"
                        class="mr-1 mb-1"
                        :close-on-content-click="false"
                        color="muted"
                        height="30"
                        icon
                        rounded
                        variant="text"
                        width="30"
                      >
                        <component :is="tool.icon" size="20" />
                      </v-btn>
                    </template>
                    <ColorGridPicker
                      v-model="tool.model"
                      hide-inputs
                      show-swatches
                      swatches-max-height="100"
                      width="200"
                      @update:model-value="tool.handler"
                    />
                  </v-menu>

                  <v-btn
                    v-else
                    class="mr-1 mb-1"
                    :color="isActive(tool.check) ? 'info' : 'muted'"
                    height="30"
                    icon
                    rounded
                    variant="text"
                    width="30"
                    @click="() => { tool.action(); overflowOpen = false }"
                  >
                    <component :is="tool.icon" size="20" />
                  </v-btn>
                </template>
              </div>
            </v-card>
          </v-menu>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Editor } from '@tiptap/vue-3'
  import type { DropdownItem } from './ToolbarDropdown.vue'
  import {
    PhArrowUUpLeft,
    PhArrowUUpRight,
    PhCodeBlock,
    PhDotsThreeVertical,
    PhEraser,
    PhHighlighterCircle,
    PhImageSquare,
    PhLinkSimple,
    PhListBullets,
    PhListNumbers,
    PhPalette,
    PhTextAlignLeft,
    PhTextBolder,
    PhTextHOne,
    PhTextHThree,
    PhTextHTwo,
    PhTextItalic,
    PhTextUnderline,
  } from '@phosphor-icons/vue'
  import { useResizeObserver } from '@vueuse/core'
  import { computed, markRaw, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'

  const props = defineProps<{ editor: Editor | null, interruptExecution?: () => void }>()
  const emit = defineEmits(['run-all'])

  const toolbarHeight = ref('auto')
  const overflow = ref<'hidden' | 'visible'>('hidden')
  const toolbarHasOverflow = ref(true)

  const toolbarResizeRef = useTemplateRef('toolbarResizeRef')
  const toolsRowRef = ref<HTMLElement | null>(null)

  useResizeObserver(toolbarResizeRef, entries => {
    const entry = entries[0]
    const { height } = entry.contentRect
    toolbarHasOverflow.value = height > 36
    // recalc tools on any toolbar resize
    queueToolsLayout()
  })

  function isActive (check: string | Record<string, any>) {
    const ed = props.editor
    if (!ed) return false
    if (typeof check === 'string') {
      return check === '' ? false : ed.isActive(check)
    }
    return ed.isActive(check.type, check.attrs)
  }

  /** ===== Code Block button ===== */
  const isCodeBlockActive = computed(() => props.editor?.isActive('codeBlock') || false)
  function toggleCodeBlock () {
    props.editor?.chain().focus().toggleCodeBlock().run()
  }

  /** ===== Undo/Redo buttons ===== */
  function undo () {
    props.editor?.chain().focus().undo().run()
  }
  function redo () {
    props.editor?.chain().focus().redo().run()
  }

  /** ===== Block options (with code block included) ===== */
  const blockOptions = computed(() => {
    const ed = props.editor
    const noop = () => {}
    if (!ed) {
      return [
        { key: 'h1', label: 'Heading 1', icon: markRaw(PhTextHOne), active: () => false, action: noop },
        { key: 'h2', label: 'Heading 2', icon: markRaw(PhTextHTwo), active: () => false, action: noop },
        { key: 'h3', label: 'Heading 3', icon: markRaw(PhTextHThree), active: () => false, action: noop },
        { key: 'h4', label: 'Subtitle', icon: markRaw(PhTextHThree), active: () => false, action: noop },
        { key: 'p', label: 'Paragraph', icon: markRaw(PhTextAlignLeft), active: () => false, action: noop },
        { key: 'h6', label: 'Caption', icon: markRaw(PhTextAlignLeft), active: () => false, action: noop },
        { key: 'cb', label: 'Code Block', icon: markRaw(PhCodeBlock), active: () => false, action: noop },
      ]
    }
    return [
      { key: 'h1', label: 'Heading 1', icon: markRaw(PhTextHOne), active: () => ed.isActive('heading', { level: 1 }), action: () => ed.chain().focus().toggleHeading({ level: 1 }).run() },
      { key: 'h2', label: 'Heading 2', icon: markRaw(PhTextHTwo), active: () => ed.isActive('heading', { level: 2 }), action: () => ed.chain().focus().toggleHeading({ level: 2 }).run() },
      { key: 'h3', label: 'Heading 3', icon: markRaw(PhTextHThree), active: () => ed.isActive('heading', { level: 3 }), action: () => ed.chain().focus().toggleHeading({ level: 3 }).run() },
      { key: 'h4', label: 'Subtitle', icon: markRaw(PhTextHThree), active: () => ed.isActive('heading', { level: 4 }), action: () => ed.chain().focus().toggleHeading({ level: 4 }).run() },
      { key: 'p', label: 'Paragraph', icon: markRaw(PhTextAlignLeft), active: () => ed.isActive('paragraph'), action: () => ed.chain().focus().setParagraph().run() },
      { key: 'h6', label: 'Caption', icon: markRaw(PhTextAlignLeft), active: () => ed.isActive('heading', { level: 6 }), action: () => ed.chain().focus().toggleHeading({ level: 6 }).run() },
      { key: 'cb', label: 'Code Block', icon: markRaw(PhCodeBlock), active: () => ed.isActive('codeBlock'), action: () => ed.chain().focus().toggleCodeBlock().run() },
    ]
  })

  const currentBlockIcon = computed(() => {
    const opts = blockOptions.value
    const active = opts.find(o => o.active())
    return active?.icon ?? PhTextAlignLeft
  })
  const currentBlockLabel = computed(() => {
    const opts = blockOptions.value
    const active = opts.find(o => o.active())
    return active?.label ?? 'Body Text'
  })

  // Convert blockOptions to DropdownItem format
  const blockDropdownItems = computed<DropdownItem[]>(() =>
    blockOptions.value.map(opt => ({
      key: opt.key,
      label: opt.label,
      active: opt.active(),
      icon: opt.icon,
    })),
  )

  // Handle block selection
  function handleBlockSelect (item: DropdownItem) {
    const option = blockOptions.value.find(o => o.key === item.key)
    if (option) {
      option.action()
    }
  }

  /** ===== Inline / list tools (now includes color pickers via menu) ===== */
  const selectedTextColor = ref('#000000')
  const selectedHighlightColor = ref('#ffff00')

  function applyTextColor (color: string) {
    const ed = props.editor
    if (!ed) return
    ed.chain().focus().setColor(color).run()
  }

  function applyHighlightColor (color: string) {
    const ed = props.editor
    if (!ed) return
    ed.chain().focus().setHighlight({ color }).run()
  }

  const tools = computed(() => {
    const ed = props.editor
    if (!ed) return []
    return [
      // Removed undo/redo from here since they're now standalone buttons
      { name: 'bold', title: 'Bold', icon: markRaw(PhTextBolder), check: 'bold', action: () => ed.chain().focus().toggleBold().run() },
      { name: 'italic', title: 'Italic', icon: markRaw(PhTextItalic), check: 'italic', action: () => ed.chain().focus().toggleItalic().run() },
      { name: 'underline', title: 'Underline', icon: markRaw(PhTextUnderline), check: 'underline', action: () => ed.chain().focus().toggleUnderline().run() },
      { name: 'bulletList', title: 'Bullet List', icon: markRaw(PhListBullets), check: 'bulletList', action: () => ed.chain().focus().toggleBulletList().run() },
      { name: 'orderedList', title: 'Ordered List', icon: markRaw(PhListNumbers), check: 'orderedList', action: () => ed.chain().focus().toggleOrderedList().run() },
      { name: 'link', title: 'Insert Link', icon: markRaw(PhLinkSimple), check: 'link', action: () => {
        const url = window.prompt('Enter URL', 'https://')
        if (url) ed.chain().focus().setLink({ href: url }).run()
      } },
      { name: 'image', title: 'Insert Image', icon: markRaw(PhImageSquare), check: '', action: () => {
        const url = window.prompt('Enter Image URL', 'https://')
        if (url) ed.chain().focus().setImage({ src: url }).run()
      } },
      // Color pickers integrated as menu tools
      { name: 'textColor', title: 'Text Color', icon: markRaw(PhPalette), check: 'textColor', menu: true, model: selectedTextColor, handler: applyTextColor },
      { name: 'highlightColor', title: 'Highlight Color', icon: markRaw(PhHighlighterCircle), check: 'highlightColor', menu: true, model: selectedHighlightColor, handler: applyHighlightColor },
    ]
  })

  /** ===== Responsive overflow handling for tools ===== */
  const visibleTools = ref<any[]>([])
  const overflowTools = ref<any[]>([])
  const overflowOpen = ref(false)
  const searchQuery = ref('')
  const overflowSearchRef = ref()

  // focus search when menu opens
  watch(overflowOpen, async open => {
    if (open) {
      searchQuery.value = ''
      await nextTick()
      try {
        (overflowSearchRef.value as any)?.focus?.()
      } catch {}
    }
  })

  // recompute on tools list change
  watch(() => tools.value, () => queueToolsLayout(), { deep: true })

  // recompute on window resize
  const onWinResize = () => queueToolsLayout()
  onMounted(() => {
    queueToolsLayout()
    window.addEventListener('resize', onWinResize, { passive: true })
  })
  onUnmounted(() => {
    window.removeEventListener('resize', onWinResize)
  })

  let layoutRaf: number | null = null
  function queueToolsLayout () {
    if (layoutRaf) cancelAnimationFrame(layoutRaf)
    layoutRaf = requestAnimationFrame(() => {
      layoutRaf = null
      updateVisibleOverflow()
    })
  }

  function updateVisibleOverflow () {
    if (!toolsRowRef.value) {
      visibleTools.value = tools.value
      overflowTools.value = []
      return
    }

    // Reserve space for the overflow button when needed (~36px)
    const row = toolsRowRef.value
    const rowWidth = row.clientWidth
    if (rowWidth <= 0) {
      visibleTools.value = tools.value
      overflowTools.value = []
      return
    }

    const BTN_W = 34 // approx single icon button width incl. margins
    const OVERFLOW_W = 36

    const tempVisible: any[] = []
    const tempOverflow: any[] = []

    // First pass: assume no overflow button needed, pack as many as possible
    let used = 0
    for (const tool of tools.value) {
      if (used + BTN_W <= rowWidth) {
        tempVisible.push(tool)
        used += BTN_W
      } else {
        tempOverflow.push(tool)
      }
    }

    // If we do have overflow, ensure we make room for the overflow button itself
    if (tempOverflow.length > 0 && used + OVERFLOW_W > rowWidth) {
      // Move one visible tool into overflow to free space for the overflow button
      const moved = tempVisible.pop()
      if (moved) tempOverflow.unshift(moved)
    }

    visibleTools.value = tempVisible
    overflowTools.value = tempOverflow
  }

  const filteredOverflowTools = computed(() =>
    overflowTools.value.filter(t => t.title.toLowerCase().includes(searchQuery.value.toLowerCase())),
  )
</script>

<style scoped lang="scss">
.editor-toolbar {
  height: 37px;
}

.tools-row {
  flex: 1 1 auto;
  min-width: 120px;
}

/* Keep toolbar from growing in height */
:deep(.v-btn.mb-1),
:deep(.v-btn.mr-1) {
  margin-bottom: 4px !important;
}

/* Overflow menu */
.overflow-menu {
  min-width: 260px;
  max-height: 420px;
  overflow-y: auto;
}

/* The switch - the box around the slider (unchanged) */
.switch {
  font-size: 17px;
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  --background: rgba(255, 255, 255, 0);
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--background);
  transition: 0.5s;
  border-radius: 30px;
  border: 1px solid rgba(var(--v-theme-primary));
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  border-radius: 50%;
  left: 10%;
  bottom: 15%;
  box-shadow: inset 6px -2px 0px 0px #424242;
  background: var(--background);
  transition: 0.5s;
}

input:checked + .slider {
  background-color: rgba(71, 60, 98, 0);
}

input:checked + .slider:before {
  transform: translateX(100%);
  box-shadow: inset 15px -4px 0px 15px #424242;
}
</style>
