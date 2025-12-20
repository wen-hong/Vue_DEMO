import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from '../views/Login.vue'
import Home from '@/views/Home.vue'
import { useAuthStore } from '../stores/auth'
import Register from '@/views/Register.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/',
    //   name: 'home',
    //   component: HomeView,
    // },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      component: Register,
      meta: { guestOnly: true },
    },
    {
      path: '/',
      component: Home,
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.isLogin && to.meta.requiresAuth) {
    return '/login'
  }

  if (auth.isLogin && to.meta.guestOnly) {
    return '/'
  }
})

export default router
