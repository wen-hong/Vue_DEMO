import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// import Home from '@/views/Home.vue'
// import HomeView from '../views/HomeView.vue'

import Loginbackground from '@/views/Loginbackground.vue'
import Login from '../views/Login.vue'
import Register from '@/views/Register.vue'
import Resetpassword from '@/views/Resetpassword.vue'

import Dashboard from '@/views/Dashboard.vue'
import Updprofiles from '@/views/Updprofiles.vue'
import Calendarevent from '@/views/Calendarevent.vue'
import Calendardashboard from '@/views/Calendardashboard.vue'

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
    {
      path: '/inloginbackground',
      name: 'inLoginbackground',
      component: Loginbackground,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'resetpassword',
          name: 'Resetpassword',
          component: Resetpassword,
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
        {
          path: 'calendarevent',
          name: 'Calendarevent',
          component: Calendarevent,
        },
        {
          path: 'calendardashboard',
          name: 'Calendardashboard',
          component: Calendardashboard,
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
