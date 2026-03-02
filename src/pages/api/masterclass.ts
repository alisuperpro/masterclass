import type { APIRoute } from "astro"

import { put } from "@vercel/blob"

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData()
  const img_name = data.get("img_name")
  const payImg = data.get("pay") as File

  try {
    const blob = await put(`pays/${img_name}`, payImg, {
      access: "private",
      token: import.meta.env.BLOB_READ_WRITE_TOKEN,
    })

    return new Response(
      JSON.stringify({
        data: "success",
        message: "Success!",
      }),
      { status: 200 },
    )
  } catch (err) {
    console.log(err)
    return new Response(
      JSON.stringify({
        message: "Error to save data",
      }),
      { status: 500 },
    )
  }
}
