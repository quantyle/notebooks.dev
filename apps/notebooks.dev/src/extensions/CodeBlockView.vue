<template>
  <NodeViewWrapper>
    <div class="codeblock-container">
      <div class="toolbar">
        <!-- Collapse / Expand -->
        <button class="collapse-btn" title="Expand/Collapse" @click="toggleCollapse">
          <component :is="collapsed ? PhCaretRight : PhCaretDown" size="16" weight="bold" />
        </button>

        <!-- Play -->
        <button
          class="play-btn"
          :disabled="!pyReady || running"
          title="Run this block"
          @click="runCurrentBlock"
        >
          <component :is="PhPlayCircle" :class="{ spinning: running }" size="18" />
        </button>

        <!-- Pause -->
        <button
          class="pause-btn"
          :disabled="!pyReady || !running"
          title="Stop execution"
          @click="pauseExecution"
        >
          <component :is="PhPauseCircle" size="18" />
        </button>

        <!-- 🗑 Delete -->
        <button
          class="delete-btn"
          title="Delete code block"
          @click="deleteCodeBlock"
        >
          <component :is="PhTrash" size="18" />
        </button>
      </div>

      <!-- Collapsed preview -->
      <div v-if="collapsed" class="collapsed-preview">
        <div class="line-count-bar">
          <span class="line-count-text">{{ lineCountLabel }}</span>
        </div>
        <pre class="ma-0 pa-0 pt-1" style="height: 30px">{{ firstLine }}</pre>
      </div>

      <!-- Expanded editor -->
      <div v-show="!collapsed" ref="mountEl" class="cm5-root" />

      <!-- Inline output -->
      <div v-if="outputVisible" class="output-panel">
        <!-- Output controls -->
        <div v-if="hasOutput" class="output-toolbar">
          <template v-if="image">
            <button class="output-btn" title="Save image" @click="saveImage">
              <component :is="PhFloppyDisk" size="16" />
            </button>
            <button class="output-btn" title="Delete image" @click="clearImage">
              <component :is="PhTrash" size="16" />
            </button>
          </template>
          <template v-else>
            <button class="output-btn" title="Copy output" @click="copyOutput">
              <component :is="PhCopy" size="16" />
            </button>
            <button class="output-btn" title="Clear output" @click="clearOutput">
              <component :is="PhXCircle" size="16" />
            </button>
          </template>
        </div>

        <div v-if="stdout" class="stdout"><pre>{{ stdout }}</pre></div>
        <div v-if="stderr" class="stderr"><pre>{{ stderr }}</pre></div>
        <img v-if="image" class="output-image" :src="image">
      </div>
    </div>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
  import type { Node as PMNode } from 'prosemirror-model'
  import type { EditorView as PMEditorView } from 'prosemirror-view'
  import {
    PhCaretDown,
    PhCaretRight,
    PhCopy,
    PhFloppyDisk,
    PhPauseCircle,
    PhPlayCircle,
    PhTrash,
    PhXCircle,
  } from '@phosphor-icons/vue'
  import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'
  import CodeMirror from 'codemirror'
  import { TextSelection } from 'prosemirror-state'
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

  import { usePython } from '@/composables'
  import 'codemirror/lib/codemirror.css'
  import 'codemirror/mode/python/python.js'
  import 'codemirror/addon/fold/foldcode.js'
  import 'codemirror/addon/fold/foldgutter.js'
  import 'codemirror/addon/fold/foldgutter.css'
  import 'codemirror/addon/fold/indent-fold.js'
  import 'codemirror/addon/edit/closebrackets.js'
  import 'codemirror/addon/comment/comment.js'
  import 'codemirror/addon/search/searchcursor.js'
  import 'codemirror/addon/dialog/dialog.js'
  import 'codemirror/addon/dialog/dialog.css'

  const props = defineProps(nodeViewProps)

  const mountEl = ref<HTMLDivElement | null>(null)
  let cm: CodeMirror.Editor | null = null
  let updating = false
  let incomingChanges = false

  // collapse / expand
  const collapsed = ref(false)
  const firstLine = ref('')
  const lineCount = ref(1)
  const lineCountLabel = computed(() => `[${lineCount.value}]`)

  // python runtime
  const py = usePython()
  const pyReady = computed(() => !!py && py.loaded?.value === true)

  // output state
  const running = ref(false)
  const stdout = ref('')
  const stderr = ref('')
  const image = ref<string | null>(null)
  const outputVisible = ref(false)
  const hasOutput = computed(() => !!stdout.value || !!stderr.value || !!image.value)

  onMounted(() => {
    if (!mountEl.value) return
    cm = CodeMirror(mountEl.value, {
      value: props.node.textContent,
      mode: 'python',
      lineNumbers: true,
      viewportMargin: Infinity,
      foldGutter: { rangeFinder: (CodeMirror as any).fold.indent },
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      extraKeys: codeMirrorKeymap(),
      historyEventDelay: 500,
    })
    updateFirstLine()
    updateLineCount()
    setTimeout(() => cm && cm.refresh(), 20)

    cm.on('beforeChange', () => (incomingChanges = true))
    cm.on('cursorActivity', () => {
      if (!updating && !incomingChanges) forwardSelection()
    })
    cm.on('changes', () => {
      if (!updating) {
        valueChanged()
        forwardSelection()
        updateFirstLine()
        updateLineCount()
      }
      incomingChanges = false
    })
    cm.on('focus', () => forwardSelection())

    // 👇 Listen for run-all events
    window.addEventListener('run-python-block', onRunAllPython)
  })

  onBeforeUnmount(() => {
    cm?.toTextArea?.()
    cm = null
    window.removeEventListener('run-python-block', onRunAllPython)
  })

  watch(collapsed, async v => {
    if (!v) await nextTick(() => cm?.refresh())
  })

  function toggleCollapse () {
    collapsed.value = !collapsed.value
    if (!collapsed.value) nextTick(() => cm?.focus())
  }

  function updateFirstLine () {
    firstLine.value = cm?.getValue().split('\n')[0] ?? ''
  }
  function updateLineCount () {
    lineCount.value = cm?.lineCount() ?? 1
  }

  // run/stop
  async function runCurrentBlock () {
    if (!cm) return
    if (!pyReady.value) {
      stderr.value = '⚠️ Python runtime not ready.'
      stdout.value = ''
      image.value = null
      outputVisible.value = true
      return
    }
    running.value = true
    stdout.value = ''
    stderr.value = ''
    image.value = null
    outputVisible.value = true
    try {
      const code = cm.getValue()
      const result = await py.runPythonCode(code)
      stdout.value = result.stdout
      stderr.value = result.stderr
      image.value = result.image
    } catch (error: any) {
      stderr.value = String(error)
    } finally {
      running.value = false
    }
  }

  function pauseExecution () {
    if (py?.interrupt) {
      py.interrupt()
      stderr.value = '⏸ Execution interrupted.'
    } else {
      stderr.value = '⏸ Cannot interrupt (not supported).'
    }
    running.value = false
    outputVisible.value = true
  }

  // 🗑 Delete code block
  function deleteCodeBlock () {
    const pos = props.getPos?.()
    if (pos == null) return
    const view = pmView()
    const tr = view.state.tr.deleteRange(pos, pos + props.node.nodeSize)
    view.dispatch(tr)
    view.focus()
  }

  // output controls
  function saveImage () {
    if (!image.value) return
    const a = document.createElement('a')
    a.href = image.value
    a.download = 'output.png'
    a.click()
  }
  function clearImage () {
    image.value = null
    outputVisible.value = !!stdout.value || !!stderr.value
  }
  function copyOutput () {
    const text = [stdout.value, stderr.value].filter(Boolean).join('\n')
    if (text) navigator.clipboard.writeText(text)
  }
  function clearOutput () {
    stdout.value = ''
    stderr.value = ''
    outputVisible.value = !!image.value
  }

  // pm integration (selection only)
  function pmView (): PMEditorView {
    return props.editor.view as unknown as PMEditorView
  }
  function forwardSelection () {
    if (!cm || !cm.hasFocus()) return
    const state = pmView().state
    const sel = asProseMirrorSelection(state.doc)
    if (!sel.eq(state.selection)) pmView().dispatch(state.tr.setSelection(sel))
  }
  function asProseMirrorSelection (doc: PMNode) {
    const offset = (props.getPos?.() ?? 0) + 1
    const anchor = cm!.indexFromPos(cm!.getCursor('anchor')) + offset
    const head = cm!.indexFromPos(cm!.getCursor('head')) + offset
    return TextSelection.create(doc, anchor, head)
  }

  // sync cm→pm text
  function valueChanged () {
    if (!cm) return
    const change = computeTextChange(props.node.textContent, cm.getValue())
    if (!change) return
    const start = (props.getPos?.() ?? 0) + 1
    const tr = pmView().state.tr.replaceWith(
      start + change.from,
      start + change.to,
      change.text ? pmView().state.schema.text(change.text) : [],
    )
    pmView().dispatch(tr)
  }

  // CodeMirror undo/redo
  function codeMirrorKeymap () {
    const mod = /Mac/.test(navigator.platform) ? 'Cmd' : 'Ctrl'
    return CodeMirror.normalizeKeyMap({
      'Ctrl-Enter': () => runCurrentBlock(),
      [`${mod}-Z`]: cm => cm.undo(),
      [`Shift-${mod}-Z`]: cm => cm.redo(),
      [`${mod}-Y`]: cm => cm.redo(),
    })
  }

  // sync pm→cm
  function update (newNode: PMNode) {
    if (newNode.type !== props.node.type) return false
    ;(props as any).node = newNode
    if (cm) {
      const val = newNode.textContent
      if (cm.getValue() !== val) {
        updating = true
        cm.setValue(val)
        updating = false
      }
    }
    updateFirstLine()
    updateLineCount()
    return true
  }
  function selectNode () {
    if (!collapsed.value) cm?.focus()
  }
  function stopEvent (e: Event) {
    if (e.type === 'keydown') {
      const k = e as KeyboardEvent
      if ((k.ctrlKey || k.metaKey) && (k.key.toLowerCase() === 'z' || k.key.toLowerCase() === 'y')) {
        return true
      }
    }
    return true
  }

  defineExpose({ update, selectNode, stopEvent })

  function computeTextChange (prev: string, curr: string) {
    if (prev === curr) return null
    let from = 0,
        to = prev.length,
        currTo = curr.length
    while (from < to && prev.charCodeAt(from) === curr.charCodeAt(from)) ++from
    while (to > from && currTo > from && prev.charCodeAt(to - 1) === curr.charCodeAt(currTo - 1)) {
      --to
      --currTo
    }
    return { from, to, text: curr.slice(from, currTo) }
  }

  /**
   * 🔁 Handle Run-All Inline Events
   */
  function onRunAllPython (e: CustomEvent) {
    const myPos = props.getPos?.()
    const eventPos = e.detail?.pos
    if (myPos == null || eventPos == null) return
    if (myPos === eventPos) {
      const res = e.detail.result
      stdout.value = res.stdout
      stderr.value = res.stderr
      image.value = res.image
      outputVisible.value = true
      running.value = false
    }
  }
