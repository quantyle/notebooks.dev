import type { JSONContent } from '@tiptap/vue-3'

export const matplotlibSample: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Data Science Project' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Welcome to the Data Science Project documentation.' },
      ],
    },
    {
      type: 'codeBlock',
      attrs: { language: 'python' },
      content: [
        {
          type: 'text',
          text: `import matplotlib.pyplot as plt
import numpy as np

t = np.arange(0.0, 2.0, 0.01)
s = 1 + np.sin(2 * np.pi * t)

fig, ax = plt.subplots()
ax.plot(t, s)

ax.set(xlabel='time (s)', ylabel='voltage (mV)',
       title='Sine Wave Example')
ax.grid()
              `,
        },
      ],
    },
  ],
}
