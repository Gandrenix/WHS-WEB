import type { Metadata } from 'next';
import { Inter, IBM_Plex_Mono, Fraunces, Bricolage_Grotesque } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/features/navbar';
import { getCurrentProfile } from '@/entities/profile/server';
import { getUnreadNotificationsCount } from '@/entities/notification/server';
import { getSongs } from '@/entities/song/server';
import { NotificationBell } from '@/features/notifications';
import { siteConfig } from '@/shared/config/site';
import { AudioPlayerProvider } from '@/shared/ui/AudioPlayerProvider';

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

const TITLE = 'Wiener Hound Studios — Sistema ESTRATO';
const DESCRIPTION =
  'Todo lo que hacemos empieza excavando. Atelier de excavación obsesiva: Bioinformática, Ingeniería Creativa y Pale Veil.';

export const metadata: Metadata = {
  // Sin metadataBase, las URLs relativas de abajo (openGraph.images, etc.) no se pueden
  // resolver a absolutas y Next avisa en cada build. Cada página hija (login, un proyecto)
  // hereda esto y solo necesita sobreescribir title/description/openGraph.
  metadataBase: new URL(siteConfig.url),
  title: { default: TITLE, template: `%s — ${siteConfig.name}` },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/',
    siteName: siteConfig.name,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.jpg'],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, songs] = await Promise.all([getCurrentProfile(), getSongs()]);
  const notificationBell = profile ? (
    <NotificationBell initialUnreadCount={await getUnreadNotificationsCount(profile.id)} />
  ) : null;

  return (
    <html
      lang="es"
      className={`${inter.variable} ${ibmPlexMono.variable} ${fraunces.variable} ${bricolage.variable} scroll-smooth`}
    >
      <body className="bg-[#F2EDE4] text-[#3A3532] font-sans overflow-x-hidden antialiased">
        {/* Un solo reproductor para todo el sitio: el botón del header y la tarjeta
            "Diseño Sonoro" de STRATA II leen y controlan el mismo, vía useAudioPlayer(). */}
        <AudioPlayerProvider songs={songs}>
          <Navbar profile={profile} notificationBell={notificationBell} />
          {children}
        </AudioPlayerProvider>
      </body>
    </html>
  );
}