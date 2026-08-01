'use client';

export default function Footer() {
  return (
    <footer className="bg-[#121214] text-[#94a3b8] py-10 text-center border-t border-white/2">
      <div className="container-custom flex justify-between items-center flex-wrap gap-5">
        <p className="m-0 text-[0.95rem] md:text-left text-center w-full md:w-auto">&copy; 2026 Wiener Hound Studios. Todos los derechos reservados.</p>
        <ul className="footer-links list-none flex gap-[25px] p-0 m-0 justify-center w-full md:w-auto">
          <li><button onClick={() => alert('Próximamente')} className="text-[#94a3b8] text-[0.95rem] hover:text-[#f8fafc] transition-colors bg-transparent border-none cursor-pointer">Política de Privacidad</button></li>
          <li><button onClick={() => alert('Próximamente')} className="text-[#94a3b8] text-[0.95rem] hover:text-[#f8fafc] transition-colors bg-transparent border-none cursor-pointer">Términos de Servicio</button></li>
        </ul>
      </div>
    </footer>
  );
}
