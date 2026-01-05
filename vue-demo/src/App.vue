<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  const hash = window.location.hash
  if (!hash) return

  const params = new URLSearchParams(hash.substring(1))
  const type = params.get('type')

  if (type === 'recovery') {
    router.replace({
      path: '/loginbackground/forgotpasswordreset',
      query: {
        hash: hash.substring(1),
      },
    })
  }
})
</script>

<template>
  <router-view />
</template>
