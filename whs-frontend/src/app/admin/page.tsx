'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/admin/dashboard');
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-5 relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#9d2ec5]/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[400px] bg-[#121214]/80 backdrop-blur-xl p-8 sm:p-10 rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative z-10 animate-[fadeIn_0.5s_ease-out]">
        
        <div className="flex flex-col items-center mb-8">
          <Image src="/images/logo.png" alt="WHS Logo" width={50} height={50} className="mb-4" />
          <h2 className="text-2xl font-poppins font-bold text-white tracking-tight">Acceso Restringido</h2>
          <p className="text-sm text-[#94a3b8] mt-1 text-center">Panel de administración exclusivo de Wiener Hound Studios.</p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
            {error === 'Invalid login credentials' ? 'Credenciales inválidas' : error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block mb-1.5 text-sm text-[#94a3b8] font-medium">Correo Electrónico</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@wienerhound.com"
              required 
              className="w-full p-3.5 border border-white/10 bg-black/30 text-white rounded-xl focus:border-[#9d2ec5] focus:bg-black/50 focus:outline-none focus:ring-2 focus:ring-[#9d2ec5]/20 transition-all text-sm"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm text-[#94a3b8] font-medium">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
              className="w-full p-3.5 border border-white/10 bg-black/30 text-white rounded-xl focus:border-[#9d2ec5] focus:bg-black/50 focus:outline-none focus:ring-2 focus:ring-[#9d2ec5]/20 transition-all text-sm"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full mt-2 bg-white text-black font-semibold py-3.5 rounded-xl hover:bg-[#00e68a] hover:shadow-[0_0_20px_rgba(0,230,138,0.4)] transition-all duration-300 disabled:opacity-50 text-sm">
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 text-center">
           <Link href="/" className="text-xs text-[#94a3b8] hover:text-white transition-colors">← Volver al sitio principal</Link>
        </div>
      </div>
    </main>
  );
}