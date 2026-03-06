import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-code-pro",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://notelink-share.vercel.app"),
  title: "NoteLink",
  description: "Write a note and share it instantly with a simple link.",
  icons: {
    icon: [
      { url: "/favicon_io/favicon.ico", sizes: "any" },
      {
        url: "/favicon_io/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon_io/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: "/favicon_io/apple-touch-icon.png",
    shortcut: "/favicon_io/favicon.ico",
  },
  openGraph: {
    type: "website",
    url: "https://notelink-share.vercel.app",
    title: "NoteLink",
    description: "Write a note and share it instantly with a simple link.",
    images: "/og-image.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "NoteLink",
    description: "Write a note and share it instantly with a simple link.",
    images: "/og-image.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${sourceCodePro.variable}`}>
        {children}
      </body>
    </html>
  );
}
