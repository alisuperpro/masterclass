import { turso } from "../turso"
import type { APIContext } from "astro"

export async function GET({ request }: APIContext) {
  try {
    const validMenus = [
      "Asado negro",
      "Pollo a la plancha",
      "Hamburguesa",
      "Pasta boloñesa",
    ]

    const query = `
      SELECT menu, COUNT(*) as count 
      FROM participants 
      WHERE menu IN (?, ?, ?, ?)
      GROUP BY menu
    `

    const { rows } = await turso.execute({
      sql: query,
      args: validMenus,
    })

    const stats = rows.reduce((acc: any, row: any) => {
      acc[row.menu] = row.count
      return acc
    }, {})

    return new Response(
      JSON.stringify({
        data: stats,
        message: "Conteo de menús obtenido con éxito",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (err) {
    console.error("Error en el conteo de menús:", err)
    return new Response(
      JSON.stringify({ message: "Error al obtener estadísticas" }),
      { status: 500 },
    )
  }
}
