import type { APIRoute } from "astro"
import { turso } from "../../turso"

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json()

  const { id, isArrived } = data

  try {
    await turso.execute("UPDATE participants SET is_arrived = ? WHERE id = ?", [
      isArrived ? "si" : "no",
      id,
    ])

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
