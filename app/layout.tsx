import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import classNames from 'classnames'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import React from 'react'
import 'tailwindcss/tailwind.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'UG Admissions',
  description: 'Manage undergraduate admissions'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={classNames(inter.className, 'p-6')}>
        <Theme>{children}</Theme>
      </body>
    </html>
  )
}
