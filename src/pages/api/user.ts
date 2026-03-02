import { API_URL } from "@/lib/const"
import { clerkClient } from "@clerk/astro/server"
import type { APIRoute } from "astro"

export async function GET(context: any) {
  const { isAuthenticated, userId, redirectToSignIn, getToken } =
    context.locals.auth()

  if (!isAuthenticated) {
    return redirectToSignIn()
  }

  const token = await getToken()

  const user = await clerkClient(context).users.getUser(userId)

  return new Response(JSON.stringify({ user, token }))
}

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData()
  const id = data.get("id")
  const name = data.get("fullname")
  const docId = data.get("doc-id")
  const email = data.get("email")
  const phone = data.get("phone")
  const igUsername = data.get("ig-input")
  const howFindUs = data.get("how-find-us")
  const birthday = data.get("birthday")
  const disability = data.get("disability")
  const occupationStatus = data.get("occupation-status") ?? ""
  const university = data.get("university") ?? ""
  const otherOccupationStatus =
    data.get("other-occupation-status-input-text") ?? ""
  const otherUniversity = data.get("other-university-input-text") ?? ""

  if (
    !id ||
    !name ||
    !docId ||
    !email ||
    !phone ||
    !igUsername ||
    !howFindUs ||
    !birthday ||
    !disability ||
    !occupationStatus ||
    !university
  ) {
    return new Response(
      JSON.stringify({
        message: "Error missing required fields",
      }),
      { status: 400 },
    )
  }

  const res = await fetch(`${API_URL}/api/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      fullName: name,
      docId,
      email,
      phone,
      birthday,
      occupationStatus:
        occupationStatus === "" ? otherOccupationStatus : occupationStatus,
      university: university === "" ? otherUniversity : university,
      howFindUs,
      disability,
      igUsername,
    }),
  })

  return new Response(
    JSON.stringify({
      message: "success",
    }),
    { status: 200 },
  )
}
