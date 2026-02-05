'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { auth, db } from '../../lib/firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';

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
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrabajos(docs);
    } catch (error) {
      console.error("Error cargando trabajos:", error);
    } finally {
      // ← ACA PONÉ ESTO (siempre se ejecuta, termine bien o mal)
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
        console.error("Error cargando post:", error);
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
      setTrabajos(trabajos.filter(t => t.id !== id));
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

      {/* BOTÓN FLOTANTE WHATSAPP - AL LADO DEL CHATBOT */}
<a
  href="https://wa.me/5491168808942?text=Hola%20Diego%2C%20quiero%20hablar%20sobre%20mi%20sitio%20web"
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-6 right-[120px] z-[9999] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#20b858] transition-all duration-300 hover:scale-110 flex items-center justify-center"
  aria-label="Chatea conmigo por WhatsApp"
  title="Chatea conmigo por WhatsApp"
>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="32" 
    height="32" 
    fill="currentColor" 
    viewBox="0 0 16 16"
  >
    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
  </svg>
</a>
      

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-blue-900">
          <Link href="/" className="text-2xl font-bold">
            Diego Godoy
          </Link>

          <div className="flex items-center gap-8">
            <ul className="hidden md:flex space-x-8 text-lg font-medium">
              <li><Link href="/" className="hover:text-blue-600 transition">Inicio</Link></li>
              <li><Link href="#sobre-mi" className="hover:text-blue-600 transition">Sobre Mí</Link></li>
              <li><Link href="#proyectos" className="hover:text-blue-600 transition">Mis Trabajos</Link></li>
              <li><Link href="#contacto" className="hover:text-blue-600 transition">Contacto</Link></li>
            </ul>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    href="/admin"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Panel Admin
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    Salir
                  </button>
                </>
              ) : (
                <Link
                  href="/admin"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Admin Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-24 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Desarrollo tu Sitio Web Profesional
        </h1>
        <p className="text-xl max-w-3xl mb-12 opacity-90">
          Transformo ideas en soluciones digitales que generan clientes.
        </p>
        <div className="flex gap-6">
          <Link href="#proyectos" className="bg-white text-blue-700 px-8 py-4 rounded-full font-semibold shadow-lg hover:bg-gray-100 transition">
            Ver Proyectos
          </Link>
          <Link href="#contacto" className="bg-white text-blue-700 px-8 py-4 rounded-full font-semibold shadow-lg hover:bg-gray-100 transition">
            Hablar conmigo
          </Link>
        </div>
      </section>

      {/* ÚLTIMA PUBLICACIÓN DEL BLOG */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-8 text-blue-900">
            Última Publicación del Blog
          </h2>

          {ultimoPost ? (
            <div className="bg-gray-50 p-8 rounded-2xl shadow-lg max-w-4xl mx-auto relative border border-gray-100">
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
            <p className="text-center text-gray-500">Próximamente nuevas publicaciones...</p>
          )}

          <div className="text-center mt-8">
            <Link href="/blog" className="text-blue-700 font-semibold hover:underline text-lg">
              Ver todos los artículos →
            </Link>
          </div>
        </div>
      </section>

     {/* CÓMO TRABAJO - 3 CARDS CHICAS Y PROFESIONALES */}
<section id="como-trabajo" className="py-16 md:py-20 bg-blue-50 text-gray-800">
  <div className="max-w-7xl mx-auto px-6">
    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-blue-900">
      Cómo Trabajo Contigo
    </h2>

    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
      {/* Card 1 */}
      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
          1
        </div>
        <h3 className="text-xl font-bold text-blue-900 mb-3">
          Diagnóstico Estratégico
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          Analizo tu negocio, objetivos y público para crear una estrategia digital que genere conversiones reales.
        </p>
      </div>

      {/* Card 2 */}
      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
          2
        </div>
        <h3 className="text-xl font-bold text-blue-900 mb-3">
          Diseño + IA Integrada
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          Diseño moderno y optimizado, con herramientas de IA que automatizan procesos y mejoran resultados sin complicaciones.
        </p>
      </div>

      {/* Card 3 */}
      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
          3
        </div>
        <h3 className="text-xl font-bold text-blue-900 mb-3">
          Desarrollo y Crecimiento Continuo
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          Desarrollo rápido y limpio, entrega con capacitación y soporte estratégico para que tu sitio siga escalando.
        </p>
      </div>
    </div>
  </div>
</section>



{/* TRABAJOS DINÁMICOS */}
<section id="proyectos" className="py-20 bg-gray-50">
  <div className="max-w-7xl mx-auto px-6">
    <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-blue-900">
      Mis Trabajos
    </h2>

    {loading ? (
      <p className="text-center text-gray-600 text-lg py-10">
        Cargando trabajos...
      </p>
    ) : trabajos.length === 0 ? (
      <p className="text-center text-gray-600 text-lg py-10">
        Aún no hay proyectos cargados.
      </p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {trabajos.map((trabajo) => (
          <div
            key={trabajo.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition"
          >
            {/* Imagen */}
            {trabajo.imagenUrl ? (
              <img
                src={trabajo.imagenUrl}
                alt={trabajo.titulo || 'Trabajo sin título'}
                className="w-full h-56 object-cover"
              />
            ) : (
              <div className="w-full h-56 bg-gray-200 flex items-center justify-center text-gray-500">
                Sin imagen
              </div>
            )}

            <div className="p-6">
              <h3 className="text-2xl font-bold mb-3 text-blue-900">
                {trabajo.titulo || 'Sin título'}
              </h3>
              <div
  className="text-gray-600 mb-4 line-clamp-3 prose prose-sm"
  dangerouslySetInnerHTML={{
    __html: trabajo.descripcion || 'Sin descripción disponible'
  }}
/>

              {/* Link simple "Ver Proyecto →" que lleva a /trabajos */}
              <Link
                href="/trabajos"
                className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
              >
                Ver Proyecto <span aria-hidden="true">→</span>
              </Link>

              {/* Botones admin (solo si está logueado) */}
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
        ))}
      </div>
    )}
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
              <h2 className="text-4xl md:text-5xl font-bold text-blue-900">
                Sobre Mí
              </h2>
              <p className="text-lg leading-relaxed">
                Hola, soy Diego desde Tristán Suárez, Buenos Aires. Me apasiona la tecnología y crear soluciones que generen resultados reales.
              </p>
              <p className="text-lg leading-relaxed">
                Desarrollo sitios web profesionales para emprendedores e integro herramientas de IA. Además, lidero el proyecto <strong>Somos Otra Radio</strong>.
              </p>
              <div className="pt-4">
                <Link href="#contacto" className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition shadow-md inline-flex items-center gap-2">
                  Hablemos de tu proyecto <span className="text-xl">→</span>
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
            Lo que Dicen de Mi Trabajo
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-blue-50 p-8 rounded-xl shadow-inner border border-blue-100">
              <p className="text-xl italic text-center font-serif text-gray-700 mb-6">
                "Diego diseñó y desarrolló el sitio web de mi negocio de sublimación. Las ventas aumentaron rápidamente. ¡Recomendado!"
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
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">Contacto</h2>
          <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-md text-gray-900">
            <form action="https://formcarry.com/s/r4kI5AhCMyK" method="POST" className="space-y-4">
              <input type="text" name="nombre" placeholder="Tu Nombre" className="w-full p-3 border rounded-lg" required />
              <input type="email" name="email" placeholder="tuemail@ejemplo.com" className="w-full p-3 border rounded-lg" required />
              <textarea name="mensaje" placeholder="Cuéntame sobre tu proyecto..." rows={5} className="w-full p-3 border rounded-lg" required></textarea>
              <button type="submit" className="w-full bg-blue-900 text-white font-semibold py-3 rounded-lg hover:bg-blue-800 transition shadow-md">
                Enviar Mensaje
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center md:text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Diego Godoy</h3>
              <p className="text-blue-200">Desarrollador Web para Emprendedores</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-blue-200">
                <li><Link href="/">Inicio</Link></li>
                <li><Link href="#sobre-mi">Sobre Mí</Link></li>
                <li><Link href="#contacto">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Redes</h4>
              <div className="flex justify-center md:justify-start space-x-6 text-3xl">
                <a href="https://instagram.com/tu_usuario" target="_blank" className="hover:text-pink-400 transition"><i className="fab fa-instagram"></i></a>
                <a href="https://linkedin.com/in/tu_usuario" target="_blank" className="hover:text-blue-400 transition"><i className="fab fa-linkedin"></i></a>
                <a href="https://wa.me/5491168808942" target="_blank" className="hover:text-green-400 transition"><i className="fab fa-whatsapp"></i></a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-blue-800 text-center text-blue-300">
            <p>© {new Date().getFullYear()} Diego Godoy. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

    <div suppressHydrationWarning>
  <style>{`
    .eapps-chat-floating-button, [class*='elfsight-app'] { display: none !important; }
  `}</style>
  {/* Resto del contenido */}
</div>
      
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
    </div>
  );
}