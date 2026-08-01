import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin');
  }

  // Fetch projects from Supabase
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#121214] border-r border-white/5 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded bg-[#9d2ec5] flex items-center justify-center text-white font-bold font-poppins">W</div>
            <span className="font-poppins font-bold text-white group-hover:text-[#00e68a] transition-colors tracking-tight">WH-STUDIOS</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link href="/admin/dashboard" className="px-4 py-3 bg-white/10 text-white rounded-xl text-sm font-medium border border-white/5">
             Proyectos
          </Link>
          <Link href="/admin/dashboard/nuevo" className="px-4 py-3 text-[#94a3b8] hover:bg-white/5 hover:text-white rounded-xl text-sm font-medium transition-colors">
             Añadir Nuevo
          </Link>
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="bg-black/30 rounded-xl p-4 border border-white/5">
            <p className="text-xs text-[#94a3b8] mb-1">Sesión activa</p>
            <p className="text-sm text-white font-medium truncate" title={user.email}>{user.email}</p>
            <form action="/auth/signout" method="post" className="mt-3">
              <button className="text-xs text-red-400 hover:text-red-300 transition-colors w-full text-left font-medium">Cerrar Sesión</button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-[#121214] border-b border-white/5 p-4 flex justify-between items-center sticky top-0 z-10">
           <div className="font-poppins font-bold text-white">WH-STUDIOS Admin</div>
           <form action="/auth/signout" method="post">
              <button className="text-xs text-red-400 font-medium">Salir</button>
           </form>
        </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-poppins font-bold text-white tracking-tight">Gestor de Proyectos</h1>
              <p className="text-[#94a3b8] text-sm mt-1">Administra el portafolio de Manga, Anime y Novelas Visuales.</p>
            </div>
            <Link href="/admin/dashboard/nuevo" className="bg-[#00e68a] text-black hover:bg-[#00c978] hover:shadow-[0_0_20px_rgba(0,230,138,0.3)] transition-all px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap">
              + Nuevo Proyecto
            </Link>
          </div>
          
          {error ? (
             <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
               Error al cargar la base de datos: {error.message}
             </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="bg-[#121214] border border-white/10 rounded-2xl overflow-hidden hover:border-[#9d2ec5]/50 transition-colors group flex flex-col">
                  <div className="h-48 w-full bg-black/50 relative border-b border-white/5">
                    {project.image_url ? (
                      <img src={project.image_url} alt={project.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#94a3b8] text-sm gap-2">
                        <svg className="w-6 h-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Sin Portada
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider font-semibold">
                        {project.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-poppins font-bold text-lg text-white mb-2 line-clamp-1" title={project.title}>{project.title}</h3>
                    <p className="text-[#94a3b8] text-sm mb-4 line-clamp-2 flex-1">{project.description}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <span className="text-xs text-[#00e68a] bg-[#00e68a]/10 px-2.5 py-1 rounded-lg font-medium">{project.status}</span>
                      <button className="text-xs text-[#94a3b8] hover:text-white transition-colors flex items-center gap-1">
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                         Editar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#121214] rounded-2xl border border-dashed border-white/10 flex flex-col items-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-white text-xl font-poppins font-bold mb-2">Tu portafolio está vacío</h3>
                <p className="text-[#94a3b8] text-sm mb-6 max-w-sm">No hay proyectos para mostrar. Haz clic en el botón de abajo para subir tu primer Manga, Anime o Novela Visual.</p>
                <Link href="/admin/dashboard/nuevo" className="bg-white text-black hover:bg-[#00e68a] transition-colors px-6 py-3 rounded-xl text-sm font-semibold">
                  Crear Primer Proyecto
                </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}