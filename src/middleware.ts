import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server"
import { API_URL } from "./lib/const"

const isProtectedRoute = createRouteMatcher([
  "/perfil(.*)",
  "/informacion-adicional(.*)",
  "/audiovisual/formulario(.*)",
])

const isInfoAdditionalRoute = createRouteMatcher(["/informacion-adicional(.*)"])
const isProfileRoute = createRouteMatcher(["/perfil(.*)"])

export const onRequest = clerkMiddleware(async (auth, context, next) => {
  const { isAuthenticated, redirectToSignIn, userId, getToken } = auth()

  if (!isAuthenticated && isProtectedRoute(context.request)) {
    return redirectToSignIn()
  }

  if (
    userId &&
    isProtectedRoute(context.request) &&
    !isInfoAdditionalRoute(context.request)
  ) {
    try {
      const token = await getToken()
      const result = await verifyUserData({ userId, token })

      if (result.res.status === 404) {
        return context.redirect("/informacion-adicional")
      }

      return next()
    } catch (error) {
      console.error("Error verificando usuario:", error)
      return next() // En caso de error, continuar (o podrías mostrar una página de error)
    }
  }

  // Para cualquier otro caso, continuar
  return next()
})

export async function verifyUserData({
  userId,
  token,
}: {
  userId: string | null
  token: string | null
}) {
  const res = await fetch(`${API_URL}/api/user/me/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  const json = await res.json()
  return { res, json }
}
