// import { createRouter, createWebHistory } from 'vue-router'
// import { useAuthStore } from '../stores/auth'

// // import Home from '@/views/Home.vue'
// // import HomeView from '../views/HomeView.vue'

// import Loginbackground from '@/views/Loginbackground.vue'
// import Login from '@/views/Login.vue'
// import Register from '@/views/Register.vue'
// import Resetpassword from '@/views/Resetpassword.vue'
// import Forgotpassword from '@/views/Forgotpassword.vue'
// import Forgotpasswordreset from '@/views/Forgotpasswordreset.vue'

// import Dashboard from '@/views/Dashboard.vue'
// import Updprofiles from '@/views/Updprofiles.vue'
// import Calendarevent from '@/views/Calendarevent.vue'
// import Calendardashboard from '@/views/Calendardashboard.vue'
// // import Calculator from '@/views/Calculator.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(),
  routes: [
    {
      path: '/loginbackground',
      name: 'Loginbackground',
      component: () => import('@/views/Loginbackground.vue'),
      meta: { guestOnly: true },
      children: [
        {
          path: 'login',
          name: 'Login',
          component: () => import('@/views/Login.vue'),
        },
        {
          path: 'register',
          name: 'Register',
          component: () => import('@/views/Register.vue'),
        },
        {
          path: 'forgotpassword',
          name: 'Forgotpassword',
          component: () => import('@/views/Forgotpassword.vue'),
        },
        {
          path: 'forgotpasswordreset',
          name: 'Forgotpasswordreset',
          component: () => import('@/views/Forgotpasswordreset.vue'),
        },
      ],
    },
    {
      path: '/inloginbackground',
      name: 'inLoginbackground',
      component: () => import('@/views/Loginbackground.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'resetpassword',
          name: 'Resetpassword',
          component: () => import('@/views/Resetpassword.vue'),
        },
      ],
    },
    {
      path: '/dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'updprofiles',
          name: 'Updprofiles',
          component: () => import('@/views/Updprofiles.vue'),
        },
        {
          path: 'calendarevent',
          name: 'Calendarevent',
          component: () => import('@/views/Calendarevent.vue'),
        },
        {
          path: 'calendardashboard',
          name: 'Calendardashboard',
          component: () => import('@/views/Calendardashboard.vue'),
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
      redirect: '/dashboard',
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
