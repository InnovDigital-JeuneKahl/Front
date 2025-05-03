"use client"

import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className="light" lang="en">
      <body className={inter.className + " bg-background text-foreground"}>
        {children}
      </body>
    </html>
  )
}