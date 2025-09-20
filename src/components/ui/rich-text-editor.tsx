import React, { useRef } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Tapez votre texte ici..."
}) => {
  const editorRef = useRef<HTMLDivElement>(null)

  const formatText = (command: string) => {
    document.execCommand(command, false)
    editorRef.current?.focus()
  }

  const insertLineBreak = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const br = document.createElement('br')
      range.insertNode(br)
      range.setStartAfter(br)
      range.setEndAfter(br)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    editorRef.current?.focus()
  }

  const insertBullet = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const bullet = document.createTextNode('• ')
      range.insertNode(bullet)
      range.setStartAfter(bullet)
      range.setEndAfter(bullet)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    editorRef.current?.focus()
  }

  const insertDash = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const dash = document.createTextNode('— ')
      range.insertNode(dash)
      range.setStartAfter(dash)
      range.setEndAfter(dash)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    editorRef.current?.focus()
  }

  return (
    <div className="space-y-2">
      {/* Barre d'outils de formatage */}
      <div className="flex gap-1 p-2 bg-[#f5f5f0] border border-[#eacaae] rounded-md">
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="p-1 hover:bg-[#fbeee4] rounded text-[#421f17] font-bold text-sm"
          title="Gras"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="p-1 hover:bg-[#fbeee4] rounded text-[#421f17] italic text-sm"
          title="Italique"
        >
          I
        </button>
        <div className="w-px bg-[#eacaae] mx-1"></div>
        <button
          type="button"
          onClick={insertLineBreak}
          className="p-1 hover:bg-[#fbeee4] rounded text-[#421f17] text-sm"
          title="Saut de ligne"
        >
          ↵ 
        </button>
        <button
          type="button"
          onClick={insertBullet}
          className="p-1 hover:bg-[#fbeee4] rounded text-[#421f17] text-sm"
          title="Puce"
        >
          •
        </button>
        <button
          type="button"
          onClick={insertDash}
          className="p-1 hover:bg-[#fbeee4] rounded text-[#421f17] text-sm"
          title="Tiret"
        >
          —
        </button>
      </div>
      {/* Éditeur de texte */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[80px] p-3 bg-[#fbeee4] border border-[#eacaae] rounded-md text-[#421f17] text-sm focus:outline-none focus:ring-2 focus:ring-[#eacaae]"
        onInput={(e) => {
          const content = e.currentTarget.innerHTML
          onChange(content)
        }}
        dangerouslySetInnerHTML={{ __html: value || '' }}
        data-placeholder={placeholder}
      />
    </div>
  )
}
