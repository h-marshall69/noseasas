import { createRouter, createWebHistory } from 'vue-router'
import { getRoutes } from './router/routes'
import CryptoJS from 'crypto-js'
import { ApiOrigenLogin } from './config/Api'
// Bandera para no repetir autenticación
let authHandled = false

function waitForSharedAuth(timeoutMs = 3000) {
    return Promise.race([
        new Promise((resolve, reject) => {
            const handleMessage = (event) => {
                const auth = event.data
                if (!auth?.sharedAuth) return

                try {
                    const decrypted = CryptoJS.AES.decrypt(auth.sharedAuth, "123456789").toString(CryptoJS.enc.Utf8)
                    const jsonData = JSON.parse(decrypted)
                    sessionStorage.setItem("access_token", jsonData.token)
                    sessionStorage.setItem("accses", JSON.stringify(jsonData))

                    window.removeEventListener("message", handleMessage)
                    authHandled = true
                    resolve(true)
                } catch (err) {
                    window.removeEventListener("message", handleMessage)
                    reject(err)
                }
            }

            window.addEventListener("message", handleMessage)

            try {
                window.opener?.postMessage("SHARED-AUTH", "*")
            } catch (err) {
                window.removeEventListener("message", handleMessage)
                reject(new Error("No se pudo contactar con window.opener"))
            }
        }),
        new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Timeout esperando mensaje")), timeoutMs)
        })
    ])
}

// ✅ Creamos y devolvemos el router con rutas dinámicas ya cargadas
export async function setupRouter() {
    const routes = await getRoutes()

    const router = createRouter({
        //   history: createWebHistory(),
        history: createWebHistory(import.meta.env.VITE_APP_BASE_URL), 

        routes
    })

    router.beforeEach(async (to, from, next) => {
        let token = sessionStorage.getItem('access_token')

        if (to.meta.requiresAuth) {
            if (!token && !authHandled) {
                try {
                    await waitForSharedAuth()
                    sessionStorage.getItem('access_token')
                    return window.location.href = 'inicio'
                } catch (error) {
                    console.error("Autenticación fallida:", error.message)
                    return window.location.href = ApiOrigenLogin
                }
            }

            if (!token) return window.location.href = ApiOrigenLogin
        }

        return next()
    })

    return router
}



