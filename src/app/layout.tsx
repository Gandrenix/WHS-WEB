import type { Metadata } from 'next';
import { Inter, IBM_Plex_Mono, Fraunces, Bricolage_Grotesque } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/features/navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
});
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
});

export const metadata: Metadata = {
  title: 'Wiener Hound Studios — Sistema ESTRATO',
  description: 'Todo lo que hacemos empieza excavando. Atelier de excavación obsesiva: Bioinformática, Ingeniería Creativa y Pale Veil.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${ibmPlexMono.variable} ${fraunces.variable} ${bricolage.variable} scroll-smooth`}
    >
      <body className="bg-[#F2EDE4] text-[#3A3532] font-sans overflow-x-hidden antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}