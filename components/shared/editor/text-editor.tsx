"use client";

import { TextStyleKit } from "@tiptap/extension-text-style";
import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Strikethrough, Code, List, ListOrdered } from "lucide-react";

import { Button } from "@/components/ui/button";

const extensions = [TextStyleKit, StarterKit];

const MenuBar = ({ editor }: { editor: Editor }) => {
  const editorState = useEditorState({
    editor,
    selector: ctx => {
      return {
        isBold: ctx.editor.isActive("bold"),
        canBold: ctx.editor.can().chain().focus().toggleBold().run(),
        isItalic: ctx.editor.isActive("italic"),
        canItalic: ctx.editor.can().chain().focus().toggleItalic().run(),
        isStrike: ctx.editor.isActive("strike"),
        canStrike: ctx.editor.can().chain().focus().toggleStrike().run(),
        isCode: ctx.editor.isActive("code"),
        canCode: ctx.editor.can().chain().focus().toggleCode().run(),
        canClearMarks: ctx.editor.can().chain().focus().unsetAllMarks().run(),
        isParagraph: ctx.editor.isActive("paragraph"),
        isHeading1: ctx.editor.isActive("heading", { level: 1 }),
        isHeading2: ctx.editor.isActive("heading", { level: 2 }),
        isHeading3: ctx.editor.isActive("heading", { level: 3 }),
        isHeading4: ctx.editor.isActive("heading", { level: 4 }),
        isHeading5: ctx.editor.isActive("heading", { level: 5 }),
        isHeading6: ctx.editor.isActive("heading", { level: 6 }),
        isBulletList: ctx.editor.isActive("bulletList"),
        isOrderedList: ctx.editor.isActive("orderedList"),
        isCodeBlock: ctx.editor.isActive("codeBlock"),
        isBlockquote: ctx.editor.isActive("blockquote"),
        canUndo: ctx.editor.can().chain().focus().undo().run(),
        canRedo: ctx.editor.can().chain().focus().redo().run(),
        pressedEnter: ctx.editor.isActive("hardBreak"),
      };
    },
  });
  if (!editor) return;

  return (
    <div className="flex items-center gap-1 p-2 border rounded-sm bg-background">
      <div className="button-group">
        <Button
          type="button"
          variant={`${editorState.isBold ? "default" : "ghost"}`}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editorState.canBold}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={`${editorState.isItalic ? "default" : "ghost"}`}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editorState.canItalic}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={`${editorState.isStrike ? "default" : "ghost"}`}
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editorState.canStrike}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={`${editorState.isCode ? "default" : "ghost"}`}
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editorState.canCode}
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={`${editorState.isParagraph ? "default" : "ghost"}`}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <span className="h-4">P</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant={`${editorState.isHeading1 ? "default" : "ghost"}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <span className="h-4 w-4">H1</span>
        </Button>
        <Button
          type="button"
          variant={`${editorState.isBulletList ? "default" : "ghost"}`}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant={`${editorState.isOrderedList ? "default" : "ghost"}`}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editorState.isOrderedList ? "is-active" : ""}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const TextEditor = ({ onContentChange }: { onContentChange?: (content: string) => void }) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    onUpdate: ({ editor }) => {
      // ⭐️ Izvlači HTML content svaki put kada se editor menja
      const htmlContent = editor.getHTML();
      onContentChange?.(htmlContent); // Šalje content parent komponenti
    },
  });

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div>
      <EditorContent editor={editor} />
      <BubbleMenu
        editor={editor}
        options={{
          placement: "top-start",
        }}
      >
        <MenuBar editor={editor} />
      </BubbleMenu>
    </div>
  );
};
export default TextEditor;
