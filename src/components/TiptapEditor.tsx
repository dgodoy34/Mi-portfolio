'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';

export default function TiptapEditor({ 
  content, 
  onChange 
}: { 
  content: string; 
  onChange: (html: string) => void 
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Color,
      TextStyle,
      Underline,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return <div className="min-h-[200px] p-4">Cargando editor...</div>;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-900 p-2 flex flex-wrap gap-1 border-b border-gray-800">
        {/* Botones de formato (negrita, cursiva, etc.) */}
      </div>
      
      {/* Editor de texto */}
      <div className="p-4 min-h-[200px]">
        <EditorContent 
          editor={editor} 
          className="prose max-w-none"
        />
      </div>
    </div>
  );
}