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
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
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
    content: content || '<p>Escribe algo aquí...</p>', // fallback si content está vacío
    immediatelyRender: false, // ← SOLUCIÓN PRINCIPAL: evita mismatch SSR → client
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    // Opcional: mejora rendimiento y estabilidad en Next.js
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px]',
      },
    },
  });

  if (!editor) {
    return <div className="min-h-[200px] p-4 text-gray-500">Cargando editor...</div>;
  }

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-950">
      {/* Toolbar - podés completar los botones aquí */}
      <div className="bg-gray-900 p-2 flex flex-wrap gap-1 border-b border-gray-800">
        {/* Ejemplo de botones básicos - descomenta y personaliza */}
        {/* 
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-gray-700' : ''}`}
        >
          Negrita
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-gray-700' : ''}`}
        >
          Cursiva
        </button>
        */}
      </div>

      {/* Área del editor */}
      <div className="p-4 min-h-[200px] bg-gray-950 text-gray-100">
        <EditorContent editor={editor} className="prose max-w-none prose-invert" />
      </div>
    </div>
  );
}