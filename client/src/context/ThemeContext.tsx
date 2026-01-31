"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // 1. Leer localStorage o preferencia del sistema al cargar
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    
    if (savedTheme) {
      setTheme(savedTheme);
      updateDom(savedTheme);
    } else {
      // Si no hay preferencia guardada, forzamos dark
      setTheme("dark");
      updateDom("dark");
    }
  }, []);

  // Función auxiliar para tocar el DOM (HTML)
  const updateDom = (mode: Theme) => {
    // 1. Cambia el atributo para tus variables CSS personalizadas
    document.documentElement.setAttribute("data-theme", mode);
    
    // 2. IMPORTANTE: Cambia la CLASE para que Tailwind funcione
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    updateDom(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}