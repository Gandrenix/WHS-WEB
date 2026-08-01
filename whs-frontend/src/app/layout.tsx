import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ 
  weight: ['300', '400', '600', '700', '800'],
  subsets: ['latin'], 
  variable: '--font-poppins' 
});

export const metadata: Metadata = {
  title: 'Wiener Hound Studios',
  description: 'Transformando ideas en experiencias inmersivas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable} scroll-smooth`}>
      <body className="bg-[#0a0a0b] text-[#f8fafc] font-inter overflow-x-hidden antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}