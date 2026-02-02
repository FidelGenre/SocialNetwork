import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

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
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        
        {/* 👇 AGREGA ESTO JUSTO AL PRINCIPIO DEL BODY */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // 1. Buscamos si el usuario ya eligió un tema
                  var savedTheme = localStorage.getItem('theme');
                  
                  // 2. Si es 'light', ponemos modo claro. Si es 'dark' O no hay nada, ponemos OSCURO.
                  if (savedTheme === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                  } else {
                    // Por defecto forzamos oscuro aquí
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
        {/* 👆 FIN DEL SCRIPT */}

        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}