import type { APIRoute } from "astro"
import { turso } from "../../turso"

export const PUT: APIRoute = async ({ request }) => {
  const data = await request.json()

  const { id, isDelivered } = data

  try {
    await turso.execute(
      "UPDATE participants SET menu_delivered = ? WHERE id = ?",
      [isDelivered ? "si" : "no", id],
    )

    const { rows } = await turso.execute({
      sql: "SELECT * FROM participants WHERE id = ?",
      args: [id],
    })

    return new Response(
      JSON.stringify({
        data: rows,
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
