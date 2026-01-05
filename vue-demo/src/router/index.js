import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// import Home from '@/views/Home.vue'
// import HomeView from '../views/HomeView.vue'

import Loginbackground from '@/views/Loginbackground.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Resetpassword from '@/views/Resetpassword.vue'
import Forgotpassword from '@/views/Forgotpassword.vue'
import Forgotpasswordreset from '@/views/Forgotpasswordreset.vue'

import Dashboard from '@/views/Dashboard.vue'
import Updprofiles from '@/views/Updprofiles.vue'
import Calendarevent from '@/views/Calendarevent.vue'
import Calendardashboard from '@/views/Calendardashboard.vue'
// import Calculator from '@/views/Calculator.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
        {
          path: 'forgotpassword',
          name: 'Forgotpassword',
          component: Forgotpassword,
        },
        {
          path: 'forgotpasswordreset',
          name: 'Forgotpasswordreset',
          component: Forgotpasswordreset,
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
        // {
        //   path: 'calculator',
        //   name: 'Calculator',
        //   component: Calculator,
        // },
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
