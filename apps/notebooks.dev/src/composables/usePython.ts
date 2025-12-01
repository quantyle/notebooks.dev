// usePython.ts
import type { Editor } from '@tiptap/core'
import { computed, ref } from 'vue'

/* ------------------------------------------------------
   Types
------------------------------------------------------ */
type WorkerMessage
  = | { type: 'ready' }
    | { type: 'stdout', data: string }
    | { type: 'stderr', data: string }
    | { type: 'result', result: string, image?: string | null }
    | { type: 'error', error: string }

type PyRunResult = {
  stdout: string
  stderr: string
  image?: string | null
}

/* ------------------------------------------------------
   Singleton container
------------------------------------------------------ */
let instance: ReturnType<typeof createPythonRuntime> | null = null
export function usePython () {
  if (!instance) {
    instance = createPythonRuntime()
  }
  return instance
}

/* ------------------------------------------------------
   Main factory — clean + modular runtime
------------------------------------------------------ */
function createPythonRuntime () {
  /* -------------------- State -------------------- */
  const output = ref<string[]>([])
  const error = ref<string[]>([])
  const ready = ref(false)
  const loaded = ref(false)
  const busy = ref(false)
  const plotImage = ref<string | null>(null)
  const lastResult = ref<PyRunResult | null>(null)

  let worker: Worker | null = null
  let initializing = false

  /* ------------------------------------------------------
     Worker: lifecycle
  ------------------------------------------------------ */
  function startWorker () {
    if (worker || initializing) {
      return
    }
    initializing = true

    worker = createWorker()
    worker.onmessage = handleMessage
  }

  function shutdown () {
    if (worker) {
      try {
        worker.terminate()
      } catch (error_) {
        console.warn('Failed to terminate worker:', error_)
      }
    }

    worker = null
    initializing = false
    resetState()
  }

  function createWorker (): Worker {
    return new Worker(new URL('@/workers/python.ts', import.meta.url), {
      type: 'module',
    })
  }

  /* ------------------------------------------------------
     Worker: message handler
  ------------------------------------------------------ */
  function handleMessage (e: MessageEvent<WorkerMessage>) {
    const msg = e.data

    switch (msg.type) {
      case 'ready': {
        ready.value = true
        loaded.value = true
        initializing = false
        output.value = []
        break
      }

      case 'stdout': {
        output.value.push(msg.data)
        break
      }

      case 'stderr': {
        error.value.push(msg.data)
        break
      }

      case 'result': {
        finalizeExecution(msg.image ?? null)
        break
      }

      case 'error': {
        finalizeExecution(null, msg.error)
        break
      }
    }
  }

  /* ------------------------------------------------------
     Execution helpers
  ------------------------------------------------------ */
  function resetState () {
    ready.value = false
    loaded.value = false
    busy.value = false
    output.value = []
    error.value = []
    plotImage.value = null
    lastResult.value = null
  }

  function ensureActive () {
    if (!worker) {
      startWorker()
    }
  }

  function sendToWorker (code: string, timeout: number) {
    ensureActive()

    if (!worker || !ready.value) {
      console.warn('Worker not ready')
      return
    }
    if (busy.value) {
      console.warn('Python is already running')
      return
    }

    // reset
    output.value = []
    error.value = []
    lastResult.value = null
    plotImage.value = null

    busy.value = true
    worker.postMessage({ code, timeout })
  }

  async function waitForExecution (): Promise<void> {
    return new Promise(resolve => {
      const interval = setInterval(() => {
        if (!busy.value) {
          clearInterval(interval)
          resolve()
        }
      }, 30)
    })
  }

  function finalizeExecution (imageBase64: string | null, errorMsg?: string) {
    const stdout = output.value.join('')
    const stderr = errorMsg ?? error.value.join('')

    const img = imageBase64
      ? `data:image/png;base64,${imageBase64}`
      : null

    plotImage.value = img

    lastResult.value = { stdout, stderr, image: img }
    busy.value = false
  }

  /* ------------------------------------------------------
     Public: Python execution
  ------------------------------------------------------ */
  async function runPythonCode (code: string) {
    if (!code.trim()) {
      return { stdout: '', stderr: '', image: null }
    }

    sendToWorker(code, 8000)
    await waitForExecution()

    return lastResult.value ?? {
      stdout: output.value.join(''),
      stderr: error.value.join(''),
      image: plotImage.value,
    }
  }

  async function runAllInlinePythonBlocks (editor: Editor) {
    ensureActive()

    const blocks: { pos: number, node: any }[] = []

    editor.state.doc.descendants((node, pos) => {
      if (node.type.name !== 'codeBlock') {
        return
      }
      const lang = (node.attrs as any).language || 'python'
      if (lang === 'python') {
        blocks.push({ pos, node })
      }
    })

    for (const { pos, node } of blocks) {
      const code = node.textBetween(0, node.content.size, '\n', '\n')
      if (!code.trim()) {
        continue
      }

      const result = await runPythonCode(code)

      window.dispatchEvent(
        new CustomEvent('run-python-block', {
          detail: { pos, result },
        }),
      )
    }
  }

  function interrupt () {
    if (worker && ready.value) {
      worker.postMessage({ type: 'interrupt' })
      busy.value = false
    }
  }

  /* ------------------------------------------------------
     Computed
  ------------------------------------------------------ */
  const hasOutput = computed(() =>
    Boolean(
      lastResult.value?.stdout
      || lastResult.value?.stderr
      || lastResult.value?.image,
    ),
  )

  /* ------------------------------------------------------
     Auto-start the worker on first use
  ------------------------------------------------------ */
  startWorker()

  /* ------------------------------------------------------
     Public API
  ------------------------------------------------------ */
  return {
    runPythonCode,
    runAllInlinePythonBlocks,
    interrupt,
    shutdown,
    startWorker,

    output,
    error,
    ready,
    loaded,
    busy,
    plotImage,
    lastResult,
    hasOutput,
  }
}
