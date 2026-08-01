'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';

export default function NuevoProyectoPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('manga');
  const [status, setStatus] = useState('En Emisión');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let image_url = null;

      // 1. Upload image if exists
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `project-covers/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('whs-media') // We'll need to create this bucket in Supabase!
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('whs-media')
          .getPublicUrl(filePath);

        image_url = publicUrlData.publicUrl;
      }

      // 2. Insert into database
      const { error: dbError } = await supabase
        .from('projects')
        .insert([
          {
            title,
            description,
            category,
            status,
            image_url,
          }
        ]);

      if (dbError) throw dbError;

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al guardar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex">
      
      {/* Sidebar (Same as dashboard) */}
      <aside className="w-64 bg-[#121214] border-r border-white/5 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded bg-[#9d2ec5] flex items-center justify-center text-white font-bold font-poppins">W</div>
            <span className="font-poppins font-bold text-white group-hover:text-[#00e68a] transition-colors tracking-tight">WH-STUDIOS</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link href="/admin/dashboard" className="px-4 py-3 text-[#94a3b8] hover:bg-white/5 hover:text-white rounded-xl text-sm font-medium transition-colors">
             Proyectos
          </Link>
          <Link href="/admin/dashboard/nuevo" className="px-4 py-3 bg-white/10 text-white rounded-xl text-sm font-medium border border-white/5">
             Añadir Nuevo
          </Link>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-[#121214] border-b border-white/5 p-4 flex justify-between items-center sticky top-0 z-10">
           <Link href="/admin/dashboard" className="text-xs text-[#94a3b8] flex items-center gap-1 font-medium">
             <ArrowLeft className="w-3 h-3" /> Volver
           </Link>
        </header>

        <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full">
          <div className="mb-8">
            <Link href="/admin/dashboard" className="hidden md:inline-flex items-center text-xs text-[#94a3b8] hover:text-white transition-colors mb-4 font-medium bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <ArrowLeft className="w-3 h-3 mr-1.5" />
              Volver a Proyectos
            </Link>
            <h1 className="text-3xl font-poppins font-bold text-white tracking-tight">Publicar Proyecto</h1>
            <p className="text-[#94a3b8] text-sm mt-1">Completa los detalles para añadir un nuevo título a tu portafolio público.</p>
          </div>
          
          <div className="w-full bg-[#121214] border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {/* Image Upload Area */}
              <div>
                <label className="block mb-2 text-sm text-white font-medium">Portada del Proyecto</label>
                <div className="relative w-full h-56 bg-black/40 border border-dashed border-white/20 rounded-xl hover:border-[#9d2ec5]/50 transition-colors flex flex-col items-center justify-center overflow-hidden cursor-pointer group">
                   <input 
                     type="file" 
                     accept="image/*"
                     onChange={handleImageChange}
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                   />
                   {preview ? (
                     <>
                       <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                         <span className="bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 font-medium flex items-center gap-2">
                           <Upload className="w-3 h-3" /> Cambiar Imagen
                         </span>
                       </div>
                     </>
                   ) : (
                     <div className="flex flex-col items-center pointer-events-none p-4 text-center">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3 text-[#94a3b8] group-hover:text-white group-hover:bg-[#9d2ec5]/20 transition-all">
                           <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-white text-sm font-medium mb-1">Click o arrastra la portada aquí</span>
                        <span className="text-xs text-[#94a3b8]">Formatos recomendados: JPG, PNG, WebP (Máx. 5MB)</span>
                     </div>
                   )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block mb-2 text-sm text-[#94a3b8] font-medium">Título del Proyecto <span className="text-red-400">*</span></label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required 
                    className="w-full p-3 border border-white/10 bg-black/30 text-white rounded-xl focus:border-[#00e68a] focus:outline-none focus:ring-1 focus:ring-[#00e68a]/50 transition-all text-sm"
                    placeholder="Ej: Código Estelar"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-[#94a3b8] font-medium">Categoría <span className="text-red-400">*</span></label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 border border-white/10 bg-black/30 text-white rounded-xl focus:border-[#00e68a] focus:outline-none focus:ring-1 focus:ring-[#00e68a]/50 transition-all appearance-none text-sm"
                  >
                    <option value="manga">Manga</option>
                    <option value="anime">Anime</option>
                    <option value="visual-novel">Visual Novel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm text-[#94a3b8] font-medium">Estado de Publicación <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  placeholder="Ej: En Emisión, Próximamente, Finalizado"
                  required 
                  className="w-full p-3 border border-white/10 bg-black/30 text-white rounded-xl focus:border-[#00e68a] focus:outline-none focus:ring-1 focus:ring-[#00e68a]/50 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-[#94a3b8] font-medium">Descripción y Sinopsis <span className="text-red-400">*</span></label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required 
                  placeholder="Escribe un resumen atrapante sobre la trama..."
                  className="w-full p-3 border border-white/10 bg-black/30 text-white rounded-xl focus:border-[#00e68a] focus:outline-none focus:ring-1 focus:ring-[#00e68a]/50 transition-all resize-none text-sm leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-white/5 mt-2">
                <button type="submit" disabled={loading} className="bg-white text-black hover:bg-[#00e68a] hover:shadow-[0_0_20px_rgba(0,230,138,0.3)] transition-all px-8 py-3 rounded-xl text-sm font-bold flex justify-center items-center gap-2 disabled:opacity-50">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : 'Publicar Proyecto Público'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}