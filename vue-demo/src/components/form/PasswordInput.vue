<template>
  <div class="input-group">
    <input
      :type="visible ? 'text' : 'password'"
      class="form-control"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :required="required"
    />
    <button type="button" class="btn btn-outline-secondary" @click="visible = !visible">
      <i :class="visible ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: String,
  placeholder: {
    type: String,
    default: '請輸入密碼',
  },
  required: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])

const visible = ref(false)
</script>
