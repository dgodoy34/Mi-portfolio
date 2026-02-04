'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';

export default function Trabajos() {
  const [trabajos, setTrabajos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const fetchTrabajos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'trabajos'));
        const docs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTrabajos(docs);
      } catch (error) {
        console.error('Error cargando trabajos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrabajos();

    return () => unsubscribe();
  }, []);

  const handleDeleteTrabajo = async (id: string) => {
    if (!confirm('¿Seguro querés eliminar este trabajo?')) return;

    try {
      await deleteDoc(doc(db, 'trabajos', id));
      setTrabajos(trabajos.filter((t) => t.id !== id));
      alert('Trabajo eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando trabajo:', error);
      alert('Error al eliminar el trabajo');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Título principal */}
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-4">
          Mis Proyectos
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Algunos de los trabajos que he realizado para clientes y proyectos personales.
        </p>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {loading ? (
          <p className="text-center text-gray-600 text-lg py-20">
            Cargando proyectos...
          </p>
        ) : trabajos.length === 0 ? (
          <p className="text-center text-gray-600 text-lg py-20">
            Aún no hay proyectos cargados.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trabajos.map((trabajo) => (
              <div
                key={trabajo.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition flex flex-col cursor-pointer"
                onClick={() => window.location.href = `/trabajos/${trabajo.id}`}
              >
                {/* Imagen */}
                {trabajo.imagenUrl ? (
                  <img
                    src={trabajo.imagenUrl}
                    alt={trabajo.titulo || 'Proyecto sin título'}
                    className="w-full h-56 object-cover"
                  />
                ) : (
                  <div className="w-full h-56 bg-gray-200 flex items-center justify-center text-gray-500">
                    Sin imagen
                  </div>
                )}

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold mb-3 text-blue-900">
                    {trabajo.titulo || 'Sin título'}
                  </h3>
                  <div
                    className="text-gray-600 mb-6 flex-grow line-clamp-4 prose"
                    dangerouslySetInnerHTML={{ __html: trabajo.descripcion || 'Sin descripción disponible' }}
                  />

                  {/* Texto indicativo */}
                  <div className="text-blue-600 font-semibold mt-auto">
                    Ver Detalle →
                  </div>

                  {/* Botones admin */}
                  {user && (
                    <div className="flex gap-4 mt-4">
                      <Link
                        href={`/admin?edit=trabajo&id=${trabajo.id}`}
                        className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded text-center hover:bg-yellow-600 transition text-sm font-medium"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTrabajo(trabajo.id);
                        }}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Volver al inicio */}
      <div className="text-center py-12 bg-white border-t">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition shadow-lg"
        >
          ← Volver al Inicio
        </Link>
      </div>
    </div>
  );
}