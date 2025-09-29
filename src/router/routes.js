import NotFound from '../components/layouts/NotFound.vue'
import Dasboard from '../views/Dasboard.vue'
import DefaultLayout from '../components/layouts/DefaultLayout.vue'
import { ApiGetModulos } from '../config/Api'
import axios from 'axios'

export const componentRegistry = {
  TomarFoto: () => import('../views/TomarFoto/TomarFoto.vue'),
}

// Solo la ruta de inicio es estática
const staticChildren = [
  {
    path: '', // Esto captura la ruta raíz dentro del layout
    redirect: 'inicio' //  Redirige a /inicio
  },
  { path: 'inicio', name: 'Dashboard', component: Dasboard }
]

// Convierte "Consulta Carnet Universitario" -> "ConsultaCarnetUniversitario"
function nameToComponentFile(name) {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

// Carga dinámica del componente según el name del módulo
export async function loadComponentByName(name) {
  const key = nameToComponentFile(name)

  const loader = componentRegistry[key]
  if (!loader) {
    console.warn(` Componente "${key}" no registrado. Se usará NotFound.`)
    return NotFound
  }

  try {
    const module = await loader()
    return module.default || module
  } catch (error) {
    console.error(` Error cargando "${key}.vue":`, error)
    return NotFound
  }
}

// Construye rutas dinámicas a partir de los módulos
async function buildDynamicRoutesFromModulos(modulos_get) {
  // Recuperas el moduleId desde el storage
  const data = JSON.parse(sessionStorage.getItem('accses'))
  const moduleId = data?.moduleId

  // Determina los módulos a procesar
  const modulos = moduleId
    ? modulos_get.filter(m => m.id === moduleId)
    : modulos_get

  // Aplana todos los children válidos en un solo array
  const allChildren = modulos.flatMap(m => m.children || [])
    .filter(c => c?.uiPath && c?.name) // descartar inválidos
    .map(c => {
      const path = new URL(c.uiPath, window.location.origin).pathname
      const cleanPath = path.replace(/\/{2,}/g, '/').replace(/^\/+/, '')
      return { ...c, cleanPath }
    })
    .filter(c => c.cleanPath.toLowerCase() !== 'inicio') // descartar inicio

  // Cargar componentes en paralelo
  const components = await Promise.all(
    allChildren.map(c => loadComponentByName(c.name))
  )

  // Construir rutas
  return allChildren.map((c, i) => ({
    path: c.cleanPath,
    name: c.name,
    icon: c.iconPath ?? null,
    component: components[i].default || components[i],
    meta: {
      requiresAuth: true,
      operations: Number(c.operations) || 0
    }
  }))
}
// Devuelve todas las rutas del sistema
export async function getRoutes() {
  const token = sessionStorage.getItem('access_token')
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  }

  try {
    const response = await axios.get(ApiGetModulos, config)
    const modulos = response.data.data

    const dynamicChildren = await buildDynamicRoutesFromModulos(modulos)

    return [
      {
        path: '/',
        component: DefaultLayout,
        meta: { requiresAuth: true },
        children: [
          ...staticChildren,
          ...dynamicChildren
        ]
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound
      }
    ]
  } catch (error) {
    console.error('Error cargando módulos:', error)
    return [
      {
        path: '/',
        component: DefaultLayout,
        meta: { requiresAuth: true },
        children: [...staticChildren]
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound
      }
    ]
  }
}
