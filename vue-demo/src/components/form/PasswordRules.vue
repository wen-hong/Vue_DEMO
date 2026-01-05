<template>
  <ul class="rules">
    <li :class="{ valid: rules.length }">至少 6 個字元</li>
    <li :class="{ valid: rules.uppercase }">至少一個大寫字母</li>
    <li :class="{ valid: rules.lowercase }">至少一個小寫字母</li>
    <li :class="{ valid: rules.number }">至少一個數字</li>
    <li :class="{ valid: rules.special }">至少一個特殊字元</li>
  </ul>
</template>

<script setup>
defineProps({
  rules: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.rules {
  list-style: none;
  padding-left: 0;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.rules li {
  color: #999;
}

.rules li.valid {
  color: #28a745;
}
</style>
