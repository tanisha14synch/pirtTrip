/** Fixed local dev ports — do not use random fallback ports. */
export const DEV_FRONTEND_PORT = 3000
export const DEV_BACKEND_PORT = 3001

export const DEV_FRONTEND_URL = `http://localhost:${DEV_FRONTEND_PORT}`
export const DEV_BACKEND_URL = `http://127.0.0.1:${DEV_BACKEND_PORT}`
export const DEV_PARTNER_URL = `http://business.localhost:${DEV_FRONTEND_PORT}`
