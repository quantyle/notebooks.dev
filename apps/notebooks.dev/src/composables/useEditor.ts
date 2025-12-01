// useEditor.ts
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { Color, FontFamily, FontSize, TextStyle } from '@tiptap/extension-text-style'
import StarterKit from '@tiptap/starter-kit'
import { Editor, type JSONContent } from '@tiptap/vue-3'
import { onBeforeUnmount } from 'vue'
import { useEditorActions } from '@/composables/useEditorActions'
import CodeBlockNode from '@/extensions/CodeBlockNode.ts'

export function useEditor (initialContent: JSONContent) {
  const editor = new Editor({
    content: initialContent,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] }, codeBlock: false, link: false }),
      Placeholder.configure({ placeholder: 'Start typing…' }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      CodeBlockNode,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily,
      FontSize,
      Image,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    editorProps: { attributes: { class: 'tiptap prose' } },
  })

  const actions = useEditorActions(editor)

  onBeforeUnmount(() => editor?.destroy())

  return { editor, actions }
}
