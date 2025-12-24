import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from '../views/Login.vue'
import Loginbackground from '@/views/Loginbackground.vue'
import Home from '@/views/Home.vue'
import Dashboard from '@/views/Dashboard.vue'
import { useAuthStore } from '../stores/auth'
import Register from '@/views/Register.vue'
import Updprofiles from '@/views/Updprofiles.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/',
    //   name: 'home',
    //   component: HomeView,
    // },
    // {
    //   path: '/login',
    //   name: 'Login',
    //   component: Login,
    //   meta: { guestOnly: true },
    // },
    {
      path: '/loginbackground',
      name: 'Loginbackground',
      component: Loginbackground,
      meta: { guestOnly: true },
      children: [
        {
          path: 'login',
          name: 'Login',
          component: Login,
        },
        {
          path: 'register',
          name: 'Register',
          component: Register,
        },
      ],
    },
    // {
    //   path: '/register',
    //   component: Register,
    //   meta: { guestOnly: true },
    // },
    // {
    //   path: '/',
    //   component: Home,
    //   meta: { requiresAuth: true },
    // },
    // {
    //   path: '/about',
    //   name: 'about',
    //   component: () => import('../views/AboutView.vue'),
    //   meta: { requiresAuth: true },
    // },
    {
      path: '/dashboard',
      component: Dashboard,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'updprofiles',
          name: 'Updprofiles',
          component: Updprofiles,
        },
      ],
    },
    {
      path: '/',
      redirect: '/dashboard', // ⭐ 關鍵
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // 等待 auth 初始化完成
  if (!auth.isReady) {
    await auth.init()
  }

  if (!auth.isLogin && to.meta.requiresAuth) {
    // return '/login'
    return '/loginbackground/login'
  }

  if (auth.isLogin && to.meta.guestOnly) {
    // return '/'
    return '/dashboard'
  }
})

export default router
