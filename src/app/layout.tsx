import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import { ThemeProvider } from '@/app/providers'
import { createServer } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Plataforma Oslo',
  description: 'Simplificando seus estudos com ferramentas inteligentes para revisão e organização de materiais.',
 
  icons: {
    icon: '/memphis-logo-grey.png',
}, }

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServer()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    isAdmin = profile?.role === 'admin';
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <div className="flex flex-col min-h-screen">
            <Header user={user} isAdmin={isAdmin} />

            <main className="flex-grow container mx-auto pt-20 pb-30">
              {children}
            </main>
            <Footer user={user} />
          </div>
        </ThemeProvider>
      </body>
    </html>
) }