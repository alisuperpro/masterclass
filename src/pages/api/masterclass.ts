import type { APIRoute } from "astro"
import { turso } from "../../turso"
import { randomUUID } from "node:crypto"

import { put } from "@vercel/blob"
import { sendEmail } from "@/lib/email"

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
  const work = data.get("work") ?? ""
  const university = data.get("university") ?? ""
  const experience = data.get("experience")
  const ref = data.get("ref")
  const otherWork = data.get("other-work-input-text") ?? ""
  const otherUniversity = data.get("other-university-input-text") ?? ""
  const payImg = data.get("pay") as File
  const menu = "Hamburguesa" //data.get("menu")

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
    !payImg ||
    !menu
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

  try {
    await turso.execute(
      "INSERT INTO participants (id, name, dni, email,phone, ig_username, find_us, under_age, disability, work, university, experience, pay_ref, pay_img, menu) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        id.toString(),
        name?.toString(),
        dni?.toString(),
        email?.toString(),
        phone?.toString(),
        igUsername?.toString(),
        findUs?.toString(),
        underAge?.toString(),
        disability?.toString(),
        work === "Otro" ? otherWork.toString() : work.toString(),
        university === "Otro"
          ? otherUniversity?.toString()
          : university?.toString(),
        experience?.toString(),
        ref?.toString(),
        rename,
        menu.toString(),
      ],
    )

    const blob = await put(`pays/${rename}`, payImg, {
      access: "private",
      token: import.meta.env.BLOB_READ_WRITE_TOKEN,
    })

    const { rows } = await turso.execute({
      sql: "SELECT * FROM participants WHERE id = ?",
      args: [id],
    })

    const body = `
    <!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Confirmación de Inscripción</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, Helvetica, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4; padding:20px 0;">
  <tr>
    <td align="center">

      <!-- Contenedor principal -->
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">

        <!-- Header -->
        <tr>
          <td align="center" style="background-color:#000000; padding:30px;">
            <h1 style="color:#ffffff; margin:0; font-size:22px;">
              Master Class Edición Audiovisual
            </h1>
          </td>
        </tr>

        <!-- Contenido -->
        <tr>
          <td style="padding:30px; color:#333333; font-size:15px; line-height:1.6;">

            <p style="margin-top:0;">
              Hola <strong>${name}</strong>,
            </p>

            <p>
              Tu inscripción ha sido <strong>confirmada exitosamente</strong>.  
              ¡Gracias por formar parte de esta experiencia formativa!
            </p>

            <hr style="border:none; border-top:1px solid #eeeeee; margin:25px 0;">

            <h3 style="margin-bottom:10px;">📍 Detalles del Evento</h3>

            <p style="margin:5px 0;">
              <strong>Fecha:</strong> viernes, 13 de marzo
            </p>
            <p style="margin:5px 0;">
              <strong>Hora:</strong> 1:30 p. m. - 4:00 p. m.
            </p>
            <p style="margin:5px 0;">
              <strong>Lugar:</strong> Lotería de Oriente
            </p>

            <hr style="border:none; border-top:1px solid #eeeeee; margin:25px 0;">

            <h3 style="margin-bottom:10px;">🎁 Recuerda que tu inscripción incluye:</h3>

            <ul style="padding-left:18px; margin-top:0;">
              <li>Certificado de participación</li>
              <li>Guía digital de apoyo</li>
              <li>Acceso a CapCut Pro por 1 mes</li>
              <li>Recursos audiovisuales descargables</li>
            </ul>

            <p>
              Si deseas practicar durante la sesión, puedes llevar tu laptop (no es obligatorio).
            </p>

            <!-- Botón -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0;">
              <tr>
                <td align="center">
                  <a href="https://chat.whatsapp.com/CWWSP5aAnsqBWWraHhxND3?mode=gi_t"
                  target='_blank'
                     style="background-color:#000000; color:#ffffff; padding:12px 25px; text-decoration:none; border-radius:5px; font-size:14px; display:inline-block;">
                     Contactar por WhatsApp
                  </a>
                </td>
              </tr>
            </table>

            <p>
              Nos vemos pronto para vivir una jornada de aprendizaje práctico y profesional.
            </p>

            <p>
              Saludos,<br>
              <strong>Jorge Maurera</strong><br>
              Caché Marketing<br>
              Transformamos ideas en resultados
            </p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="background-color:#f9f9f9; padding:20px; font-size:12px; color:#777777;">
            © 2026 Caché Marketing<br>
            Este correo fue enviado como confirmación de tu inscripción.
          </td>
        </tr>

      </table>
      <!-- Fin contenedor -->

    </td>
  </tr>
</table>

</body>
</html>
    
    `

    await sendEmail({
      to: email.toString(),
      subject: "Confirmación de inscripción | Master Class Edición Audiovisual",
      body: body,
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
