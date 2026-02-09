// app/blog/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import Link from 'next/link';
import { auth, db } from '../../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar usuario logueado
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Cargar todos los posts
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error cargando posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Cargando posts...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-16 text-blue-900">
          Blog - IACREATIVATOOLS
        </h1>

        {posts.length === 0 ? (
          <p className="text-center text-gray-600 text-xl">Aún no hay publicaciones en el blog. ¡Vuelve pronto!</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition">
                {post.imagenUrl && (
                  <img 
                    src={post.imagenUrl} 
                    alt={post.titulo} 
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-blue-900 mb-3">{post.titulo}</h2>
                  <p className="text-gray-600 mb-4">{post.excerpt.substring(0, 120)}...</p>
                  <Link href={`/blog/${post.slug || post.id}`} className="text-blue-600 font-semibold hover:underline">
                    Leer más →
                  </Link>
                  {user && (
                    <div className="flex gap-4 mt-4">
                      <Link href={`/admin?edit=post&id=${post.id}`} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 text-sm">
                        Editar
                      </Link>
                      <button onClick={async () => {
                        if (confirm('¿Seguro querés eliminar este post?')) {
                          await deleteDoc(doc(db, 'posts', post.id));
                          setPosts(posts.filter(p => p.id !== post.id));
                          alert('Post eliminado');
                        }
                      }} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm">
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/" className="text-blue-600 hover:underline text-lg font-medium">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}