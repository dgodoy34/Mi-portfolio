'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

export default function ProyectoDetalle({ params }: { params: { id: string } }) {
  const [proyecto, setProyecto] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProyecto = async () => {
      try {
        const docRef = doc(db, 'trabajos', params.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProyecto({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log('No existe el proyecto');
        }
      } catch (error) {
        console.error('Error cargando proyecto:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProyecto();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Cargando proyecto...</p>
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gray-50">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Proyecto no encontrado</h1>
        <p className="text-gray-600 mb-8 text-lg">
          El proyecto que buscás no existe o fue eliminado.
        </p>
        <Link
          href="/trabajos"
          className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition shadow-lg"
        >
          Volver a Mis Proyectos
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con título */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {proyecto.titulo || 'Proyecto sin título'}
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            {proyecto.descripcion?.substring(0, 200) || 'Vista previa del proyecto'}
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Imagen grande */}
          <div>
            {proyecto.imagenUrl ? (
              <Image
                src={proyecto.imagenUrl}
                alt={proyecto.titulo || 'Vista previa del proyecto'}
                width={800}
                height={600}
                className="w-full rounded-xl shadow-2xl object-cover"
                priority
              />
            ) : (
              <div className="w-full h-96 bg-gray-300 rounded-xl flex items-center justify-center text-gray-600 text-xl">
                Sin imagen disponible
              </div>
            )}
          </div>

          {/* Detalles */}
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Descripción completa</h2>
            {/* Render HTML real desde Tiptap */}
            <div
              className="text-gray-700 text-lg leading-relaxed mb-8 prose max-w-none prose-headings:text-blue-900 prose-a:text-blue-600 prose-a:underline"
              dangerouslySetInnerHTML={{
                __html: proyecto.descripcion || 'No hay descripción detallada para este proyecto.',
              }}
            />

            {/* Link externo si existe */}
            {proyecto.linkProyecto && proyecto.linkProyecto.trim() !== '' && (
              <a
                href={
                  proyecto.linkProyecto.startsWith('http')
                    ? proyecto.linkProyecto
                    : `https://${proyecto.linkProyecto}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition shadow-lg mb-8"
              >
                Ver Proyecto Completo <span aria-hidden="true">→</span>
              </a>
            )}

            {/* Volver */}
            <Link
              href="/trabajos"
              className="text-blue-600 hover:underline font-medium text-lg"
            >
              ← Volver a Mis Proyectos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}