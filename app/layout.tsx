import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CodeClarity Academy | Learn to Code Without the Confusion',
  description: '1-on-1 tutoring in Python, Java, math, and web development. Designed for students who want to actually get it.',
  keywords: 'coding tutor, programming tutor, Python tutor, Java tutor, web development tutor, online coding classes, programming help',
  authors: [{ name: 'CodeClarity' }],
  creator: 'CodeClarity',
  publisher: 'CodeClarity',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://codeclarityacademy.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CodeClarity Academy | Learn to Code Without the Confusion',
    description: '1-on-1 tutoring in Python, Java, math, and web development. Designed for students who want to actually get it.',
    url: 'https://codeclarityacademy.com',
    siteName: 'CodeClarity Academy',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeClarity - Learn to Code Without the Confusion',
    description: '1-on-1 tutoring in Python, Java, math, and web development. Get personalized guidance from expert tutors.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
