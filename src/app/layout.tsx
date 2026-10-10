import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wispr Flow Studio | Voice-Driven Dev Workspace & Turso SQLite Engine",
  description:
    "An interactive voice-driven development studio built with Wispr Flow, Turso LibSQL, and SQLite. Turn spoken thoughts into code, sprint tasks, and schemas hands-free.",
  keywords: [
    "Wispr Flow",
    "Voice Development",
    "Voice-to-Code",
    "Turso",
    "SQLite",
    "Next.js",
    "Vercel",
    "HHGoa Hackathon",
  ],
  authors: [{ name: "Sanskar Dubey", url: "https://github.com/dubeysanskar" }],
  openGraph: {
    title: "Wispr Flow Studio - Voice-Driven Developer Workspace",
    description: "Voice-driven coding assistant powered by Wispr Flow with Turso LibSQL SQLite storage.",
    url: "https://flow-psi-cyan.vercel.app",
    siteName: "Wispr Flow Studio",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090a0f] text-zinc-100 antialiased selection:bg-violet-500/30 selection:text-violet-200">
        {children}
      </body>
    </html>
  );
}
