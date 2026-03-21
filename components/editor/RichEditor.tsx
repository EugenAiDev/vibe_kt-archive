"use client"

import { useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { extractTextFromDoc } from "@/lib/tiptap"

type RichEditorValue = Record<string, unknown> | null

type RichEditorProps = {
  value: RichEditorValue
  onChange: (next: { json: RichEditorValue; text: string }) => void
}

const EMPTY_DOC = { type: "doc", content: [] }

export function RichEditor({ value, onChange }: RichEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value ?? EMPTY_DOC,
    immediatelyRender: false,
    onUpdate({ editor: instance }) {
      const json = instance.getJSON()
      const text = extractTextFromDoc(json)
      onChange({ json, text })
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.commands.setContent(value ?? EMPTY_DOC)
  }, [editor, value])

  if (!editor) return null

  return (
    <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] p-3 text-sm">
      <EditorContent editor={editor} />
    </div>
  )
}
