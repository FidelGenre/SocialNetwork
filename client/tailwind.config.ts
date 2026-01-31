import type { Config } from "tailwindcss";

const config: Config = {
  // 👇 ESTA ES LA LÍNEA CLAVE PARA QUE EL BOTÓN FUNCIONE
  darkMode: "class",

  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}", // Agregamos tus features
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "border-color": "var(--border-color)", 
      },
    },
  },
  plugins: [],
};

export default config;