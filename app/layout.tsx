import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Header } from './header'
import { Footer } from './footer'
import { ThemeProvider } from 'next-themes'
import { Provider as BalancerProvider } from 'react-wrap-balancer'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { WEBSITE_URL } from '@/lib/constants'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111110' }
  ]
}

const DESCRIPTION = 'Jiajun (Nick) Huo is a software engineer, former PM, and data scientist who ships lovable products.'

export const metadata: Metadata = {
  metadataBase: new URL(WEBSITE_URL),
  title: {
    default: 'Nick Huo',
    template: '%s | Nick Huo',
  },
  description: DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: WEBSITE_URL,
    siteName: 'Nick Huo',
    title: 'Nick Huo',
    description: DESCRIPTION,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@imnickhuo',
    title: 'Nick Huo',
    description: DESCRIPTION,
  },
  icons: {
    icon: [
      { url: '/brand/favicon.svg', type: 'image/svg+xml' },
      { url: '/brand/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/brand/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Nick Huo',
  },
  formatDetection: {
    telephone: false,
  },
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* KaTeX CSS for mathematical formulas */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
          integrity="sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn"
          crossOrigin="anonymous"
        />
        
        {/* Safari 状态栏优化 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-touch-fullscreen" content="yes" />
        
        {/* 防止Safari缩放 */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        
        {/* 动态主题颜色 */}
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#111110" media="(prefers-color-scheme: dark)" />
      </head>
      <body
        className={`${inter.variable} bg-white tracking-normal antialiased dark:bg-[#111110]`}
      >
        <ThemeProvider
          enableSystem={true}
          attribute="class"
          storageKey="theme"
          defaultTheme="system"
        >
          <BalancerProvider>
          <div className="flex min-h-screen w-full flex-col font-[family-name:var(--font-inter)]">
            <div className="relative mx-auto w-full max-w-screen-sm flex-1 px-6 pt-12">
              <Header />
              {children}
              <Footer />
            </div>
          </div>
          </BalancerProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        <Script
          id="apollo-tracker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `function initApollo(){var n=Math.random().toString(36).substring(7),o=document.createElement("script");o.src="https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache="+n,o.async=!0,o.defer=!0,o.onload=function(){window.trackingFunctions.onLoad({appId:"69cf4333ba9e76000d848f1c"})},document.head.appendChild(o)}initApollo();`,
          }}
        />
      </body>
    </html>
  )
}
