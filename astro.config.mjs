// @ts-check
import { defineConfig } from "astro/config"

import tailwindcss from "@tailwindcss/vite"

import vercel from "@astrojs/vercel"
import clerk from "@clerk/astro"
import { esMX } from "@clerk/localizations"

// https://astro.build/config
export default defineConfig({
  output: "server",
  security: {
    checkOrigin: false,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    clerk({
      localization: esMX,
    }),
  ],
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
})
