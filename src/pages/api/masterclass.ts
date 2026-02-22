import type { APIRoute } from "astro"
import { turso } from "../../turso"
import { randomUUID } from "node:crypto"

import { put } from "@vercel/blob"

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData()
  const name = data.get("fullname")
  const dni = data.get("dni")
  const email = data.get("email")
  const phone = data.get("phone")
  const igUsername = data.get("ig-input")
  const findUs = data.get("find-us")
  const underAge = data.get("under-age")
  const disability = data.get("disability")
  const work = data.get("work")
  const university = data.get("university")
  const experience = data.get("experience")
  const ref = data.get("ref")
  const otherWork = data.get("other-work-input-text")
  const otherUniversity = data.get("other-university-input-text")
  const payImg = data.get("pay") as File

  if (
    !name ||
    !dni ||
    !email ||
    !phone ||
    !igUsername ||
    !findUs ||
    !underAge ||
    !disability ||
    !work ||
    !university ||
    !experience ||
    !ref ||
    !payImg
  ) {
    return new Response(
      JSON.stringify({
        message: "Error missing required fields",
      }),
      { status: 400 },
    )
  }

  const id = randomUUID()
  const splitted = payImg?.name?.split(".")[1]

  const rename = `${id}.${splitted}`

  /* console.log({
    name,
    dni,
    email,
    phone,
    igUsername,
    findUs,
    underAge,
    disability,
    work,
    university,
    experience,
    ref,
    otherWork,
    otherUniversity,
    payImg,
  }) */

  try {
    await turso.execute({
      sql: "INSERT INTO participants (id, name, dni, email,phone, ig_username, find_us, under_age, disability, work, university, experience, pay_ref, pay_img) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      args: [
        id.toString(),
        name?.toString(),
        dni?.toString(),
        email?.toString(),
        phone?.toString(),
        igUsername?.toString(),
        findUs?.toString(),
        underAge?.toString(),
        disability?.toString(),
        work?.toString() === "Otro" ? otherWork?.toString() : work?.toString(),
        university?.toString() === "Otro"
          ? otherUniversity?.toString()
          : university?.toString(),
        experience?.toString(),
        ref?.toString(),
        rename,
      ],
    })

    const blob = await put(`pays/${rename}`, payImg, {
      access: "private",
      token: import.meta.env.BLOB_READ_WRITE_TOKEN,
    })

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
