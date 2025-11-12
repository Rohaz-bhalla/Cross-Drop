// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
darkMode: ["class", "html"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
