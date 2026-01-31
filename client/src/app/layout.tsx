import type { Metadata } from "next";
// import { Inter } from "next/font/google"; // Si usas fuentes, descomenta
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext"; // 👈 IMPORTANTE

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
    <html lang="es">
      <body>
        <AuthProvider>
          {/* 👇 Envolvemos con ThemeProvider DENTRO del AuthProvider (o fuera, da igual) */}
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}