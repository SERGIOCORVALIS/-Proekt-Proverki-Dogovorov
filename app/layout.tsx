import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/hooks/useAuth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Анализатор Юридических Документов',
  description: 'Система автоматического анализа юридических документов с выявлением рисков',
  keywords: ['юридические документы', 'анализ рисков', 'ИИ', 'договоры'],
  authors: [{ name: 'LegalDoc Analyzer' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
