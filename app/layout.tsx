import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SupportGenie AI - 24/7 AI Support for Your Business',
  description: 'Never miss a customer again with 24/7 AI support on WhatsApp, Telegram & your website. Save time, boost sales, and keep your clients happy.',
  keywords: 'AI support, customer service, WhatsApp bot, Telegram bot, website chatbot, business automation',
  authors: [{ name: 'SupportGenie AI' }],
  openGraph: {
    title: 'SupportGenie AI - 24/7 AI Support for Your Business',
    description: 'Never miss a customer again with 24/7 AI support on WhatsApp, Telegram & your website.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
