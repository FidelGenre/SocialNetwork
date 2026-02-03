import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
// 👇 1. Importa el Guardia
import AuthGuard from "@/context/AuthGuard";

export const metadata: Metadata = {
  title: "Social Network",
  description: "Built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground transition-none">
        {/* Script para evitar flash blanco (el que pusimos antes) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                  document.documentElement.setAttribute('data-theme', 'light');
                } else {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch (e) {}
            `,
          }}
        />

        <ThemeProvider>
          <AuthProvider>
            {/* 👇 2. AQUÍ ESTÁ LA CLAVE: Envuelve {children} con AuthGuard */}
            <AuthGuard>
              {children}
            </AuthGuard>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}