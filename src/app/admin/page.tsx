import { LoginForm } from '@/features/auth';

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-[#0D0A08] text-[#F2EDE4] flex items-center justify-center p-6 relative overflow-hidden font-mono">
      {/* Luz ambiental de fondo en Púrpura Wiener */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8B2FE0]/25 blur-[140px] rounded-full pointer-events-none" />
      <LoginForm />
    </main>
  );
}