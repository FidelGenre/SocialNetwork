"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      // 👇 HE QUITADO "transition-colors" para que el botón cambie de color al instante
      className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      title="Cambiar tema"
    >
      {theme === "dark" ? (
        // 👇 HE QUITADO "transition-all" del icono
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}