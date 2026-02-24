// src/pages/api/get-image.ts
import { get } from "@vercel/blob"
import type { APIRoute } from "astro"

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  const file = url.searchParams.get("file")

  if (!file) return new Response("Missing file", { status: 400 })

  try {
    const result = await get(`pays/${file}`, {
      access: "private",
      token: import.meta.env.BLOB_READ_WRITE_TOKEN,
    })

    return new Response(result?.stream, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        // --- CONFIGURACIÓN PARA PETICIONES EXTERNAS (CORS) ---
        "Access-Control-Allow-Origin": "*", // Permite a cualquier dominio (o pon el tuyo)
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (e) {
    console.log(e)
    return new Response("Not found", { status: 404 })
  }
}
