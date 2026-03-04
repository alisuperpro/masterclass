import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server"
import { API_URL } from "./lib/const"

const isProtectedRoute = createRouteMatcher([
  "/perfil(.*)",
  "/informacion-adicional(.*)",
  "/audiovisual/formulario(.*)",
])

const isInfoAdditionalRoute = createRouteMatcher(["/informacion-adicional(.*)"])

export const onRequest = clerkMiddleware(async (auth, context, next) => {
  const { isAuthenticated, redirectToSignIn, userId, getToken } = auth()
  const url = new URL(context.request.url)

  // Si no está autenticado y es ruta protegida, redirigir al login
  if (!isAuthenticated && isProtectedRoute(context.request)) {
    return redirectToSignIn()
  }

  // Si está autenticado y es ruta protegida (excluyendo info-adicional)
  if (
    userId &&
    isProtectedRoute(context.request) &&
    !isInfoAdditionalRoute(context.request)
  ) {
    try {
      const token = await getToken()
      const result = await verifyUserData({ userId, token })

      // Si el usuario no tiene información (404), redirigir a info-adicional
      // guardando la URL original como parámetro
      if (result.res.status === 404) {
        const redirectUrl = `/informacion-adicional?redirect=${encodeURIComponent(url.pathname)}`
        return context.redirect(redirectUrl)
      }

      return next()
    } catch (error) {
      console.error("Error verificando usuario:", error)
      return next()
    }
  }

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
