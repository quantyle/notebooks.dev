import type { Editor } from '@tiptap/vue-3'

export type EditorActions = Record<string, () => void>

export function useEditorActions (editor: Editor | null): EditorActions {
  const insertCodeBlock = () => {
    editor
      ?.chain()
      .focus()
      .setNode('codeBlock', { language: 'python' })
      .insertContent('print("Hello, world!")')
      .run()
  }

  const promptFor = (message: string): string | null => {
    if (typeof window === 'undefined') {
      return null
    }
    return window.prompt(message)
  }

  const insertLink = () => {
    const url = promptFor('Enter URL')
    if (!url) {
      return
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const insertImage = () => {
    const url = promptFor('Image URL')
    if (!url) {
      return
    }
    editor?.chain().focus().setImage({ src: url, alt: 'Image' }).run()
  }

  return {
    undo: () => editor?.chain().focus().undo().run(),
    redo: () => editor?.chain().focus().redo().run(),

    h1: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    h2: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    h3: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),

    bold: () => editor?.chain().focus().toggleBold().run(),
    italic: () => editor?.chain().focus().toggleItalic().run(),
    underline: () => editor?.chain().focus().toggleUnderline().run(),
    strike: () => editor?.chain().focus().toggleStrike().run(),

    bullet: () => editor?.chain().focus().toggleBulletList().run(),
    ordered: () => editor?.chain().focus().toggleOrderedList().run(),
    quote: () => editor?.chain().focus().toggleBlockquote().run(),

    codeblock: () => editor?.chain().focus().toggleCodeBlock({ language: 'python' }).run(),
    py: () => insertCodeBlock(),

    alignLeft: () => editor?.chain().focus().setTextAlign('left').run(),
    alignCenter: () => editor?.chain().focus().setTextAlign('center').run(),
    alignRight: () => editor?.chain().focus().setTextAlign('right').run(),
    alignJustify: () => editor?.chain().focus().setTextAlign('justify').run(),

    link: () => insertLink(),
    image: () => insertImage(),
  }
}
