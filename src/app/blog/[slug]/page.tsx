'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '../../../../lib/firebase';
import {
  doc,
  getDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  increment,
  updateDoc,
  where,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function PostDetail() {
  const { slug } = useParams() as { slug: string };

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    if (!slug || typeof slug !== 'string') {
      setError('No se proporcionó un identificador');
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

const fetchPost = async () => {
  try {
    setLoading(true);
    setError(null);

    // ✅ BÚSQUEDA INTELIGENTE: primero intenta por ID, luego por slug
    let docSnap = await getDoc(doc(db, 'posts', slug.trim()));

    if (!docSnap.exists()) {
      // Si no existe como ID, buscar por campo 'slug'
      const q = query(collection(db, 'posts'), where('slug', '==', slug.trim()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        docSnap = querySnapshot.docs[0];
      }
    }

    console.log('Documento encontrado:', docSnap.exists());
    if (docSnap.exists()) {
      console.log('ID del documento:', docSnap.id);
    }

    if (!docSnap.exists()) {
      setError('No se encontró el artículo');
      return;
    }

    const postData = { id: docSnap.id, ...docSnap.data() };
    setPost(postData);
    setLikesCount((postData as any).likesCount || 0);

    // Chequear si ya dio like (localStorage)
    const likedPosts: string[] = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    setHasLiked(likedPosts.includes(docSnap.id));

    // Cargar comentarios
    const commentsQuery = query(
      collection(db, 'posts', docSnap.id, 'comments'),
      orderBy('createdAt', 'desc')
    );
    const commentsSnap = await getDocs(commentsQuery);
    setComments(commentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err: any) {
    console.error('Error cargando post:', err);
    setError('Error al cargar el contenido. Intenta de nuevo más tarde.');
  } finally {
    setLoading(false);
  }
};

    fetchPost();

    return () => unsubscribeAuth();
  }, [slug]);

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) return;
    if (!post?.id) return;

    try {
      await deleteDoc(doc(db, 'posts', post.id, 'comments', commentId));
      // Recargar comentarios
      const commentsQuery = query(
        collection(db, 'posts', post.id, 'comments'),
        orderBy('createdAt', 'desc')
      );
      const commentsSnap = await getDocs(commentsQuery);
      setComments(commentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      alert('Comentario eliminado');
    } catch (err: any) {
      console.error(err);
      alert('No se pudo eliminar el comentario');
    }
  };

  const handleLike = async () => {
    if (hasLiked || !post?.id) return;
    try {
      await updateDoc(doc(db, 'posts', post.id), {
        likesCount: increment(1),
      });
      setLikesCount((prev) => prev + 1);
      setHasLiked(true);

      const likedPosts: string[] = JSON.parse(localStorage.getItem('likedPosts') || '[]');
      localStorage.setItem('likedPosts', JSON.stringify([...likedPosts, post.id]));
    } catch (err) {
      console.error('Error al dar like:', err);
      alert('Hubo un error al registrar tu like');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post?.id) return;

    try {
      await addDoc(collection(db, 'posts', post.id, 'comments'), {
        name: commentName.trim() || 'Anónimo',
        text: commentText.trim(),
        createdAt: new Date(),
      });

      setCommentName('');
      setCommentText('');
      setShowCommentForm(false);

      // Recargar comentarios
      const commentsQuery = query(
        collection(db, 'posts', post.id, 'comments'),
        orderBy('createdAt', 'desc')
      );
      const commentsSnap = await getDocs(commentsQuery);
      setComments(commentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error al publicar comentario:', err);
      alert('Hubo un error al publicar tu comentario');
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar permanentemente este post?') || !post?.id) return;
    try {
      await deleteDoc(doc(db, 'posts', post.id));
      alert('Post eliminado correctamente');
      window.location.href = '/blog';
    } catch (err: any) {
      console.error(err);
      alert('No se pudo eliminar el post: ' + err.message);
    }
  };

   // const getEmbedUrl = (url: string) => {
    // if (!url) return '';
    // return url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
  // };

  //nueva funcion youtube

  const getEmbedUrl = (url: string | undefined) => {
  if (!url || typeof url !== 'string' || url.trim() === '') return '';

  // Limpieza básica
  const cleanUrl = url.trim();

  // Si ya es embed, devolver tal cual
  if (cleanUrl.includes('/embed/')) return cleanUrl;

  // Extraer ID de formatos comunes
  const patterns = [
    /(?:v=|youtu\.be\/)([^&\n?#]+)/i,          // watch?v= o youtu.be/
    /youtube\.com\/embed\/([^&\n?#]+)/i,       // ya embed
    /youtube\.com\/shorts\/([^&\n?#]+)/i,      // shorts
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  // Si no matchea nada (ej: home de YT o inválido), devolver vacío para no renderizar iframe
  console.warn('URL de video inválida:', cleanUrl);
  return '';
};

  // Función para formatear la fecha (soporta string actual y futuro Timestamp)
  const formatPostDate = () => {
    if (!post) return 'Fecha no disponible';

    // Caso 1: ya tenés Timestamp como string (el formato que mostraste)
    if (typeof post.Timestamp === 'string') {
      try {
        const str = post.Timestamp
          .replace(' a las ', ' ')
          .replace(' a.m.', ' AM')
          .replace(' p.m.', ' PM')
          .replace(' UTC-3', '');

        const parts = str.split(' ');
        if (parts.length < 5) return post.Timestamp;

        const day = parseInt(parts[0], 10);
        const monthStr = parts[2].toLowerCase();
        const year = parseInt(parts[4], 10);

        const months: { [key: string]: number } = {
          enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
          julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
        };

        const month = months[monthStr] ?? 0;
        const date = new Date(year, month, day);

        // Intentar agregar hora si existe
        if (parts.length >= 7) {
          const [time, period] = [parts[6], parts[7]];
          let [h, m] = time.split(':').map(Number);
          if (period === 'PM' && h < 12) h += 12;
          if (period === 'AM' && h === 12) h = 0;
          date.setHours(h || 0, m || 0);
        }

        return date.toLocaleString('es-AR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        return post.Timestamp; // fallback
      }
    }

    // Caso 2: futuro → createdAt como Timestamp de Firebase
    if (post.createdAt && typeof post.createdAt === 'object' && 'toDate' in post.createdAt) {
      const date = post.createdAt.toDate();
      return date.toLocaleString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // Caso 3: createdAt como Date o string ISO
    if (post.createdAt) {
      const date = new Date(post.createdAt);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString('es-AR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    }

    return 'Fecha no disponible';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-xl text-gray-600 font-medium">Cargando artículo...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md">
          <h1 className="text-4xl font-bold text-red-500 mb-4">¡Ups!</h1>
          <p className="text-xl text-gray-700 mb-8">{error || 'No pudimos encontrar el artículo'}</p>
          <Link
            href="/blog"
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-md inline-block"
          >
            Volver al Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <nav className="bg-white border-b border-gray-200 py-4 mb-12 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-900">
            IACREATIVATOOLS
          </Link>
          <Link href="/blog" className="text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-2">
            <span>←</span> Blog
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {user && (
          <div className="flex justify-end gap-4 mb-10 bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm">
            <Link
              href={`/admin?edit=post&id=${post.id}`}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition shadow-md text-sm"
            >
              Editar Post
            </Link>
            <button
              onClick={handleDeletePost}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition shadow-md text-sm"
            >
              Eliminar Post
            </button>
          </div>
        )}

        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold text-blue-900 mb-6 leading-[1.1]">
            {post.titulo}
          </h1>

          <div className="flex items-center gap-3 text-gray-500">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Artículo
            </span>
            <p className="text-sm italic font-medium">Publicado el {formatPostDate()}</p>
          </div>
        </header>

        {post.imagenUrl && (
          <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
            <img
              src={post.imagenUrl}
              alt={post.titulo}
              className="w-full h-auto max-h-[650px] object-cover"
            />
          </div>
        )}

        {post.videoUrl && (
          <div className="mb-12">
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              Video Recomendado
            </h3>
            <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-black">
              <iframe
                src={getEmbedUrl(post.videoUrl)}
                title={post.titulo}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Contenido del Artículo - CORREGIDO PARA QUE SE VEA EL HTML */}
<div className="bg-white p-8 md:p-14 rounded-3xl shadow-xl border border-gray-100 mb-16">
  <div
    className="prose prose-lg md:prose-xl max-w-none text-gray-800 leading-[1.8] font-serif prose-blue prose-headings:text-blue-900 prose-a:text-blue-600 hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-lg"
    dangerouslySetInnerHTML={{ __html: post.contenido || '' }}
  />
</div>

        {/* Interacción */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mt-12">
          {/* botones like, comentar, compartir ... (queda igual que antes) */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <button
              onClick={handleLike}
              disabled={hasLiked}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                hasLiked ? 'bg-red-100 text-red-600 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">{hasLiked ? '❤️' : '🤍'}</span>
              Me gusta {likesCount > 0 && `(${likesCount})`}
            </button>

            <button
              onClick={() => setShowCommentForm(!showCommentForm)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-all"
            >
              <span className="text-xl">💬</span>
              Comentar {comments.length > 0 && `(${comments.length})`}
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => navigator.share({ title: post.titulo, text: post.excerpt || '', url: window.location.href })}
                className="p-3 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition"
                title="Compartir"
              >
                ↗
              </button>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                title="Compartir en Facebook"
              >
                f
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(post.titulo + '\n' + window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition"
                title="Compartir por WhatsApp"
              >
                wa
              </a>
            </div>
          </div>

          {showCommentForm && (
            <div className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Dejar un comentario</h3>
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <input
                  type="text"
                  placeholder="Tu nombre (opcional)"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <textarea
                  placeholder="Tu comentario..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={4}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                >
                  Publicar Comentario
                </button>
              </form>
            </div>
          )}

          {comments.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">Comentarios ({comments.length})</h3>
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                        {comment.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{comment.name || 'Anónimo'}</p>
                        <p className="text-xs text-gray-500">
                          {comment.createdAt?.seconds
                            ? new Date(comment.createdAt.seconds * 1000).toLocaleString('es-AR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Fecha no disponible'}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-800 mb-2">{comment.text}</p>

                    {user && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition"
                      >
                        <span>🗑️</span> Eliminar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-16 text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">¿Qué te pareció?</h2>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            Si tenés dudas o querés charlar sobre el tema, escribime por WhatsApp.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-xl transition-all"
          >
            <span>←</span> Ver todos los artículos
          </Link>
        </div>
      </div>
    </div>
  );
}