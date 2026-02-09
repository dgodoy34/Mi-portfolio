// src/app/admin/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { auth, db, storage } from '../../../lib/firebase';
import { User } from 'firebase/auth';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { Extension } from '@tiptap/core';

/* =========================
   ✅ EXTENSIÓN FONT SIZE (CORREGIDA)
========================= */
const FontSize = Extension.create({
  name: 'fontSize',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize?.replace('px', ''),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}px` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontSize }).run();
        },

      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark('textStyle', { fontSize: null })
            .run();
        },
    };
  },
});

/* =========================
   ✅ COMPONENTE TIPTAP (CORREGIDO - SIN DUPLICADOS)
========================= */
const TiptapEditor = ({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        // ⚠️ StarterKit ya incluye underline → NO agregar Underline por separado
      }),

      // ⚠️ ORDEN CRÍTICO - NO CAMBIAR
      TextStyle.configure({}),
      Color.configure({ types: ['textStyle'] }),
      Highlight, // ✅ Sin .configure()
      FontFamily.configure({
        types: ['textStyle'],
      }),
      FontSize.configure({
        types: ['textStyle'],
      }),
      
      // ✅ TextAlign DEBE ir DESPUÉS de TextStyle y sus derivados
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),

      Image.configure({
        inline: false,
        allowBase64: true,
      }),
    ],

    content: content || '<p>Escribe aquí tu contenido...</p>',

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },

    editable: true,
    autofocus: 'end',
    immediatelyRender: false,
  });

  // ✅ Cuando el contenido cambia desde afuera (modo edición)
  useEffect(() => {
    if (!editor) return;

    if (content !== undefined) {
      const current = editor.getHTML();
      if (current !== content) {
        editor.commands.setContent(content, { emitUpdate: false });
      }
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="p-6 bg-white border rounded min-h-[300px] flex items-center justify-center text-gray-500">
        Cargando editor...
      </div>
    );
  }

  // ✅ Insertar imagen por URL
  const insertImageByUrl = () => {
    const url = prompt('Pegá el link de la imagen (https://...)');
    if (!url) return;

    editor.chain().focus().setImage({ src: url }).run();
  };

  // ✅ Botones
  const btnBase =
    'px-2.5 py-2 rounded text-white hover:bg-gray-800 transition flex items-center justify-center text-sm';
  const btnActive = 'bg-blue-700';
  const btnInactive = 'bg-gray-700';

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Toolbar */}
      <div className="bg-gray-900 p-2.5 flex flex-wrap gap-1.5 border-b border-gray-800 items-center">
        {/* ======= BÁSICOS ======= */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${btnBase} ${
            editor.isActive('bold') ? btnActive : btnInactive
          }`}
          title="Negrita"
        >
          <b>B</b>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${btnBase} ${
            editor.isActive('italic') ? btnActive : btnInactive
          }`}
          title="Cursiva"
        >
          <i>I</i>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${btnBase} ${
            editor.isActive('underline') ? btnActive : btnInactive
          }`}
          title="Subrayado"
        >
          <span style={{ textDecoration: 'underline' }}>U</span>
        </button>

        <div className="border-l border-gray-700 mx-2 h-6 self-center"></div>

        {/* ======= TAMAÑO DE LETRA ======= */}
        <select
          className="px-2 py-2 rounded bg-gray-800 text-white text-sm border border-gray-700 outline-none"
          onChange={(e) =>
            editor.chain().focus().setMark('textStyle', { fontSize: e.target.value }).run()
          }
          defaultValue="16"
          title="Tamaño de letra"
        >
          <option value="12">12px</option>
          <option value="14">14px</option>
          <option value="16">16px</option>
          <option value="18">18px</option>
          <option value="22">22px</option>
          <option value="28">28px</option>
          <option value="36">36px</option>
        </select>

        <button
          type="button"
          onClick={() => editor.chain().focus().unsetMark('textStyle').run()}
          className={`${btnBase} ${btnInactive}`}
          title="Reset tamaño"
        >
          ↺
        </button>

        <div className="border-l border-gray-700 mx-2 h-6 self-center"></div>

        {/* ======= TITULOS ======= */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`${btnBase} ${
            editor.isActive('heading', { level: 1 }) ? btnActive : btnInactive
          }`}
          title="Título grande (H1)"
        >
          H1
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`${btnBase} ${
            editor.isActive('heading', { level: 2 }) ? btnActive : btnInactive
          }`}
          title="Título mediano (H2)"
        >
          H2
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`${btnBase} ${
            editor.isActive('heading', { level: 3 }) ? btnActive : btnInactive
          }`}
          title="Título chico (H3)"
        >
          H3
        </button>

        <div className="border-l border-gray-700 mx-2 h-6 self-center"></div>

        {/* ======= COLOR ======= */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setColor('#000000').run()}
          className={`${btnBase} ${btnInactive}`}
          title="Negro"
        >
          A
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setColor('#dc2626').run()}
          className={`${btnBase} ${btnInactive}`}
          title="Rojo"
        >
          <span style={{ color: '#dc2626', fontWeight: 800 }}>A</span>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setColor('#2563eb').run()}
          className={`${btnBase} ${btnInactive}`}
          title="Azul"
        >
          <span style={{ color: '#2563eb', fontWeight: 800 }}>A</span>
        </button>

        <div className="border-l border-gray-700 mx-2 h-6 self-center"></div>

        {/* ======= FUENTES ======= */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().setFontFamily('sans-serif').run()
          }
          className={`${btnBase} ${
            editor.isActive('textStyle', { fontFamily: 'sans-serif' })
              ? btnActive
              : btnInactive
          }`}
          title="Sans"
        >
          Sans
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setFontFamily('serif').run()}
          className={`${btnBase} ${
            editor.isActive('textStyle', { fontFamily: 'serif' })
              ? btnActive
              : btnInactive
          }`}
          title="Serif"
        >
          Serif
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().setFontFamily('monospace').run()
          }
          className={`${btnBase} ${
            editor.isActive('textStyle', { fontFamily: 'monospace' })
              ? btnActive
              : btnInactive
          }`}
          title="Mono"
        >
          Mono
        </button>

        <div className="border-l border-gray-700 mx-2 h-6 self-center"></div>

        {/* ======= LISTAS ======= */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${btnBase} ${
            editor.isActive('bulletList') ? btnActive : btnInactive
          }`}
          title="Lista"
        >
          ••
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${btnBase} ${
            editor.isActive('orderedList') ? btnActive : btnInactive
          }`}
          title="Lista numerada"
        >
          1.
        </button>

        <div className="border-l border-gray-700 mx-2 h-6 self-center"></div>

        {/* ======= ALINEACIÓN ======= */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`${btnBase} ${
            editor.isActive({ textAlign: 'left' }) ? btnActive : btnInactive
          }`}
          title="Alinear izquierda"
        >
          ⬅
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`${btnBase} ${
            editor.isActive({ textAlign: 'center' }) ? btnActive : btnInactive
          }`}
          title="Centrar"
        >
          ⬌
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`${btnBase} ${
            editor.isActive({ textAlign: 'right' }) ? btnActive : btnInactive
          }`}
          title="Alinear derecha"
        >
          ➡
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`${btnBase} ${
            editor.isActive({ textAlign: 'justify' }) ? btnActive : btnInactive
          }`}
          title="Justificar"
        >
          ☰
        </button>

        <div className="border-l border-gray-700 mx-2 h-6 self-center"></div>

        {/* ======= IMAGEN ======= */}
        <button
          type="button"
          onClick={insertImageByUrl}
          className={`${btnBase} ${btnInactive}`}
          title="Insertar imagen"
        >
          🖼️
        </button>

        <div className="flex-grow"></div>
      </div>

      {/* Área de edición */}
      <EditorContent editor={editor} className="tiptap p-6 min-h-[400px]" />
    </div>
  );
};

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // ESTADOS PARA TRABAJOS
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [urlImagen, setUrlImagen] = useState('');
  const [linkProyecto, setLinkProyecto] = useState('');
  const [trabajos, setTrabajos] = useState<any[]>([]);
  const [editTrabajoId, setEditTrabajoId] = useState<string | null>(null);
  
  // ESTADOS PARA POSTS DEL BLOG
  const [postTitulo, setPostTitulo] = useState('');
  const [postContenido, setPostContenido] = useState('');
  const [postImagenFile, setPostImagenFile] = useState<File | null>(null);
  const [postUrlImagen, setPostUrlImagen] = useState('');
  const [postVideoUrl, setPostVideoUrl] = useState('');
  const [postExcerpt, setPostExcerpt] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [editPostId, setEditPostId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    if (user) {
      const fetchData = async () => {
        const trabajosSnap = await getDocs(collection(db, 'trabajos'));
        setTrabajos(trabajosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const postsSnap = await getDocs(collection(db, 'posts'));
        setPosts(postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      };
      fetchData();
    }

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas. Intenta de nuevo.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleSaveTrabajo = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validación básica (para que no guarde vacío)
  if (!titulo.trim() || !descripcion.trim() || !linkProyecto.trim()) {
    alert('Completá título, descripción y link al proyecto');
    return;
  }

  try {
    // Siempre toma la URL escrita (incluso si editás sin subir archivo)
    let imagenUrl = urlImagen.trim();

    const data = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      linkProyecto: linkProyecto.trim(),
      imagenUrl, // ← AGREGADO: siempre guarda la URL si la escribiste
      updatedAt: new Date().toISOString(),
    };

    if (editTrabajoId) {
      console.log('Actualizando trabajo ID:', editTrabajoId);
      await updateDoc(doc(db, 'trabajos', editTrabajoId), data);
      alert('¡Trabajo actualizado con éxito!');
    } else {
      console.log('Creando nuevo trabajo');
      await addDoc(collection(db, 'trabajos'), {
        ...data,
        createdAt: new Date().toISOString(),
      });
      alert('¡Trabajo agregado con éxito!');
    }

    // Limpieza del form
    setTitulo('');
    setDescripcion('');
    setLinkProyecto('');
    setUrlImagen(''); // Limpia la URL también
    setEditTrabajoId(null);

    // Recargar lista para ver cambios
    const snap = await getDocs(collection(db, 'trabajos'));
    setTrabajos(snap.docs.map(d => ({ id: d.id, ...d.data() })));

  } catch (err: any) {
    console.error('Error al guardar trabajo:', err);
    alert('Error al guardar: ' + (err.message || 'Revisa consola F12'));
  }
};

  const handleEditTrabajo = (item: any) => {
    setTitulo(item.titulo);
    setDescripcion(item.descripcion);
    setUrlImagen(item.imagenUrl || '');
    setLinkProyecto(item.linkProyecto || '');
    setEditTrabajoId(item.id);
  };

  const handleDeleteTrabajo = async (id: string) => {
    if (window.confirm('¿Seguro querés eliminar este trabajo?')) {
      await deleteDoc(doc(db, 'trabajos', id));
      setTrabajos(trabajos.filter(t => t.id !== id));
      alert('Eliminado');
    }
  };

  // Guardar / Editar Post (con generación de slug)
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imagenUrl = postUrlImagen;
      if (postImagenFile) {
        const storageRef = ref(storage, `posts/${Date.now()}_${postImagenFile.name}`);
        await uploadBytes(storageRef, postImagenFile);
        imagenUrl = await getDownloadURL(storageRef);
      }

      // Generar slug del título
      const slug = postTitulo
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const data = {
        titulo: postTitulo,
        contenido: postContenido,
        imagenUrl,
        videoUrl: postVideoUrl,
        excerpt: postExcerpt,
        slug,
        updatedAt: new Date().toISOString(),
      };

      if (editPostId) {
        await updateDoc(doc(db, 'posts', editPostId), data);
        alert('Post actualizado!');
      } else {
        await addDoc(collection(db, 'posts'), { ...data, createdAt: new Date().toISOString() });
        alert('Post agregado!');
      }

      setPostTitulo('');
      setPostContenido('');
      setPostImagenFile(null);
      setPostUrlImagen('');
      setPostVideoUrl('');
      setPostExcerpt('');
      setEditPostId(null);

      const snap = await getDocs(collection(db, 'posts'));
      setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleEditPost = (item: any) => {
    setPostTitulo(item.titulo);
    setPostContenido(item.contenido);
    setPostUrlImagen(item.imagenUrl || '');
    setPostVideoUrl(item.videoUrl || '');
    setPostExcerpt(item.excerpt || '');
    setEditPostId(item.id);
  };

  const handleDeletePost = async (id: string) => {
    if (window.confirm('¿Seguro querés eliminar este post?')) {
      await deleteDoc(doc(db, 'posts', id));
      setPosts(posts.filter(p => p.id !== id));
      alert('Eliminado');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-gray-900">
          <h1 className="text-2xl font-bold mb-6 text-center text-blue-900">Iniciar Sesión (Admin)</h1>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Entrar
          </button>

          {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
  <h1 className="text-4xl md:text-5xl font-bold text-blue-900">
    Panel Admin
  </h1>
  <div className="flex gap-4">
    <Link 
      href="/" 
      className="bg-gray-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-700 transition"
    >
      Volver al Inicio
    </Link>
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition"
    >
      Cerrar Sesión
    </button>
  </div>
</div>

        {/* Form para Trabajos */}
<div className="bg-white p-8 rounded-2xl shadow-lg mb-16">
  <h2 className="text-3xl font-bold mb-6 text-blue-900">
    {editTrabajoId ? 'Editar Trabajo' : 'Agregar Nuevo Trabajo'}
  </h2>

  <form onSubmit={handleSaveTrabajo} className="space-y-6">
    <div>
      <label className="block text-gray-700 font-medium mb-2">Título</label>
      <input
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900"
        required
      />
    </div>

    <div>
      <label className="block text-gray-700 font-medium mb-2">Descripción</label>
      <TiptapEditor content={descripcion} onChange={setDescripcion} />
    </div>

    <div>
      <label className="block text-gray-700 font-medium mb-2">Subir Imagen</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImagenFile(e.target.files?.[0] || null)}
        className="w-full p-3 border rounded-lg"
      />
    </div>

    <div className="text-center text-gray-500">— o —</div>

    <div>
      <label className="block text-gray-700 font-medium mb-2">URL de Imagen (opcional)</label>
      <input
        type="url"
        value={urlImagen}
        onChange={(e) => setUrlImagen(e.target.value)}
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900"
        placeholder="https://ejemplo.com/imagen.jpg"
      />
    </div>

    <div>
      <label className="block text-gray-700 font-medium mb-2">Link al Proyecto</label>
      <input
        type="url"
        value={linkProyecto}
        onChange={(e) => setLinkProyecto(e.target.value)}
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900"
        required
      />
    </div>

    <button
      type="submit"
      className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition text-lg"
    >
      {editTrabajoId ? 'Guardar Cambios' : 'Guardar Trabajo'}
    </button>
  </form>
          {/* Lista de Trabajos */}
          <h3 className="text-2xl font-bold mt-12 mb-6 text-blue-900">Trabajos Guardados ({trabajos.length})</h3>
          {trabajos.length === 0 ? (
            <p className="text-center text-gray-600">Aún no hay trabajos.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {trabajos.map((trabajo) => (
                <div key={trabajo.id} className="bg-gray-50 p-6 rounded-xl shadow-md">
                  <h4 className="text-xl font-bold mb-2">{trabajo.titulo}</h4>
                  <p className="text-gray-700 mb-4">{trabajo.descripcion.substring(0, 100)}...</p>
                  {trabajo.imagenUrl && <img src={trabajo.imagenUrl} alt={trabajo.titulo} className="w-full h-40 object-cover rounded-lg mb-4" />}
                  <a href={trabajo.linkProyecto} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block mb-4">Ver Proyecto</a>
                  <div className="flex gap-4">
                    <button onClick={() => handleEditTrabajo(trabajo)} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                      Editar
                    </button>
                    <button onClick={() => handleDeleteTrabajo(trabajo.id)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form para Posts del Blog */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-green-900">
            {editPostId ? 'Editar Entrada del Blog' : 'Agregar Entrada al Blog'}
          </h2>

          <form onSubmit={handleSavePost} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Título del Post</label>
              <input
                type="text"
                value={postTitulo}
                onChange={(e) => setPostTitulo(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Excerpt / Resumen corto</label>
              <textarea
                value={postExcerpt}
                onChange={(e) => setPostExcerpt(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900"
                rows={3}
                required
              />
            </div>

            <div>
            <label className="block text-gray-700 font-medium mb-2">Contenido completo</label>
            <TiptapEditor 
              content={postContenido} 
              onChange={setPostContenido} 
            />
          </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Subir Imagen Principal</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPostImagenFile(e.target.files?.[0] || null)}
                className="w-full p-3 border rounded-lg text-gray-900"
              />
            </div>

            <div className="text-center text-gray-500">— o —</div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">URL de Imagen (opcional)</label>
              <input
                type="url"
                value={postUrlImagen}
                onChange={(e) => setPostUrlImagen(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">URL de Video (opcional)</label>
              <input
                type="url"
                value={postVideoUrl}
                onChange={(e) => setPostVideoUrl(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900"
                placeholder="https://www.youtube.com/embed/VIDEO_ID"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition text-lg"
            >
              {editPostId ? 'Guardar Cambios' : 'Guardar Entrada del Blog'}
            </button>
          </form>

          {/* Lista de Posts */}
          <h3 className="text-2xl font-bold mt-12 mb-6 text-green-900">Entradas del Blog ({posts.length})</h3>
          {posts.length === 0 ? (
            <p className="text-center text-gray-600">Aún no hay entradas en el blog.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {posts.map((post) => (
                <div key={post.id} className="bg-gray-50 p-6 rounded-xl shadow-md">
                  <h4 className="text-xl font-bold mb-2">{post.titulo}</h4>
                  <p className="text-gray-700 mb-4">{post.excerpt.substring(0, 100)}...</p>
                  {post.imagenUrl && <img src={post.imagenUrl} alt={post.titulo} className="w-full h-40 object-cover rounded-lg mb-4" />}
                  {post.videoUrl && <p className="text-sm text-gray-600">Video incluido</p>}
                  <div className="flex gap-4 mt-4">
                    <button onClick={() => handleEditPost(post)} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                      Editar
                    </button>
                    <button onClick={() => handleDeletePost(post.id)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}