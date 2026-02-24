import { turso } from "../turso"
import type { APIContext } from "astro"
export async function GET({ params, request }: APIContext) {
  try {
    const url = new URL(request.url)
    const name = url.searchParams.get("name")
    let rows

    if (name) {
      // 2. Consulta con filtro (usando placeholders para evitar SQL Injection)
      const result = await turso.execute({
        sql: "SELECT * FROM participants WHERE name LIKE ?",
        args: [`%${name}%`],
      })
      rows = result.rows
    } else {
      // 3. Consulta normal si no hay parámetros
      const result = await turso.execute("SELECT * FROM participants")
      rows = result.rows
    }

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
