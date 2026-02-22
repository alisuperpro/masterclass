import { turso } from "../turso"

export async function GET({ params, request }) {
  try {
    const { rows } = await turso.execute({
      sql: "SELECT * FROM participants",
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
        message: "Error to get data",
      }),
      { status: 500 },
    )
  }
}
