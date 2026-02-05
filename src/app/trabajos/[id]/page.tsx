'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase'; // ← CORREGIDO: ajusté el path (chequeá si es correcto en tu estructura)

export default function ProyectoDetalle({ params }: { params: { id: string } }) {
  const [proyecto, setProyecto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProyecto = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'trabajos', params.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProyecto({ id: docSnap.id, ...docSnap.data() });
          console.log('Proyecto cargado:', docSnap.data()); // Debug: ves en consola si tiene 'imagenUrl'
        } else {
          setError('El proyecto no existe en la base de datos');
        }
      } catch (err: any) {
        console.error('Error cargando proyecto:', err);
        setError('Hubo un error al cargar el proyecto: ' + err.message);
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

  if (error || !proyecto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center px-6">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md">
          <h1 className="text-3xl font-bold text-red-600 mb-4">¡Ups!</h1>
          <p className="text-lg text-gray-700 mb-6">{error || 'No encontramos el proyecto'}</p>
          <Link href="/trabajos" className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition inline-block">
            Volver a Proyectos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/trabajos" className="text-blue-600 hover:underline mb-8 inline-block font-medium">
          ← Volver a Proyectos
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-8">
          {proyecto.titulo}
        </h1>

        {proyecto.imagenUrl ? (
  <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 mx-auto max-w-3xl">
  <img
    src={proyecto.imagenUrl}
    alt={proyecto.titulo}
    className="w-full h-auto max-h-[400px] md:max-h-[550px] object-contain bg-gray-50"
    loading="lazy"
  />
</div>
) : (
  <div className="mb-12 text-center text-gray-500 italic">
    No hay imagen disponible para este proyecto
  </div>
)}

        {/* Descripción */}
        <div className="prose prose-lg text-gray-800 mb-12" dangerouslySetInnerHTML={{ __html: proyecto.descripcion }} />

        {/* Link al proyecto */}
        {proyecto.linkProyecto && (
          <a 
            href={proyecto.linkProyecto} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition shadow-lg"
          >
            Ver Proyecto Completo <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
    </div>
  );
}