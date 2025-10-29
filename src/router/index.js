import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import TakePhoto from '../views/TakePhoto.vue'
import FaceDetection from '../views/FaceDetection.vue'
import Crud from '../views/Crud.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/take-photo',
      name: 'TakePhoto',
      component: TakePhoto
    },
    {
      path: '/face-detection',
      name: 'FaceDetection',
      component: FaceDetection
    },
    {
      path: '/crud',
      name: 'crud-fotos',
      component: Crud
    }
  ],
})

export default router

