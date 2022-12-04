import React from 'react'
import { Editor } from '@tiptap/react'
import * as ri from 'react-icons/ri'

interface IEditorProps {
  editor: Editor | null
  save: () => any // for save functionality
}

export const CommentTextMenu = (props: IEditorProps) => {
  const { editor, save } = props
  if (!editor) {
    return null
  }
  // Adds all of the functionality for a rich text editor!
  // Supports: Bold, italic, strike, code, highlight, bullet list, super/sub-script
  // Setting "title":  allows more info to appear on icon hover
  // Uses icons instead of text for the buttons
  return (
    <div id="textMenu">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        title="Bold"
        className={
          editor.isActive('bold') ? 'active-textEditorButton' : 'textEditorButton'
        }
      >
        {<ri.RiBold />}
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        title="Italic"
        className={
          editor.isActive('italic') ? 'active-textEditorButton' : 'textEditorButton'
        }
      >
        {<ri.RiItalic />}
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        title="Strikethrough"
        className={
          editor.isActive('strike') ? 'active-textEditorButton' : 'textEditorButton'
        }
      >
        {<ri.RiStrikethrough />}
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        disabled={!editor.can().chain().focus().toggleHighlight().run()}
        title="Highlight"
        className={
          editor.isActive('highlight') ? 'active-textEditorButton' : 'textEditorButton'
        }
      >
        {<ri.RiMarkPenFill />}
      </button>
      <div className="menu-divider"></div>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        title="Code"
        className={
          editor.isActive('code') ? 'active-textEditorButton' : 'textEditorButton'
        }
      >
        {<ri.RiCodeFill />}
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        disabled={!editor.can().chain().focus().toggleCodeBlock().run()}
        title="Code Block"
        className={
          editor.isActive('codeBlock') ? 'active-textEditorButton' : 'textEditorButton'
        }
      >
        {<ri.RiCodeBoxFill />}
      </button>
      <div className="menu-divider"></div>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        disabled={!editor.can().chain().focus().toggleHeading({ level: 1 }).run()}
        title="Heading"
        className={
          editor.isActive('heading', { level: 1 })
            ? 'active-textEditorButton'
            : 'textEditorButton'
        }
      >
        {<ri.RiHeading />}
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
        title="Bullet List"
        className={
          editor.isActive('bulletList') ? 'active-textEditorButton' : 'textEditorButton'
        }
      >
        {<ri.RiListCheck />}
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        disabled={!editor.can().chain().focus().setHorizontalRule().run()}
        title="Horizontal Line"
        className={'textEditorButton'}
      >
        {<ri.RiSeparator />}
      </button>
      <button
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        disabled={!editor.can().chain().focus().toggleSuperscript().run()}
        title="Superscript"
        className={
          editor.isActive('superscript') ? 'active-textEditorButton' : 'textEditorButton'
        }
      >
        {<ri.RiSuperscript />}
      </button>
      <button
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        disabled={!editor.can().chain().focus().toggleSubscript().run()}
        title="Subscript"
        className={
          editor.isActive('subscript') ? 'active-textEditorButton' : 'textEditorButton'
        }
      >
        {<ri.RiSubscript />}
      </button>
      <div className="menu-divider"></div>
      <button onClick={() => save()} title="Save" className="textEditorButton">
        {<ri.RiSaveFill />}
      </button>
    </div>
  )
}
