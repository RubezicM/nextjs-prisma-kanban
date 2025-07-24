"use client";

import { TextStyleKit } from "@tiptap/extension-text-style";
import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Strikethrough, Code, List, ListOrdered, ChevronDown } from "lucide-react";

import { useState, useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";

const extensions = [TextStyleKit, StarterKit];

const formatOptions = [
  {
    label: "Regular",
    value: "paragraph",
    action: (editor: Editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    label: "Heading 1",
    value: "heading1",
    action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    label: "Heading 2",
    value: "heading2",
    action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: "Heading 3",
    value: "heading3",
    action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
];

const MenuBar = ({ editor }: { editor: Editor }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        isParagraph: ctx.editor.isActive("paragraph"),
        isHeading1: ctx.editor.isActive("heading", { level: 1 }),
        isHeading2: ctx.editor.isActive("heading", { level: 2 }),
        isHeading3: ctx.editor.isActive("heading", { level: 3 }),
        isBulletList: ctx.editor.isActive("bulletList"),
        isOrderedList: ctx.editor.isActive("orderedList"),
      };
    },
  });

  const getCurrentFormat = () => {
    if (editorState.isHeading1) return "Heading 1";
    if (editorState.isHeading2) return "Heading 2";
    if (editorState.isHeading3) return "Heading 3";
    return "Regular";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  if (!editor) return;

  return (
    <div className="flex items-center gap-1 p-2 border-b bg-background relative rounded-t-sm">
      <div className="flex items-center gap-1 relative">
        {/* Custom Text Format Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1"
            tabIndex={-1}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="text-sm">{getCurrentFormat()}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-popover border rounded-md shadow-md p-1 min-w-[8rem] z-50">
              {formatOptions.map(option => {
                const isActive =
                  (option.value === "paragraph" && editorState.isParagraph) ||
                  (option.value === "heading1" && editorState.isHeading1) ||
                  (option.value === "heading2" && editorState.isHeading2) ||
                  (option.value === "heading3" && editorState.isHeading3);

                return (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => {
                      option.action(editor);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground ${
                      isActive ? "bg-muted" : ""
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Text Style Buttons */}
        <Button
          type="button"
          variant={editorState.isBold ? "default" : "ghost"}
          size="sm"
          tabIndex={-1}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editorState.canBold}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editorState.isItalic ? "default" : "ghost"}
          size="sm"
          tabIndex={-1}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editorState.canItalic}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editorState.isStrike ? "default" : "ghost"}
          size="sm"
          tabIndex={-1}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editorState.canStrike}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editorState.isCode ? "default" : "ghost"}
          size="sm"
          tabIndex={-1}
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editorState.canCode}
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editorState.isBulletList ? "default" : "ghost"}
          size="sm"
          tabIndex={-1}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant={editorState.isOrderedList ? "default" : "ghost"}
          size="sm"
          tabIndex={-1}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
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
      const htmlContent = editor.getHTML();
      onContentChange?.(htmlContent);
    },
  });

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div>
      <MenuBar editor={editor} />
      <div className="relative">
        <EditorContent editor={editor} />
        {editor.isEmpty && (
          <div className="absolute top-0 left-0 text-muted-foreground pointer-events-none p-3">
            Write your card content here...
          </div>
        )}
      </div>
    </div>
  );
};
export default TextEditor;
