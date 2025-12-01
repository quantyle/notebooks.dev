// python.ts
import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v0.28.0/full/pyodide.mjs'

let pyodide: any

const DANGEROUS_BUILTINS = ['js', 'exec', 'open', 'input', 'exit', 'quit', 'help']

async function sanitizeEnvironment () {
  const removeDangerous = `
for name in ${JSON.stringify(DANGEROUS_BUILTINS)}:
    globals()[name] = None
del name
`
  await pyodide.runPythonAsync(removeDangerous)
}

async function setupMatplotlib () {
  // Load base packages compiled for Pyodide
  await pyodide.loadPackage(['numpy', 'matplotlib', 'pandas'])

  // Use a headless backend that works in a Worker
  await pyodide.runPythonAsync(`
import matplotlib
matplotlib.use("Agg")  # headless backend for Workers
import matplotlib.pyplot as plt
`)
}

(async function init () {
  pyodide = await loadPyodide({
    fullStdLib: true,
    stdout: (text: string) => self.postMessage({ type: 'stdout', data: text }),
    stderr: (text: string) => self.postMessage({ type: 'stderr', data: text }),
  })

  // ❌ remove matplotlib-pyodide install (needs window.document)
  // await pyodide.loadPackage("micropip");
  // await pyodide.runPythonAsync(`
  // import micropip
  // await micropip.install("matplotlib-pyodide")
  // `);

  await setupMatplotlib()

  self.postMessage({ type: 'ready' })
})()

self.onmessage = async e => {
  const { code, timeout = 10_000 } = e.data

  try {
    await sanitizeEnvironment()

    // fresh slate for figures each run
    await pyodide.runPythonAsync('import matplotlib.pyplot as plt; plt.close(\'all\')')

    const result = await pyodide.runPythonAsync(code)

    // Try to capture a plot if there is one
    const imgProxy = await pyodide.runPythonAsync(`
import io, base64, matplotlib.pyplot as plt
images = []
for num in plt.get_fignums():
    fig = plt.figure(num)
    buf = io.BytesIO()
    fig.savefig(buf, format='png', dpi=144, bbox_inches='tight')
    buf.seek(0)
    images.append(base64.b64encode(buf.read()).decode('utf-8'))
images
`)

    // Convert PyProxy -> JS array
    let images: string[] = []
    if (imgProxy && typeof imgProxy.toJs === 'function') {
      images = imgProxy.toJs({ deep: true }) as string[]
      // Avoid leaking proxies
      if (typeof imgProxy.destroy === 'function') {
        imgProxy.destroy()
      }
    }

    // Choose last figure if any
    const lastImage = images.length > 0 ? images.at(-1) : null
    console.log('lastImage len:', lastImage?.length ?? 0)

    self.postMessage({
      type: 'result',
      result: String(result ?? ''),
      image: lastImage,
    })
  } catch (error: any) {
    self.postMessage({ type: 'error', error: String(error?.message || error) })
  }
}
