"use client"; // Make this a Client Component

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { metadata } from "./metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
        <head>
          <title>{metadata.title}</title>
          <meta name="description" content={metadata.description} />
          <meta
            name="viewport"
            content={`width=${metadata.viewport.width}, initial-scale=${metadata.viewport.initialScale}, maximum-scale=${metadata.viewport.maximumScale}`}
          />
          <meta name="theme-color" content={metadata.themeColor} />
          <link rel="manifest" href={metadata.manifest} />
          {metadata.icons.icon.map((icon, index) => (
            <link key={index} rel="icon" href={icon.url} sizes={icon.sizes} />
          ))}
          {metadata.icons.shortcut.map((icon, index) => (
            <link key={`shortcut-${index}`} rel="shortcut icon" href={icon} />
          ))}
          {metadata.icons.apple.map((icon, index) => (
            <link
              key={`apple-${index}`}
              rel="apple-touch-icon"
              href={icon.url}
              sizes={icon.sizes}
              type={icon.type}
            />
          ))}
        </head>
        <body>{children}</body>
      </html>
    </SessionProvider>
  );
}