</script>

<style scoped>
.codeblock-container {
  position: relative;
  //border: 1px solid rgba(127,127,127,0.25);
  overflow: hidden;
  margin-bottom: 8px;
}

.toolbar {
  position: absolute;
  top: 4px;
  right: 6px;
  display: flex;
  gap: 6px;
  z-index: 10;
}

.collapse-btn,
.play-btn,
.pause-btn,
.output-btn,
.delete-btn {
  background: rgba(255,255,255,0.85);
  border-radius: 6px;
  padding: 3px;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.collapse-btn:hover,
.play-btn:hover,
.pause-btn:hover,
.output-btn:hover,
.delete-btn:hover {
  background: rgba(255,255,255,1);
  transform: scale(1.05);
}
.play-btn:disabled,
.pause-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Output area */
.output-panel {
  position: relative;
  border-top: 1px solid rgba(127,127,127,0.25);
  background: #f8f9fa;
  padding: 8px;
  font-family: ui-monospace, monospace;
  font-size: 13px;
  white-space: pre-wrap;
}

.output-toolbar {
  position: absolute;
  top: 6px;
  right: 8px;
  display: flex;
  gap: 6px;
}

.stdout pre {
  color: #333;
  margin: 0;
}
.stderr pre {
  color: #d33;
  margin: 0;
}
.output-image {
  display: block;
  max-width: 720px;
  margin: 8px auto 0;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.collapsed-preview {
  background: #fafafa;
  display: flex;
  align-items: center;
  font-family: ui-monospace, monospace;
  font-size: 13px;
  white-space: pre-wrap;
  color: #333;
  position: relative;
  max-height: 32px;
}

.line-count-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  border-right: 1px solid rgba(127,127,127,0.3);
  background: rgba(245,245,245,0.9);
  transition: width 0.25s ease, opacity 0.25s ease;
}
.line-count-text {
  font-size: 12px;
  color: rgba(80,80,80,0.85);
}
.codeblock-container.collapsed .line-count-bar {
  width: 35px;
  opacity: 0.7;
}

.cm5-root :deep(.CodeMirror) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 1.5;
  background: transparent;
}
.cm5-root :deep(.CodeMirror-gutters) {
  background: transparent;
  border-right: 1px solid rgba(127,127,127,.25);
}
</style>
