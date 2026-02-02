"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 1. Iniciamos en "dark" para evitar pantallazos blancos
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // Lógica inicial: Revisar si el usuario pidió explícitamente luz
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const root = document.documentElement;

    if (savedTheme === "light") {
      setTheme("light");
      root.classList.remove("dark");
      root.style.colorScheme = "light";
      root.setAttribute("data-theme", "light");
    } else {
      setTheme("dark");
      root.classList.add("dark");
      root.style.colorScheme = "dark";
      root.setAttribute("data-theme", "dark");
      if (!savedTheme) localStorage.setItem("theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    // 1. Calculamos el nuevo tema
    const newTheme = theme === "dark" ? "light" : "dark";

    // 2. 🔥 CAMBIO INSTANTÁNEO (Sin esperar a React)
    // Modificamos el HTML directamente en la primera línea para que el clic sea eléctrico
    const root = document.documentElement;
    
    if (newTheme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark"; // Cambia scrollbars y UI del navegador
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
      root.setAttribute("data-theme", "light");
    }

    // 3. Actualizamos el estado y memoria después (React se pondrá al día luego)
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
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