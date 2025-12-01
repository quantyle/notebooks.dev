// CodeBlockNode.ts
import { mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import CodeBlockView from '@/extensions/CodeBlockView.vue'

export default Node.create({
  name: 'codeBlock',
  group: 'block',
  content: 'text*',
  marks: '',
  code: true,
  defining: true,
  isolating: false,
  selectable: false,

  addAttributes () {
    return {
      language: {
        default: 'python',
        parseHTML: element => element.dataset.language || 'python',
        renderHTML: attributes => ({
          'data-language': attributes.language,
        }),
      },
    }
  },

  parseHTML () {
    return [{ tag: 'pre', preserveWhitespace: 'full' }]
  },

  renderHTML ({ HTMLAttributes }) {
    return ['pre', mergeAttributes(HTMLAttributes), ['code', 0]]
  },

  addCommands () {
    return {
      setCodeBlock:
        attributes =>
          ({ commands }) => {
            return commands.insertContent({
              type: this.name,
              attrs: attributes,
            })
          },
      toggleCodeBlock:
        attributes =>
          ({ editor, commands }) => {
            const isActive = editor.isActive(this.name)
            if (isActive) {
              return commands.setParagraph()
            }
            return commands.insertContent({
              type: this.name,
              attrs: attributes,
            })
          },
    }
  },

  addKeyboardShortcuts () {
    return {
      'Mod-Alt-c': () => this.editor.commands.toggleCodeBlock({ language: 'python' }),
    }
  },

  addNodeView () {
    return VueNodeViewRenderer(CodeBlockView)
  },
})
