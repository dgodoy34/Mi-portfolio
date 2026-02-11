'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';

import WhatsAppButton from '@/components/WhatsAppButton';   // ajustá la ruta según donde lo guardaste

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [trabajos, setTrabajos] = useState<any[]>([]);
  const [ultimoPost, setUltimoPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const fetchTrabajos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'trabajos'));
        const docs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTrabajos(docs);
      } catch (error) {
        console.error('Error cargando trabajos:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUltimoPost = async () => {
      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setUltimoPost({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
        }
      } catch (error) {
        console.error('Error cargando post:', error);
      }
    };

    fetchTrabajos();
    fetchUltimoPost();

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  const handleDeleteTrabajo = async (id: string) => {
    if (!confirm('¿Seguro querés eliminar este trabajo?')) return;
    try {
      await deleteDoc(doc(db, 'trabajos', id));
      setTrabajos(trabajos.filter((t) => t.id !== id));
      alert('Trabajo eliminado con éxito');
    } catch (error) {
      console.error('Error al eliminar trabajo:', error);
      alert('No se pudo eliminar');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('¿Seguro querés eliminar este post?')) return;
    try {
      await deleteDoc(doc(db, 'posts', id));
      setUltimoPost(null);
      alert('Post eliminado con éxito');
    } catch (error) {
      console.error('Error al eliminar post:', error);
      alert('No se pudo eliminar');
    }
  };

  return (
    <div className="bg-blue-600 text-white">

      
      {/* BOTÓN FLOTANTE WHATSAPP */}
     <WhatsAppButton />

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link href="/" className="flex-shrink-0">
              <img
                src="https://mdtstreet.mdtsublimados.com.ar/img/logo.png"
                alt="IACreativaTools - Diego Godoy"
                className="h-16 md:h-20 w-auto"
              />
            </Link>

            <div className="flex items-center gap-6 md:gap-10">
              <ul className="hidden md:flex space-x-6 lg:space-x-10 text-base lg:text-lg font-medium text-blue-900">
                <li>
                  <Link href="/" className="hover:text-blue-600 transition">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="#servicios-ia" className="hover:text-blue-600 transition">
                    Servicios IA
                  </Link>
                </li>
                <li>
                  <Link href="#paquetes" className="hover:text-blue-600 transition">
                    Paquetes
                  </Link>
                </li>
                <li>
                  <Link href="#proyectos" className="hover:text-blue-600 transition">
                    Casos / Proyectos
                  </Link>
                </li>
                <li>
                  <Link href="#sobre-mi" className="hover:text-blue-600 transition">
                    Sobre Mí
                  </Link>
                </li>
                <li>
                  <Link href="#contacto" className="hover:text-blue-600 transition">
                    Contacto
                  </Link>
                </li>
              </ul>

              <div className="flex items-center gap-4">
                {user ? (
                  <>
                    <Link
                      href="/admin"
                      className="bg-blue-600 text-white px-5 py-2 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-sm md:text-base"
                    >
                      Panel Admin
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 text-white px-5 py-2 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-red-700 transition text-sm md:text-base"
                    >
                      Salir
                    </button>
                  </>
                ) : (
                  <Link
                    href="/admin"
                    className="bg-blue-600 text-white px-5 py-2 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-sm md:text-base"
                  >
                    Admin Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-24 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-5xl">
          <p className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm md:text-base mb-6">
            ⚡ Consultoría IA + Automatización + Desarrollo Web
          </p>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Implementamos Inteligencia Artificial para que tu negocio venda más
            <span className="text-white/80"> (y trabaje menos)</span>
          </h1>

          <p className="text-xl max-w-3xl mx-auto mb-10 opacity-90">
            Automatización de WhatsApp · Presupuestos rápidos · Contenido con IA · Sitios web que convierten.
            <br className="hidden sm:block" />
            Sin humo. Sin vueltas. Resultados reales en pocos días.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
  <Link
    href="#contacto"
    className="bg-white text-blue-700 px-8 py-4 rounded-full font-semibold shadow-lg hover:bg-gray-100 transition text-center"
  >
    Quiero una demo gratis
  </Link>

  <Link
    href="#paquetes"
    className="bg-white text-blue-700 px-8 py-4 rounded-full font-semibold shadow-lg hover:bg-gray-100 transition text-center"
  >
    Ver paquetes
  </Link>
</div>


          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-white/80">
            <span className="bg-white/10 px-4 py-2 rounded-full">📲 WhatsApp</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">🧾 Presupuestos</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">📈 Ventas</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">🎥 Contenido</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">⚙️ Automatización</span>
          </div>
        </div>
      </section>

      {/* ÚLTIMA PUBLICACIÓN DEL BLOG */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-2 text-blue-900">
            Explorá el Blog
            <br />
            Novedades - Herramientas - Tendencias en IA
          </h2>

          <p className="text-center text-gray-600 max-w-3xl mx-auto mt-4">
            Publico ideas prácticas para aplicar IA en negocios reales y también en creación de contenido.
          </p>

          {ultimoPost ? (
            <div className="bg-gray-50 p-8 rounded-2xl shadow-lg max-w-4xl mx-auto relative border border-gray-100 mt-10">
              {user && (
                <div className="absolute top-4 right-4 flex gap-3">
                  <Link
                    href={`/admin?edit=post&id=${ultimoPost.id}`}
                    className="bg-yellow-500 text-white px-4 py-2 rounded shadow hover:bg-yellow-600 transition text-sm font-medium"
                  >
                    Editar Post
                  </Link>
                  <button
                    onClick={() => handleDeletePost(ultimoPost.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 transition text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              )}
              <h3 className="text-2xl font-bold mb-4 text-blue-700">{ultimoPost.titulo}</h3>
              <p className="text-gray-600 mb-6">{ultimoPost.excerpt}</p>
              <Link href={`/blog/${ultimoPost.id}`} className="text-blue-600 font-semibold hover:underline">
                Leer más →
              </Link>
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-10">Próximamente nuevas publicaciones...</p>
          )}

          <div className="text-center mt-8">
            <Link href="/blog" className="text-blue-700 font-semibold hover:underline text-lg">
              Ver todos los artículos →
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICIOS IA - NEGOCIOS */}
      <section id="servicios-ia" className="py-16 md:py-20 bg-blue-50 text-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-blue-900">
            Servicios de Consultoría IA
          </h2>
          <p className="text-center text-gray-700 max-w-3xl mx-auto mb-12">
            Dos caminos: IA para negocios (ventas y automatización) y IA para creadores (contenido y producción).
          </p>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Negocios */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">🧾 IA para Negocios</h3>
              <p className="text-gray-700 mb-6">
                Ideal para comercios, emprendedores, importadores y pymes que quieren ahorrar tiempo y aumentar ventas.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-blue-50 border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-2">📲 WhatsApp Inteligente</h4>
                  <p className="text-sm text-gray-700">
                    Respuestas rápidas, atención 24/7, filtros y guiones para cerrar ventas.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-blue-50 border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-2">🧾 Presupuestos en minutos</h4>
                  <p className="text-sm text-gray-700">
                    Plantillas + IA para presupuestar rápido y sin errores.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-blue-50 border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-2">⚙️ Automatización de tareas</h4>
                  <p className="text-sm text-gray-700">
                    Formularios, planillas, emails, seguimiento de clientes, etc.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-blue-50 border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-2">📈 Marketing con IA</h4>
                  <p className="text-sm text-gray-700">
                    Publicaciones, anuncios, copy, ideas de campañas y contenido que vende.
                  </p>
                </div>
              </div>
            </div>

            {/* Creadores */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">🎥 IA para Creadores</h3>
              <p className="text-gray-700 mb-6">
                Ideal para creadores de contenido, emprendedores digitales, marcas personales y canales que necesitan producir más.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-blue-50 border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-2">✍️ Contenido con IA</h4>
                  <p className="text-sm text-gray-700">
                    Ideas, guiones, reels, posts, textos, títulos y descripciones.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-blue-50 border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-2">🖼️ Imágenes consistentes</h4>
                  <p className="text-sm text-gray-700">
                    Prompts, estilo visual, control de personajes y producción.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-blue-50 border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-2">🎬 Producción más rápida</h4>
                  <p className="text-sm text-gray-700">
                    Automatización de flujos: guión → post → publicación.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-blue-50 border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-2">🧠 Marca personal</h4>
                  <p className="text-sm text-gray-700">
                    Mensajes, posicionamiento y estrategia para crecer sin quemarte.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="#contacto"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition shadow-md"
            >
              Quiero aplicar IA en mi caso <span className="text-xl">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CÓMO TRABAJO */}
      <section id="como-trabajo" className="py-16 md:py-20 bg-white text-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-blue-900">
            Cómo Trabajo Contigo
          </h2>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-gray-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Diagnóstico Estratégico</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Analizo tu negocio o tu marca y detecto dónde aplicar IA para ahorrar tiempo y aumentar resultados.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Implementación + IA</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Configuro tus herramientas, plantillas, prompts y automatizaciones para que funcione de verdad.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Capacitación + Soporte</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Te enseño a usarlo y te dejo un sistema simple para que no dependas de nadie.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PAQUETES */}
      <section id="paquetes" className="py-20 bg-gray-50 text-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-blue-900">
            Paquetes de Consultoría IA
          </h2>

          <p className="text-center text-gray-700 max-w-3xl mx-auto mb-12">
            Elegí el nivel según tu necesidad. También puedo armarte un plan a medida.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pack 1 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition">
              <h3 className="text-2xl font-bold text-blue-900 mb-2">💡 Diagnóstico IA</h3>
              <p className="text-gray-600 mb-6">Ideal para arrancar y entender qué hacer.</p>
              <ul className="space-y-3 text-gray-700 text-sm">
                <li>✅ 1 sesión (online)</li>
                <li>✅ Ideas claras para aplicar IA</li>
                <li>✅ Plan de acción</li>
                <li>✅ Recomendación de herramientas</li>
              </ul>
              <div className="mt-8">
                <Link
                  href="#contacto"
                  className="block text-center bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  Consultar
                </Link>
              </div>
            </div>

            {/* Pack 2 */}
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-200 p-8 hover:shadow-2xl transition relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow">
                Más elegido
              </div>

              <h3 className="text-2xl font-bold text-blue-900 mb-2">⚙️ Implementación</h3>
              <p className="text-gray-600 mb-6">Sistema funcionando en pocos días.</p>
              <ul className="space-y-3 text-gray-700 text-sm">
                <li>✅ Prompts y guiones listos</li>
                <li>✅ Plantillas de WhatsApp</li>
                <li>✅ Presupuestos rápidos</li>
                <li>✅ Mini automatización (según caso)</li>
              </ul>
              <div className="mt-8">
                <Link
                  href="#contacto"
                  className="block text-center bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  Quiero este
                </Link>
              </div>
            </div>

            {/* Pack 3 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition">
              <h3 className="text-2xl font-bold text-blue-900 mb-2">🚀 Automatización Full</h3>
              <p className="text-gray-600 mb-6">Para negocios y creadores que quieren escalar.</p>
              <ul className="space-y-3 text-gray-700 text-sm">
                <li>✅ Automatización completa</li>
                <li>✅ Formularios + planillas</li>
                <li>✅ Flujo de ventas / leads</li>
                <li>✅ Soporte + optimización</li>
              </ul>
              <div className="mt-8">
                <Link
                  href="#contacto"
                  className="block text-center bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  Hablemos
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-700 mb-4">
              ¿No sabés cuál elegir? Te digo cuál te conviene según tu caso.
            </p>
            <Link
              href="#contacto"
              className="inline-flex items-center gap-2 bg-blue-900 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-800 transition shadow-md"
            >
              Quiero que me asesores <span className="text-xl">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CASOS / SISTEMAS IMPLEMENTADOS */}
<section id="proyectos" className="py-20 bg-white">
  <div className="max-w-7xl mx-auto px-6">
    <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-blue-900">
      Sistemas y Proyectos
    </h2>

    <p className="text-center text-gray-700 max-w-4xl mx-auto mb-12">
      Acá te muestro ejemplos reales de lo que construyo: sitios, sistemas y soluciones digitales.
      <br className="hidden sm:block" />
      Mi foco hoy es <strong>automatizar ventas</strong>, mejorar atención y aplicar IA de forma práctica.
    </p>

    {loading ? (
      <p className="text-center text-gray-600 text-lg py-10">Cargando proyectos...</p>
    ) : trabajos.length === 0 ? (
      <p className="text-center text-gray-600 text-lg py-10">
        Aún no hay proyectos cargados.
      </p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {trabajos.map((trabajo) => {
          const titulo = trabajo.titulo || 'Proyecto sin título';
          const tieneImagen = !!trabajo.imagenUrl;

          return (
            <div
              key={trabajo.id}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition border border-gray-100"
            >
              {/* Imagen */}
              <div className="relative">
                {tieneImagen ? (
                  <img
                    src={trabajo.imagenUrl}
                    alt={titulo}
                    className="w-full h-56 object-cover group-hover:scale-[1.02] transition duration-300"
                  />
                ) : (
                  <div className="w-full h-56 bg-gray-100 flex items-center justify-center text-gray-500">
                    Sin imagen
                  </div>
                )}

                {/* Badge (sin tocar Firestore) */}
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-full shadow-md">
                    Caso / Proyecto
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-3 text-blue-900 leading-tight">
                  {titulo}
                </h3>

                {/* Descripción */}
                <div
                  className="text-gray-600 mb-5 line-clamp-4 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: trabajo.descripcion || 'Sin descripción disponible',
                  }}
                />

                {/* CTA */}
                <div className="flex items-center justify-between gap-4">
                  <Link
                    href="/trabajos"
                    className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:underline"
                  >
                    Ver detalles <span aria-hidden="true">→</span>
                  </Link>

                  <Link
                    href="#contacto"
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-700 transition shadow"
                  >
                    Quiero algo así
                  </Link>
                </div>

                {/* Admin */}
                {user && (
                  <div className="flex gap-4 mt-6">
                    <Link
                      href={`/admin?edit=trabajo&id=${trabajo.id}`}
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition text-sm font-medium"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDeleteTrabajo(trabajo.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}

    {/* CTA final */}
    <div className="text-center mt-14">
      <p className="text-gray-700 mb-5 text-lg">
        ¿Querés que tu negocio tenga un sistema así, pero con IA y automatización?
      </p>

      <Link
        href="#contacto"
        className="inline-flex items-center gap-2 bg-blue-900 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-800 transition shadow-md"
      >
        Quiero una demo <span className="text-xl">→</span>
      </Link>
    </div>
  </div>
</section>



      {/* SOBRE MÍ */}
      <section id="sobre-mi" className="py-20 bg-gradient-to-b from-white to-gray-50 text-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative mx-auto lg:mx-0 max-w-md">
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-blue-100">
                <Image
                  src="/img/Captura de pantalla 2025-08-05 193102.png"
                  alt="Diego Godoy"
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-blue-900">Sobre Mí</h2>

              <p className="text-lg leading-relaxed">
                Hola, soy Diego, creador de <strong>IACreativaTools</strong>.
              </p>

              <p className="text-lg leading-relaxed">
                Soy técnico y desarrollador, con más de 10 años en soluciones digitales.
                Hoy me especializo en <strong>Consultoría de Inteligencia Artificial aplicada</strong>.
              </p>

              <p className="text-lg leading-relaxed">
                Mi enfoque es simple: <strong>IA práctica</strong>. Nada de humo.
                Armo sistemas que te ayudan a <strong>vender más</strong>, responder más rápido,
                automatizar tareas y trabajar con más orden.
              </p>

              <p className="text-lg leading-relaxed">
                Si sos creador, también puedo ayudarte a producir contenido, mantener consistencia visual,
                y acelerar tu flujo creativo con IA.
              </p>

              <div className="pt-4">
                <Link
                  href="#contacto"
                  className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition shadow-md inline-flex items-center gap-2"
                >
                  Hablemos de tu caso <span className="text-xl">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-blue-900">
            Lo que Dicen de mis Proyectos
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-blue-50 p-8 rounded-xl shadow-inner border border-blue-100">
              <p className="text-xl italic text-center font-serif text-gray-700 mb-6">
                "Diego armó el sitio web de mi negocio de sublimación. Quedó excelente, rápido y fácil de usar. A las
                pocas semanas ya noté más ventas. ¡Recomendado!"
              </p>
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <Image
                    src="/img/logo.png"
                    alt="Logo de MDT Sublimados"
                    width={64}
                    height={64}
                    className="rounded-full object-cover mb-2"
                  />
                  <p className="font-semibold text-blue-900">MDT Sublimados</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-blue-900">Contacto</h2>
          <p className="text-center text-gray-700 max-w-3xl mx-auto mb-10">
            Contame qué hacés y qué querés mejorar. Si tu caso aplica, te respondo con una propuesta o una demo.
          </p>

          <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-md text-gray-900">
            <form action="https://formcarry.com/s/r4kI5AhCMyK" method="POST" className="space-y-4">
              <input
                type="text"
                name="nombre"
                placeholder="Tu Nombre"
                className="w-full p-3 border rounded-lg"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="tuemail@ejemplo.com"
                className="w-full p-3 border rounded-lg"
                required
              />

              <input
                type="text"
                name="negocio"
                placeholder="¿Qué negocio o proyecto tenés? (ej: tienda, importadora, creador, etc.)"
                className="w-full p-3 border rounded-lg"
              />

              <textarea
                name="mensaje"
                placeholder="¿Qué querés mejorar? (WhatsApp, ventas, presupuestos, contenido, automatización...)"
                rows={6}
                className="w-full p-3 border rounded-lg"
                required
              ></textarea>

              <button
                type="submit"
                className="w-full bg-blue-900 text-white font-semibold py-3 rounded-lg hover:bg-blue-800 transition shadow-md"
              >
                Enviar Mensaje
              </button>

              <p className="text-xs text-gray-500 text-center pt-2">
                Respondo lo antes posible. Si preferís, podés escribirme directo por WhatsApp.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center md:text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">IACREATIVATOOLS</h3>
              <p className="text-blue-200">Consultoría IA · Automatización · Desarrollo Web</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-blue-200">
                <li>
                  <Link href="/">Inicio</Link>
                </li>
                <li>
                  <Link href="#servicios-ia">Servicios IA</Link>
                </li>
                <li>
                  <Link href="#paquetes">Paquetes</Link>
                </li>
                <li>
                  <Link href="#contacto">Contacto</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Redes</h4>
              <div className="flex justify-center md:justify-start space-x-6 text-3xl">
                <a
                  href="https://instagram.com/tu_usuario"
                  target="_blank"
                  className="hover:text-pink-400 transition"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="https://linkedin.com/in/tu_usuario"
                  target="_blank"
                  className="hover:text-blue-400 transition"
                >
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="https://wa.me/5491168808942" target="_blank" className="hover:text-green-400 transition">
                  <i className="fab fa-whatsapp"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-blue-800 text-center text-blue-300">
            <p>© {new Date().getFullYear()} IACREATIVATOOLS. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      <div suppressHydrationWarning>
        <style>{`
          .eapps-chat-floating-button, [class*='elfsight-app'] { display: none !important; }
        `}</style>
      </div>

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
    </div>
  );
}
